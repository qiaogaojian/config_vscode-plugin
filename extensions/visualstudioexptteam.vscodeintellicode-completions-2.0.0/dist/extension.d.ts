import * as vscode from 'vscode';
import { VSCodeOutputLogger } from '@vsintellicode/pythia-compose-client';
export declare let logger: VSCodeOutputLogger | undefined;
export declare function activate(context: vscode.ExtensionContext): Promise<void>;
