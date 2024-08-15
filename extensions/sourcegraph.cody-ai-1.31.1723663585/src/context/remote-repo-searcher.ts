import fuzzysort from 'fuzzysort'
import * as vscode from 'vscode'
import { type Repo, type RepoFetcher, RepoFetcherState } from './repo-fetcher'

interface RemoteRepoListResult {
    repos: Repo[]
    startIndex: number
    count: number
    state: RepoFetcherState
    lastError: Error | undefined
}

/**
 * Searches a remote repo list and provides paginated results.
 */
export class RemoteRepoSearcher implements vscode.Disposable {
    // Marker that we haven't cached a user query.
    private static readonly NO_QUERY = 'NO_QUERY_CACHED'

    private disposables: vscode.Disposable[] = []

    // The query that we last performed. We cache fuzzy search results to
    // provide a stable, paginated list of results.
    private cachedQuery: string | undefined = RemoteRepoSearcher.NO_QUERY

    // If cachedQuery is not NO_QUERY, the matching results.
    private cachedResult: readonly Repo[] = []

    // Index of fuzzysort targets.
    private fuzzyIndex: Fuzzysort.Prepared[] | undefined = undefined

    // Map from fuzzysort targets to repository results.
    private fuzzyTargetRepoMap: Map<string, Repo> | undefined = undefined

    // Fired when the underlying repo list changes, indicating our results may
    // have been invalidated.
    private repoListChangedEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>()

    // Fired when the underlying repo fetching changes state.
    private fetchStateChangedEmitter: vscode.EventEmitter<{ state: RepoFetcherState; error?: Error }> =
        new vscode.EventEmitter()

    /**
     * Creates a RemoteRepoSearcher.
     * @param fetcher the RepoFetcher to use. RemoteRepoSearcher will not
     * dispose of this fetcher.
     */
    constructor(private readonly fetcher: RepoFetcher) {
        this.disposables.push(
            this.repoListChangedEmitter,
            this.fetcher.onRepoListChanged(() => {
                // The repo list has changed, so reset all of the cached state.
                this.cachedQuery = RemoteRepoSearcher.NO_QUERY
                this.cachedResult = []
                this.fuzzyIndex = undefined
                this.fuzzyTargetRepoMap = undefined
                this.repoListChangedEmitter.fire()
            }),
            this.fetcher.onStateChanged((state: RepoFetcherState) => {
                this.fetchStateChangedEmitter.fire({ state, error: this.fetcher.lastError })
            })
        )
    }

    public dispose(): void {
        for (const disposable of this.disposables) {
            disposable.dispose()
        }
    }

    /**
     * The underlying repo list fetching has changed state. Use this to display
     * an indeterminate progress indicator while results are being fetched, and
     * to collect errors, if any.
     */
    public get onFetchStateChanged(): vscode.Event<{ state: RepoFetcherState; error?: Error }> {
        return this.fetchStateChangedEmitter.event
    }

    /**
     * The underlying repo list has changed. Use this to invalidate results
     * displayed from `list`.
     */
    public get onRepoListChanged(): vscode.Event<void> {
        return this.repoListChangedEmitter.event
    }

    /**
     * Search the available repository list and provide a paginated result.
     * Repeated searches with the same query and repo list are cached, so
     * accessing subsequent pages is fast.
     *
     * @param query the fuzzy search query, if any.
     * @param first the number of results to retrieve.
     * @param after the repository ID of the last repo of the previous page.
     * @returns a list of repositories with their position in the complete
     * filtered list.
     */
    public list(query: string | undefined, first: number, after?: string): RemoteRepoListResult {
        this.ensureCompleteOrFetching()
        // If we haven't cached this result, execute the query.
        if (query !== this.cachedQuery) {
            this.cachedQuery = query
            this.updateCachedResult(query)
        }
        // Find the start index, if any.
        let start: number
        if (after) {
            const afterIndex = this.cachedResult.findIndex(repo => repo.id === after)
            if (afterIndex === -1) {
                // The after ID doesn't exist in the list, so there's nothing "after" that.
                return {
                    repos: [],
                    startIndex: -1,
                    count: this.cachedResult.length,
                    state: this.fetcher.state,
                    lastError: this.fetcher.lastError,
                }
            }
            start = afterIndex + 1
        } else {
            start = 0
        }
        // Return the subset of results
        return {
            repos: this.cachedResult.slice(start, start + first),
            startIndex: start,
            count: this.cachedResult.length,
            state: this.fetcher.state,
            lastError: this.fetcher.lastError,
        }
    }

    private updateCachedResult(query: string | undefined): void {
        if (!query) {
            // No query, so we return all repos in fetch order.
            this.cachedResult = this.fetcher.repositories
            return
        }

        if (!this.fuzzyIndex || !this.fuzzyTargetRepoMap) {
            // Update the fuzzy search index.
            this.fuzzyIndex = []
            this.fuzzyTargetRepoMap = new Map()
            for (const repo of this.fetcher.repositories) {
                const prepared = fuzzysort.prepare(repo.name)
                this.fuzzyTargetRepoMap.set(prepared.target, repo)
                this.fuzzyIndex.push(prepared)
            }
        }

        // Do fuzzy search.
        const result = fuzzysort.go(query, this.fuzzyIndex, {
            threshold: -1000,
        })
        // Evident that fuzzyRepoTargetMap is initialized above.
        // fuzzyRepoTargetMap contains an entry for every prepared target.
        this.cachedResult = result.map(r => this.fuzzyTargetRepoMap?.get(r.target)!)
    }

    /**
     * Gets whether `repoName` is a remote repository. This tracks the loading
     * state and will wait for loading to finish before resolving, if necessary.
     * If the configuration changes or fetching is paused while waiting,
     * rejects.
     *
     * @param repoName the repository to search for.
     * @returns A Promise which resolves `true` (`false`) if the remote
     * repository does (doesn't) exist. Otherwise, rejects. Rejections are
     * common: Network errors, configuration changes, etc.
     */
    public async has(repoName: string): Promise<boolean> {
        this.ensureCompleteOrFetching()
        let startIndex = 0
        const searchStep = (): boolean => {
            for (; startIndex < this.fetcher.repositories.length; startIndex++) {
                if (this.fetcher.repositories[startIndex].name === repoName) {
                    return true
                }
            }
            return false
        }
        if (searchStep()) {
            return true
        }
        if (this.fetcher.state === RepoFetcherState.Complete) {
            return false
        }
        return new Promise((rawResolve, rawReject) => {
            const disposables: vscode.Disposable[] = []
            const resolve = (result: boolean) => {
                vscode.Disposable.from(...disposables).dispose()
                rawResolve(result)
            }
            const reject = (error: Error) => {
                vscode.Disposable.from(...disposables).dispose()
                rawReject(error)
            }
            disposables.push(
                this.onRepoListChanged(() => {
                    if (searchStep()) {
                        resolve(true)
                    }
                }),
                this.onFetchStateChanged(state => {
                    switch (state.state) {
                        case RepoFetcherState.Complete:
                            resolve(searchStep())
                            break
                        case RepoFetcherState.Errored:
                            if (searchStep()) {
                                resolve(true)
                                return
                            }
                            reject(
                                new Error(`repo fetcher errored while waiting for "has" (${repoName})`, {
                                    cause: state.error,
                                })
                            )
                            break
                        case RepoFetcherState.Paused:
                            reject(
                                new Error(`repo fetcher paused while waiting for "has" (${repoName})`)
                            )
                            break
                    }
                })
            )
        })
    }

    // Ensures that if the fetcher hasn't finished retrieving repos, that it
    // will resume.
    private ensureCompleteOrFetching(): void {
        if (
            this.fetcher.state !== RepoFetcherState.Complete &&
            this.fetcher.state !== RepoFetcherState.Fetching
        ) {
            // TODO: There's a dependency between RemoteRepoPicker, which
            // starts and pauses the repo fetcher, and this RemoteRepoSearcher
            // which also starts the fetcher. Currently RemoteRepoSearcher is
            // only used by Agent and RemoteRepoPicker is only used by VSCode.
            // When RemoteRepoSearcher and RemoteRepoPicker are used at the same
            // time, clarify this dependency. Simplest thing is to remove
            // 'pause' and let the fetcher fetch and cache all the repos. Need
            // to audit the change callbacks to make sure they can be called
            // when the picker/searcher is not in use.
            this.fetcher.resume()
        }
    }
}
