"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function editTerminalSnippWebviewContent(snipp) {
    return `<!DOCTYPE html />
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${snipp.name}</title>
        <style>
        input {
          display: block;
          width: 500px;
          background-color: transparent;
          margin: 20px 0;
          padding: 10px;
          border: 1px solid;
          border-radius: 6px;
          font-size: 19px;
          font-weight: 300;
        }
        textarea {
          display: block;
          width: 500px;
          background-color: transparent;
          margin: 20px 0;
          padding: 10px;
          border: 1px solid;
          border-radius: 6px;
          font-size: 19px;
          font-weight: 300;
        }

        button {
          padding: 15px 30px;
          font-size: 14px;
          border: 0;
          border-radius: 5px;
      }


        body.vscode-light {
          color: black;
        }

        body.vscode-light input, body.vscode-light textarea {
          border-color: black;
          color: black;
        }

        body.vscode-light button {
          background-color: black;
          color: white;
        }
        
        body.vscode-dark button {
          background-color: white;
          color: black;
        }

        
        body.vscode-dark {
          color: white;
        }

        body.vscode-dark  input, body.vscode-dark textarea {
          border-color: #636363;
          color: #c3c3c3;
        }

        body.vscode-high-contrast {
          color: red;
        }

      </style>

    </head>
    <body>
  
      <form id="edit-snippet-form">
      
      <label>Name</label>
      <input type="text" id="" value="${snipp.name}" required placeholder="Enter Snippet Name" name="name">

        <label>Command</label>
        <input type="text" id="" value="${snipp.content}" required placeholder="Enter Snippet Content" name="content">
  
        <!-- ${snipp.tags.map((tag, index) => `
          <input type="text" value="${tag}" placeholder="Enter Tag" name="tag[${index}]">
        `)} -->
        <p id="form-error"></p>
        <button type="submit">Save Snippet</button>
  
      </form>
  
      <script>
        (function () {
          let errors = []
          const vscode = acquireVsCodeApi();
          const form = document.getElementById("edit-snippet-form");
  
          form.onsubmit = function (e) {
            e.preventDefault();
            const fd = new FormData(document.querySelector('form'));
            data = fd.entries();              
            var obj = data.next();
            var retrieved = {};             
            while(undefined !== obj.value) {    
                retrieved[obj.value[0]] = obj.value[1];
                obj = data.next();
            }

            vscode.postMessage({
              command: "save",
              snippetData: retrieved
            });
          };
        })();
      </script>
    </body>
  </html>`;
}
exports.default = editTerminalSnippWebviewContent;
//# sourceMappingURL=edit_terminal_snipp.js.map