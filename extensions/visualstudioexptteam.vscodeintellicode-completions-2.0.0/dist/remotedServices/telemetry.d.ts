import { ITelemetrySender, Message } from "@vsintellicode/completions-shared";
export declare class WorkerTelemetryService implements ITelemetrySender {
    private postMessage;
    constructor(postMessage: (message: Message) => void);
    sendTelemetryEvent(eventName: string, properties?: {
        [key: string]: string;
    }, measures?: {
        [key: string]: number;
    }): void;
}
