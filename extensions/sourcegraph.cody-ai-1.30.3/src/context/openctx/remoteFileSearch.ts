import type { Item, Mention } from '@openctx/client'
import {
    REMOTE_FILE_PROVIDER_URI,
    contextFiltersProvider,
    displayPathBasename,
    graphqlClient,
    isDefined,
    isError,
} from '@sourcegraph/cody-shared'
import { URI } from 'vscode-uri'

import type { OpenCtxProvider } from './types'

const RemoteFileProvider = createRemoteFileProvider()

export function createRemoteFileProvider(customTitle?: string): OpenCtxProvider {
    return {
        providerUri: REMOTE_FILE_PROVIDER_URI,

        meta() {
            return {
                name: customTitle ?? 'Remote Files',
                mentions: {},
            }
        },

        async mentions({ query }) {
            const [repoName, filePath] = query?.split(':') || []

            if (!query?.includes(':') || !repoName.trim()) {
                return await getRepoMentions(query?.trim())
            }

            return await getFileMentions(repoName, filePath.trim())
        },

        async items({ mention }) {
            if (!mention?.data?.repoName || !mention?.data?.filePath) {
                return []
            }

            return await getFileItem(
                mention.data.repoName as string,
                mention.data.filePath as string,
                mention.data.rev as string
            )
        },
    }
}

async function getRepoMentions(query?: string): Promise<Mention[]> {
    const dataOrError = await graphqlClient.searchRepos(10, undefined, query)

    if (isError(dataOrError) || dataOrError === null) {
        return []
    }

    const repositories = dataOrError.repositories.nodes

    return repositories.map(
        repo =>
            ({
                uri: repo.url,
                title: repo.name,
                description: ' ',
                data: {
                    repoName: repo.name,
                    isIgnored: contextFiltersProvider.isRepoNameIgnored(repo.name),
                },
            }) satisfies Mention
    )
}

async function getFileMentions(repoName: string, filePath?: string): Promise<Mention[]> {
    const repoRe = `^${escapeRegExp(repoName)}$`
    const fileRe = filePath ? escapeRegExp(filePath) : '^.*$'
    const query = `repo:${repoRe} file:${fileRe} type:file count:10`

    const dataOrError = await graphqlClient.searchFileMatches(query)

    if (isError(dataOrError) || dataOrError === null) {
        return []
    }

    return dataOrError.search.results.results
        .map(result => {
            if (result.__typename !== 'FileMatch') {
                return null
            }

            const url = `${graphqlClient.endpoint.replace(/\/$/, '')}${result.file.url}`

            const basename = displayPathBasename(URI.parse(result.file.path))

            return {
                uri: url,
                title: basename,
                description: result.file.path,
                data: {
                    repoName: result.repository.name,
                    rev: result.file.commit.oid,
                    filePath: result.file.path,
                },
            } satisfies Mention
        })
        .filter(isDefined)
}

async function getFileItem(repoName: string, filePath: string, rev = 'HEAD'): Promise<Item[]> {
    const dataOrError = await graphqlClient.getFileContents(repoName, filePath, rev)

    if (isError(dataOrError)) {
        return []
    }

    const file = dataOrError?.repository?.commit?.file
    if (!file) {
        return []
    }

    const url = `${graphqlClient.endpoint.replace(/\/$/, '')}${file.url}`

    return [
        {
            url,
            title: `${repoName}/${file.path}`,
            ai: {
                content: file.content,
            },
        },
    ] satisfies Item[]
}

function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default RemoteFileProvider
