var L=Object.create;var u=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var I=Object.getOwnPropertyNames;var $=Object.getPrototypeOf,k=Object.prototype.hasOwnProperty;var K=(e,o)=>{for(var t in o)u(e,t,{get:o[t],enumerable:!0})},y=(e,o,t,s)=>{if(o&&typeof o=="object"||typeof o=="function")for(let n of I(o))!k.call(e,n)&&n!==t&&u(e,n,{get:()=>o[n],enumerable:!(s=M(o,n))||s.enumerable});return e};var x=(e,o,t)=>(t=e!=null?L($(e)):{},y(o||!e||!e.__esModule?u(t,"default",{value:e,enumerable:!0}):t,e)),G=e=>y(u({},"__esModule",{value:!0}),e);var W={};K(W,{activate:()=>O,deactivate:()=>Q});module.exports=G(W);var i=x(require("vscode"));var a=x(require("vscode"));function f(){return c.map(e=>{let o=new a.CompletionItem(e,a.CompletionItemKind.Method);return o.detail="ctf0.macros",o})||[]}function N(e){let o=["has","get","update","inspect"];return Object.keys(e).filter(t=>o.indexOf(t)<0)}var r="macros",m,p=[],c=[],w=[],A=[],g=[];function C(){m=a.workspace.getConfiguration(r),p=m.list,c=N(p),w=m["qp-allow"],A=m["qp-ignore"],g=m.langIds}var d=class{provideCompletionItems(o,t){if(o.lineAt(t).text.slice(0,t.character).endsWith("macros."))return f()}};var v=x(require("vscode"));var l=class{provideCompletionItems(o,t){let s=new v.CompletionItem("macros");return s.commitCharacters=["."],s.documentation=new v.MarkdownString("Press `.` to get `macros.`"),f().concat(s)}};var h=[];function O(e){C(),E(e),e.subscriptions.push(i.workspace.onDidChangeConfiguration(o=>{o.affectsConfiguration(`${r}.list`)&&(C(),j(),E(e))}),i.workspace.onDidChangeConfiguration(o=>{o.affectsConfiguration(`${r}.qp-allow`)&&C()}),i.commands.registerCommand(`${r}.execute`,async()=>{i.window.showQuickPick(q()).then(o=>{o&&i.commands.executeCommand(`${r}.${o}`)})}),i.languages.registerCompletionItemProvider(g,new l),i.languages.registerCompletionItemProvider(g,new d,"."))}function _(e){return new Promise(o=>setTimeout(()=>o(),e))}async function b(e,o){let s=c[o].length;Array(s).map(async()=>await i.commands.executeCommand(e))}async function D(e,o){Array(o).map(async()=>await i.commands.executeCommand(`${r}.${e}`))}function T(e){if(typeof e=="object"){let o=e.command,t=e.args;return o==="$delay"?_(t.delay):t.hasOwnProperty("command")?b(o,t.command):t.hasOwnProperty("times")?D(o,t.times):i.commands.executeCommand(o,t)}return i.commands.executeCommand(e)}function E(e){let o=p;c.map(t=>{h.push(i.commands.registerCommand(`${r}.${t}`,()=>o[t].reduce(async(s,n)=>{await s,await T(n)},Promise.resolve())))}),e.subscriptions.push(...h)}function q(){let e=c,o=w,t=A;return o.length&&(e=e.filter(s=>o.some(n=>n===s)),e=e.sort((s,n)=>o.indexOf(s)-o.indexOf(n))),t.length&&(e=e.filter(s=>t.some(n=>n===s))),e}function j(){for(let e of h)e.dispose()}function Q(){}0&&(module.exports={activate,deactivate});