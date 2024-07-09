import { Message, SettingsResponseMessage, SettingsStorage } from "@vsintellicode/completions-shared";
export declare class WorkerSettingsStorage implements SettingsStorage {
    private postMessage;
    private cachedSettings;
    constructor(postMessage: (message: Message) => void);
    getExtensionSectionName(): string;
    get<T>(key: string, defaultValue: T): T;
    getNested<T>(innerSection: string, key: string, defaultValue: T): T;
    requestUpdate(section: string, key: string, defaultValue: any): void;
    handleUpdateResponse(response: SettingsResponseMessage): void;
    private cacheKey;
}
