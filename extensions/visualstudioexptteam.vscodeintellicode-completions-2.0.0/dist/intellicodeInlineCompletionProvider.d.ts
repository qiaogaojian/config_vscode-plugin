import * as vscode from "vscode";
import { ExtensionContext } from "vscode";
import { Settings, ILoggingService } from "@vsintellicode/completions-shared";
import { SettingsStorage } from "@vsintellicode/completions-shared/services";
export declare function getIntelliCodeInlineCompletionProvider(context: ExtensionContext, settings: Settings, settingsStorage: SettingsStorage, logger: ILoggingService): Promise<vscode.InlineCompletionItemProvider | null>;
