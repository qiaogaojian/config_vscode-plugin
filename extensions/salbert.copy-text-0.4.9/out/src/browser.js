"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Browser = void 0;
const vscode = require("vscode");
const observableMethods = [
    'amb',
    'case',
    'catch',
    'combineLatest',
    'concat',
    'create',
    'defer',
    'empty',
    'for',
    'forIn',
    'forkJoin',
    'from',
    'fromCallback',
    'fromEvent',
    'fromEventPattern',
    'fromNodeCallback',
    'fromPromise',
    'generate',
    'generateWithAbsoluteTime',
    'generateWithRelativeTime',
    'if',
    'interval',
    'isObservable',
    'return',
    'just',
    'merge',
    'mergeDelayError',
    'never',
    'of',
    'ofWithScheduler',
    'onErrorResumeNext',
    'pairs',
    'range',
    'repeat',
    'spawn',
    'start',
    'startAsync',
    'throw',
    'timer',
    'toAsync',
    'using',
    'when',
    'while',
    'whileDo',
    'wrap',
    'zip',
];
const observableInstanceMethods = [
    'amb',
    'and',
    'asObservable',
    'average',
    'buffer',
    'bufferWithCount',
    'bufferWithTime',
    'bufferWithTimeOrCount',
    'catch',
    'combineLatest',
    'concat',
    'concatAll',
    'concatMapObserver',
    'selectConcatObserver',
    'controlled',
    'count',
    'debounce',
    'defaultIfEmpty',
    'delay',
    'delaySubscription',
    'dematerialize',
    'distinct',
    'distinctUntilChanged',
    'do',
    'doAction',
    'tap',
    'doOnCompleted',
    'tapOnCompleted',
    'doOnError',
    'tapOnError',
    'doOnNext',
    'tapOnNext',
    'doWhile',
    'elementAt',
    'every',
    'expand',
    'extend',
    'manySelect',
    'filter',
    'where',
    'finally',
    'find',
    'findIndex',
    'first',
    'flatMap',
    'selectMany',
    'flatMapConcat',
    'concatMap',
    'flatMapFirst',
    'selectSwitchFirst',
    'flatMapLatest',
    'flatMapObserver',
    'selectManyObserver',
    'flatMapWithMaxConcurrent',
    'forkJoin',
    'groupBy',
    'groupByUntil',
    'groupJoin',
    'ignoreElements',
    'includes',
    'indexOf',
    'isEmpty',
    'join',
    'jortSort',
    'jortSortUntil',
    'last',
    'lastIndexOf',
    'let',
    'letBind',
    'map',
    'select',
    'materialize',
    'max',
    'maxBy',
    'merge',
    'mergeAll',
    'min',
    'minBy',
    'multicast',
    'observeOn',
    'onErrorResumeNext',
    'pairwise',
    'partition',
    'pausable',
    'pausableBuffered',
    'pipe',
    'pluck',
    'publish',
    'publishLast',
    'publishValue',
    'reduce',
    'repeat',
    'replay',
    'retry',
    'retryWhen',
    'scan',
    'sequenceEqual',
    'share',
    'shareReplay',
    'shareValue',
    'single',
    'singleInstance',
    'skip',
    'skipLast',
    'skipLastWithTime',
    'skipUntil',
    'skipUntilWithTime',
    'skipWhile',
    'skipWithTime',
    'slice',
    'some',
    'startWith',
    'subscribe',
    'forEach',
    'subscribeOn',
    'subscribeOnCompleted',
    'subscribeOnError',
    'subscribeOnNext',
    'sum',
    'switch',
    'switchFirst',
    'take',
    'takeLast',
    'takeLastBuffer',
    'takeLastBufferWithTime',
    'takeLastWithTime',
    'takeUntil',
    'takeUntilWithTime',
    'takeWhile',
    'takeWithTime',
    'thenDo',
    'throttle',
    'throttleLatest',
    'sample',
    'timeInterval',
    'timeout',
    'timestamp',
    'toArray',
    'toMap',
    'toPromise',
    'toSet',
    'transduce',
    'window',
    'windowWithCount',
    'windowWithTime',
    'windowWithTimeOrCount',
    'withLatestFrom',
    'zip',
    'zipIterable',
];
class Browser {
    static openLink() {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            const selection = activeTextEditor.selection;
            if (!selection.isEmpty) {
                const text = activeTextEditor.document.getText(selection);
                if (observableInstanceMethods.indexOf(text) >= 0) {
                    vscode.env.openExternal(vscode.Uri.parse(`https://xgrommx.github.io/rx-book/content/observable/observable_instance_methods/${text.toLowerCase()}.html`));
                }
                else if (observableMethods.indexOf(text) >= 0) {
                    vscode.env.openExternal(vscode.Uri.parse(`https://xgrommx.github.io/rx-book/content/observable/observable_methods/${text.toLowerCase()}.html`));
                }
                else {
                    vscode.env.openExternal(vscode.Uri.parse('https://xgrommx.github.io/rx-book/content/which_operator_do_i_use/index.html'));
                }
            }
        }
    }
}
exports.Browser = Browser;
//# sourceMappingURL=browser.js.map