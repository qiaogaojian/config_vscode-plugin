import * as uuid from 'uuid'
import * as vscode from 'vscode'

import {
    type AuthStatus,
    CODY_PASSTHROUGH_VSCODE_OPEN_COMMAND_ID,
    type ChatClient,
    CodyIDE,
    DEFAULT_EVENT_SOURCE,
    type Guardrails,
    editorStateFromPromptString,
    telemetryRecorder,
} from '@sourcegraph/cody-shared'
import type { LocalEmbeddingsController } from '../../local-context/local-embeddings'
import type { SymfRunner } from '../../local-context/symf'
import { logDebug, logError } from '../../log'
import type { MessageProviderOptions } from '../MessageProvider'

import type { URI } from 'vscode-uri'
import type { startTokenReceiver } from '../../auth/token-receiver'
import type { ExecuteChatArguments } from '../../commands/execute/ask'
import { getConfiguration } from '../../configuration'
import type { EnterpriseContextFactory } from '../../context/enterprise-context-factory'
import type { ExtensionClient } from '../../extension-client'
import type { AuthProvider } from '../../services/AuthProvider'
import { type ChatLocation, localStorage } from '../../services/LocalStorageProvider'
import {
    handleCodeFromInsertAtCursor,
    handleCodeFromSaveToNewFile,
} from '../../services/utils/codeblock-action-tracker'
import type { ContextAPIClient } from '../context/contextAPIClient'
import type { SmartApplyResult } from '../protocol'
import {
    ChatController,
    type ChatSession,
    disposeWebviewViewOrPanel,
    revealWebviewViewOrPanel,
    webviewViewOrPanelOnDidChangeViewState,
    webviewViewOrPanelViewColumn,
} from './ChatController'
import { chatHistory } from './ChatHistoryManager'
import type { ContextRetriever } from './ContextRetriever'

export const CodyChatEditorViewType = 'cody.editorPanel'

export interface Options extends MessageProviderOptions {
    extensionUri: vscode.Uri
    startTokenReceiver?: typeof startTokenReceiver
}

export class ChatsController implements vscode.Disposable {
    // Chat view in the panel (typically in the sidebar)
    private panel: ChatController

    // Chat views in editor panels
    private editors: ChatController[] = []
    private activeEditor: ChatController | undefined = undefined

    // We keep track of the currently authenticated account and dispose open chats when it changes
    private currentAuthAccount: undefined | { endpoint: string; primaryEmail: string; username: string }

    protected disposables: vscode.Disposable[] = []

    constructor(
        private options: Options,
        private chatClient: ChatClient,
        private authProvider: AuthProvider,

        private readonly enterpriseContext: EnterpriseContextFactory,
        private readonly localEmbeddings: LocalEmbeddingsController | null,
        private readonly symf: SymfRunner | null,

        private readonly contextRetriever: ContextRetriever,

        private readonly guardrails: Guardrails,
        private readonly contextAPIClient: ContextAPIClient | null,
        private readonly extensionClient: ExtensionClient
    ) {
        logDebug('ChatsController:constructor', 'init')
        this.panel = this.createChatController()

        this.disposables.push(
            this.authProvider.onChange(authStatus => this.setAuthStatus(authStatus), {
                runImmediately: true,
            })
        )
    }

    private async setAuthStatus(authStatus: AuthStatus): Promise<void> {
        const hasLoggedOut = !authStatus.isLoggedIn
        const hasSwitchedAccount =
            this.currentAuthAccount && this.currentAuthAccount.endpoint !== authStatus.endpoint
        if (hasLoggedOut || hasSwitchedAccount) {
            this.disposeAllChats()
        }

        const endpoint = authStatus.endpoint ?? ''
        this.currentAuthAccount = {
            endpoint,
            primaryEmail: authStatus.primaryEmail,
            username: authStatus.username,
        }

        this.panel.setAuthStatus(authStatus)
    }

    public async restoreToPanel(panel: vscode.WebviewPanel, chatID: string): Promise<void> {
        try {
            await this.getOrCreateEditorChatController(chatID, panel.title, panel)
        } catch (error) {
            logDebug('ChatsController', 'restoreToPanel', { error })

            // When failed, create a new panel with restored session and dispose the old panel
            await this.getOrCreateEditorChatController(chatID, panel.title)
            panel.dispose()
        }
    }

    public registerViewsAndCommands() {
        this.disposables.push(
            vscode.window.registerWebviewViewProvider('cody.chat', this.panel, {
                webviewOptions: { retainContextWhenHidden: true },
            })
        )
        const restoreToEditor = async (
            chatID: string,
            chatQuestion?: string
        ): Promise<ChatSession | undefined> => {
            try {
                logDebug('ChatsController', 'debouncedRestorePanel')
                return await this.getOrCreateEditorChatController(chatID, chatQuestion)
            } catch (error) {
                logDebug('ChatsController', 'debouncedRestorePanel', 'failed', error)
                return undefined
            }
        }

        this.disposables.push(
            vscode.commands.registerCommand('cody.chat.moveToEditor', async () => {
                localStorage.setLastUsedChatModality('editor')
                return await this.moveChatFromPanelToEditor()
            }),
            vscode.commands.registerCommand('cody.chat.moveFromEditor', async () => {
                localStorage.setLastUsedChatModality('sidebar')
                return await this.moveChatFromEditorToPanel()
            }),
            vscode.commands.registerCommand('cody.action.chat', args => this.submitChat(args)),
            vscode.commands.registerCommand('cody.chat.signIn', () =>
                vscode.commands.executeCommand('cody.chat.focus')
            ),

            vscode.commands.registerCommand('cody.chat.newPanel', async () => {
                localStorage.setLastUsedChatModality('sidebar')
                const isVisible = this.panel.isVisible()
                await this.panel.clearAndRestartSession()
                if (!isVisible) {
                    await vscode.commands.executeCommand('cody.chat.focus')
                }
            }),
            vscode.commands.registerCommand('cody.chat.newEditorPanel', () => {
                localStorage.setLastUsedChatModality('editor')
                return this.getOrCreateEditorChatController()
            }),
            vscode.commands.registerCommand('cody.chat.new', async () => {
                switch (getNewChatLocation()) {
                    case 'editor':
                        return vscode.commands.executeCommand('cody.chat.newEditorPanel')
                    case 'sidebar':
                        return vscode.commands.executeCommand('cody.chat.newPanel')
                }
            }),

            vscode.commands.registerCommand(
                'cody.chat.toggle',
                async (ops: { editorFocus: boolean }) => {
                    const modality = getNewChatLocation()

                    if (ops.editorFocus) {
                        if (modality === 'sidebar') {
                            await vscode.commands.executeCommand('cody.chat.focus')
                        } else {
                            const editorView = this.activeEditor?.webviewPanelOrView
                            if (editorView) {
                                revealWebviewViewOrPanel(editorView)
                            } else {
                                vscode.commands.executeCommand('cody.chat.newEditorPanel')
                            }
                        }
                    } else {
                        if (modality === 'sidebar') {
                            await vscode.commands.executeCommand(
                                'workbench.action.focusActiveEditorGroup'
                            )
                        } else {
                            await vscode.commands.executeCommand('workbench.action.navigateEditorGroups')
                        }
                    }
                }
            ),
            vscode.commands.registerCommand('cody.chat.history.export', () => this.exportHistory()),
            vscode.commands.registerCommand('cody.chat.history.clear', arg => this.clearHistory(arg)),
            vscode.commands.registerCommand('cody.chat.history.delete', item => this.clearHistory(item)),
            vscode.commands.registerCommand('cody.chat.panel.restore', restoreToEditor),
            vscode.commands.registerCommand(CODY_PASSTHROUGH_VSCODE_OPEN_COMMAND_ID, (...args) =>
                this.passthroughVsCodeOpen(...args)
            ),

            // Mention selection/file commands
            vscode.commands.registerCommand('cody.mention.selection', uri =>
                this.sendEditorContextToChat(uri)
            ),
            vscode.commands.registerCommand('cody.mention.file', uri =>
                this.sendEditorContextToChat(uri)
            ),

            // Codeblock commands
            vscode.commands.registerCommand(
                'cody.command.markSmartApplyApplied',
                (result: SmartApplyResult) => this.sendSmartApplyResultToChat(result)
            ),
            vscode.commands.registerCommand(
                'cody.command.insertCodeToCursor',
                (args: { text: string }) => handleCodeFromInsertAtCursor(args.text)
            ),
            vscode.commands.registerCommand(
                'cody.command.insertCodeToNewFile',
                (args: { text: string }) => handleCodeFromSaveToNewFile(args.text, this.options.editor)
            )
        )
    }

    private async moveChatFromPanelToEditor(): Promise<void> {
        const sessionID = this.panel.sessionID
        await Promise.all([
            this.getOrCreateEditorChatController(sessionID),
            this.panel.clearAndRestartSession(),
        ])
    }

    private async moveChatFromEditorToPanel(): Promise<void> {
        const sessionID = this.activeEditor?.sessionID
        if (!sessionID) {
            return
        }
        await Promise.all([
            this.panel.restoreSession(sessionID),
            vscode.commands.executeCommand('workbench.action.closeActiveEditor'),
        ])
        await vscode.commands.executeCommand('cody.chat.focus')
    }

    private async sendEditorContextToChat(uri?: URI): Promise<void> {
        telemetryRecorder.recordEvent('cody.addChatContext', 'clicked')
        const provider = await this.getActiveChatController()
        if (provider === this.panel) {
            await vscode.commands.executeCommand('cody.chat.focus')
        }
        await provider.handleGetUserEditorContext(uri)
    }

    private async sendSmartApplyResultToChat(result: SmartApplyResult): Promise<void> {
        const provider = await this.getActiveChatController()
        await provider.handleSmartApplyResult(result)
    }

    /**
     * Gets the currently active chat panel provider.
     *
     * If editor panels exist, prefer those. Otherwise, return the sidebar provider.
     *
     * @returns {Promise<ChatController>} The active chat panel provider.
     */
    private async getActiveChatController(): Promise<ChatController> {
        // Check if any existing panel is available
        // NOTE: Never reuse webviews when running inside the agent.
        if (this.activeEditor) {
            if (getConfiguration().isRunningInsideAgent) {
                return await this.getOrCreateEditorChatController()
            }
            return this.activeEditor
        }
        return this.panel
    }

    /**
     * See docstring for {@link CODY_PASSTHROUGH_VSCODE_OPEN_COMMAND_ID}.
     */
    private async passthroughVsCodeOpen(...args: unknown[]): Promise<void> {
        if (args[1] && (args[1] as any).viewColumn === vscode.ViewColumn.Beside) {
            // Make vscode.ViewColumn.Beside work as expected from a webview: open it to the side,
            // instead of always opening a new editor to the right.
            //
            // If the active editor is undefined, that means the chat panel is the active editor, so
            // we will open the file in the first visible editor instead.
            const textEditor = vscode.window.activeTextEditor || vscode.window.visibleTextEditors[0]
            ;(args[1] as any).viewColumn = textEditor ? textEditor.viewColumn : vscode.ViewColumn.Beside
        }
        if (args[1] && Array.isArray((args[1] as any).selection)) {
            // Fix a weird issue where the selection was getting encoded as a JSON array, not an
            // object.
            ;(args[1] as any).selection = new vscode.Selection(
                (args[1] as any).selection[0],
                (args[1] as any).selection[1]
            )
        }
        await vscode.commands.executeCommand('vscode.open', ...args)
    }

    /**
     * Execute a chat request in a new chat panel or the sidebar chat panel.
     */
    private async submitChat({
        text,
        submitType,
        contextFiles,
        addEnhancedContext,
        source = DEFAULT_EVENT_SOURCE,
        command,
    }: ExecuteChatArguments): Promise<ChatSession | undefined> {
        let provider: ChatController
        // If the sidebar panel is visible and empty, use it instead of creating a new panel
        if (submitType === 'user-newchat' && this.panel.isVisible() && this.panel.isEmpty()) {
            provider = this.panel
        } else {
            provider = await this.getOrCreateEditorChatController()
        }
        const abortSignal = provider.startNewSubmitOrEditOperation()
        const editorState = editorStateFromPromptString(text)
        await provider.handleUserMessageSubmission(
            uuid.v4(),
            text,
            submitType,
            contextFiles ?? [],
            editorState,
            addEnhancedContext ?? true,
            abortSignal,
            source,
            command
        )
        return provider
    }

    /**
     * Export chat history to file system
     */
    private async exportHistory(): Promise<void> {
        telemetryRecorder.recordEvent('cody.exportChatHistoryButton', 'clicked')
        const authStatus = this.options.authProvider.getAuthStatus()
        if (authStatus.isLoggedIn) {
            try {
                const historyJson = chatHistory.getLocalHistory(authStatus)
                const exportPath = await vscode.window.showSaveDialog({
                    filters: { 'Chat History': ['json'] },
                })
                if (!exportPath || !historyJson) {
                    return
                }
                const logContent = new TextEncoder().encode(JSON.stringify(historyJson))
                await vscode.workspace.fs.writeFile(exportPath, logContent)
                // Display message and ask if user wants to open file
                void vscode.window
                    .showInformationMessage('Chat history exported successfully.', 'Open')
                    .then(choice => {
                        if (choice === 'Open') {
                            void vscode.commands.executeCommand('vscode.open', exportPath)
                        }
                    })
            } catch (error) {
                logError('ChatsController:exportHistory', 'Failed to export chat history', error)
            }
        }
    }

    private async clearHistory(chatID?: string): Promise<void> {
        const clearAllNoConfirm = chatID === 'clear-all-no-confirm'

        const authProvider = this.options.authProvider
        const authStatus = authProvider.getAuthStatus()

        // delete single chat
        if (chatID) {
            await chatHistory.deleteChat(authStatus, chatID)
            this.disposeChat(chatID, true)
            return
        }

        // delete all chats
        if (!chatID || clearAllNoConfirm) {
            logDebug('ChatsController:clearHistory', 'userConfirmation')

            if (!clearAllNoConfirm) {
                // Show warning to users and get confirmation if they want to clear all history
                const userConfirmation = await vscode.window.showWarningMessage(
                    'Are you sure you want to delete all of your chats?',
                    { modal: true },
                    'Delete All Chats'
                )
                if (!userConfirmation) {
                    return
                }
            }

            await chatHistory.clear(authStatus)
            this.disposeAllChats()
        }
    }

    /**
     * Returns a chat controller for a chat with the given chatID.
     * If an existing editor already exists, use that. Otherwise, create a new one.
     *
     * Post-conditions:
     * - The chat editor will be visible, have focus, and be marked as the active editor
     */
    private async getOrCreateEditorChatController(
        chatID?: string,
        chatQuestion?: string,
        panel?: vscode.WebviewPanel
    ): Promise<ChatController> {
        // Look for an existing editor with the same chatID
        if (chatID && this.editors.map(p => p.sessionID).includes(chatID)) {
            const provider = this.editors.find(p => p.sessionID === chatID)
            if (provider?.webviewPanelOrView) {
                revealWebviewViewOrPanel(provider.webviewPanelOrView)
                this.activeEditor = provider
                return provider
            }
        }
        return this.createEditorChatController(chatID, chatQuestion, panel)
    }

    /**
     * Creates a new editor panel
     */
    private async createEditorChatController(
        chatID?: string,
        chatQuestion?: string,
        panel?: vscode.WebviewPanel
    ): Promise<ChatController> {
        const chatController = this.createChatController()
        if (chatID) {
            await chatController.restoreSession(chatID)
        } else {
            await chatController.newSession()
        }

        if (panel) {
            // Connect the controller with the existing editor panel
            this.activeEditor = chatController
            await chatController.revive(panel)
        } else {
            // Create a new editor panel on top of an existing one
            const activePanelViewColumn = this.activeEditor?.webviewPanelOrView
                ? webviewViewOrPanelViewColumn(this.activeEditor?.webviewPanelOrView)
                : undefined
            await chatController.createWebviewViewOrPanel(activePanelViewColumn, chatQuestion)
        }

        this.activeEditor = chatController
        this.editors.push(chatController)
        if (chatController.webviewPanelOrView) {
            webviewViewOrPanelOnDidChangeViewState(chatController.webviewPanelOrView)(e => {
                if (e.webviewPanel.visible && e.webviewPanel.active) {
                    this.activeEditor = chatController
                }
            })
            chatController.webviewPanelOrView.onDidDispose(() => {
                this.disposeChat(chatController.sessionID, false)
            })
        }

        return chatController
    }

    /**
     * Creates a provider for a chat view.
     */
    private createChatController(): ChatController {
        const authStatus = this.options.authProvider.getAuthStatus()
        const isConsumer = authStatus.isDotCom

        // Enterprise context is used for remote repositories context fetching
        // in vs cody extension it should be always off if extension is connected
        // to dot com instance, but in Cody Web it should be on by default for
        // all instances (including dot com)
        const isCodyWeb =
            vscode.workspace.getConfiguration().get<string>('cody.advanced.agent.ide') === CodyIDE.Web
        const allowRemoteContext = isCodyWeb || !isConsumer

        return new ChatController({
            ...this.options,
            chatClient: this.chatClient,
            localEmbeddings: isConsumer ? this.localEmbeddings : null,
            symf: isConsumer ? this.symf : null,
            enterpriseContext: allowRemoteContext ? this.enterpriseContext : null,
            guardrails: this.guardrails,
            startTokenReceiver: this.options.startTokenReceiver,
            contextAPIClient: this.contextAPIClient,
            contextRetriever: this.contextRetriever,
            extensionClient: this.extensionClient,
        })
    }

    private disposeChat(chatID: string, includePanel: boolean): void {
        if (chatID === this.activeEditor?.sessionID) {
            this.activeEditor = undefined
        }

        const providerIndex = this.editors.findIndex(p => p.sessionID === chatID)
        if (providerIndex !== -1) {
            const removedProvider = this.editors.splice(providerIndex, 1)[0]
            if (removedProvider.webviewPanelOrView) {
                disposeWebviewViewOrPanel(removedProvider.webviewPanelOrView)
            }
            removedProvider.dispose()
        }

        if (includePanel && chatID === this.panel?.sessionID) {
            this.panel.clearAndRestartSession()
        }
    }

    // Dispose all open chat panels
    private disposeAllChats(): void {
        this.activeEditor = undefined

        // loop through the panel provider map
        const oldEditors = this.editors
        this.editors = []
        for (const editor of oldEditors) {
            if (editor.webviewPanelOrView) {
                disposeWebviewViewOrPanel(editor.webviewPanelOrView)
            }
            editor.dispose()
        }

        this.panel.clearAndRestartSession()
    }

    public dispose(): void {
        this.disposeAllChats()
        vscode.Disposable.from(...this.disposables).dispose()
    }
}

function getNewChatLocation(): ChatLocation {
    const chatDefaultLocation =
        vscode.workspace
            .getConfiguration()
            .get<'sticky' | 'sidebar' | 'editor'>('cody.chat.defaultLocation') ?? 'sticky'

    if (chatDefaultLocation === 'sticky') {
        return localStorage.getLastUsedChatModality()
    }
    return chatDefaultLocation
}
