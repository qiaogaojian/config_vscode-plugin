import type { Mention } from '@openctx/client'
import {
    type ContextItem,
    type ContextItemOpenCtx,
    type ContextItemRepository,
    FILE_CONTEXT_MENTION_PROVIDER,
    type MentionQuery,
    REMOTE_REPOSITORY_PROVIDER_URI,
    SYMBOL_CONTEXT_MENTION_PROVIDER,
    openCtx,
} from '@sourcegraph/cody-shared'
import * as vscode from 'vscode'
import { URI } from 'vscode-uri'
import { getContextFileFromUri } from '../../commands/context/file-path'
import {
    getFileContextFiles,
    getOpenTabsContextFile,
    getSymbolContextFiles,
} from '../../editor/utils/editor-context'

export interface GetContextItemsTelemetry {
    empty: () => void
    withProvider: (type: MentionQuery['provider'], metadata?: { id: string }) => void
}

interface GetContextItemsOptions {
    mentionQuery: MentionQuery

    // Logging: log when the at-mention starts, and then log when we know the type (after the 1st
    // character is typed). Don't log otherwise because we would be logging prefixes of the same
    // query repeatedly, which is not needed.
    telemetryRecorder?: GetContextItemsTelemetry

    remoteRepositoriesNames?: string[]
    rangeFilter?: boolean
}

export async function getChatContextItemsForMention(
    options: GetContextItemsOptions
): Promise<ContextItem[]> {
    const MAX_RESULTS = 20
    const { mentionQuery, telemetryRecorder, remoteRepositoriesNames, rangeFilter = true } = options

    switch (mentionQuery.provider) {
        case null:
            telemetryRecorder?.empty()
            return getOpenTabsContextFile()
        case SYMBOL_CONTEXT_MENTION_PROVIDER.id:
            telemetryRecorder?.withProvider(mentionQuery.provider)
            // It would be nice if the VS Code symbols API supports cancellation, but it doesn't
            return getSymbolContextFiles(mentionQuery.text, MAX_RESULTS, remoteRepositoriesNames)
        case FILE_CONTEXT_MENTION_PROVIDER.id: {
            telemetryRecorder?.withProvider(mentionQuery.provider)
            const files = mentionQuery.text
                ? await getFileContextFiles({
                      query: mentionQuery.text,
                      range: mentionQuery.range,
                      maxResults: MAX_RESULTS,
                      repositoriesNames: remoteRepositoriesNames,
                  })
                : await getOpenTabsContextFile()

            // If a range is provided, that means user is trying to mention a specific line range.
            // We will get the content of the file for that range to display file size warning if needed.
            if (mentionQuery.range && files.length > 0 && rangeFilter) {
                const item = await getContextFileFromUri(
                    files[0].uri,
                    new vscode.Range(mentionQuery.range.start.line, 0, mentionQuery.range.end.line, 0)
                )
                return item ? [item] : []
            }

            return files
        }

        default: {
            telemetryRecorder?.withProvider('openctx', { id: mentionQuery.provider })

            if (!openCtx.controller) {
                return []
            }

            const items = await openCtx.controller.mentions(
                { query: mentionQuery.text },
                // get mention items for the selected provider only.
                { providerUri: mentionQuery.provider }
            )

            return items.map((item): ContextItemOpenCtx | ContextItemRepository =>
                contextItemMentionFromOpenCtxItem(item)
            )
        }
    }
}

export function contextItemMentionFromOpenCtxItem(
    item: Mention & { providerUri: string }
): ContextItemOpenCtx | ContextItemRepository {
    // HACK: The OpenCtx protocol does not support returning isIgnored
    // and it does not make sense to expect providers to return disabled
    // items. That is why we are using `item.data?.ignored`. We only need
    // this for our internal Sourcegraph Repositories provider.
    const isIgnored = item.data?.isIgnored as boolean | undefined

    return item.providerUri === REMOTE_REPOSITORY_PROVIDER_URI
        ? ({
              type: 'repository',
              uri: URI.parse(item.uri),
              isIgnored,
              title: item.title,
              repoName: item.title,
              repoID: item.data!.repoId as string,
              provider: 'openctx',
              content: null,
          } satisfies ContextItemRepository)
        : ({
              type: 'openctx',
              uri: URI.parse(item.uri),
              isIgnored,
              title: item.title,
              providerUri: item.providerUri,
              provider: 'openctx',
              mention: {
                  uri: item.uri,
                  data: item.data,
                  description: item.description,
              },
          } satisfies ContextItemOpenCtx)
}
