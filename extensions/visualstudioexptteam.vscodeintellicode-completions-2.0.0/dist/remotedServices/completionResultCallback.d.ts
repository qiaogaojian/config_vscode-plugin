import { AwaitableMessageExchanger, CachingResultMessage, ICompletionResultCallback, ResponseMessage } from "@vsintellicode/completions-shared";
export declare class WorkerCompletionResultCallback implements ICompletionResultCallback {
    private exchanger;
    constructor(exchanger: AwaitableMessageExchanger<ResponseMessage, CachingResultMessage>);
    setLineCompletions(requestId: number, normContext: string, completions: [number | number[], string[]][], logConfidenceThreshold: number, lengthPenalty: number, correlationGuid: string): Promise<number>;
}
