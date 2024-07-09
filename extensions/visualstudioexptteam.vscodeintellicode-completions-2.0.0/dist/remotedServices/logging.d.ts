import { ILoggingService, LogLevel, Message } from "@vsintellicode/completions-shared";
export declare class WorkerLoggingService implements ILoggingService {
    private postMessage;
    constructor(postMessage: (message: Message) => void);
    write(logLevel: LogLevel, str: string): void;
}
