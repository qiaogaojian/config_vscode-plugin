// https://code.visualstudio.com/api/extension-guides/webview#scripts-and-message-passing

const vscode = acquireVsCodeApi();  // the function can only be invoked once per session

// handle the message inside the webview
window.addEventListener("message", event => {
    const message = event.data;
    const banner = document.getElementById("banner");
    console.log("[button-extension-create.click] response:", JSON.stringify(message));
    if (message.status) {
        banner.innerText = "The extension was successfully created!";
        banner.classList.replace("text-warning", "text-success");
    }
    else {
        banner.innerText = `Error when creating the extension: ${message.stringError}`;
        banner.classList.replace("text-success", "text-warning");
    }
    banner.classList.replace("d-none", "d-block");
});


document.getElementById("button-extension-path").addEventListener("click", function () {
    // create a hidden input element
    var input = document.createElement("input");
    input.type = "file";
    input.style.display = "none";
    input.webkitdirectory = true;
    input.directory = true;
    // add an event listener for selection
    input.addEventListener("change", function (e) {
        var selectedDirectory = e.target.files[0].path.replace(/\/[^/]+$/, "");
        document.getElementById("extension-path").value = selectedDirectory;
        console.log("[button-extension-path.click] selected directory:", selectedDirectory);
    });
    // trigger the dialog
    input.click();
});

document.getElementById("button-extension-create").addEventListener("click", function () {
    // hide banner
    document.getElementById("banner").classList.replace("d-block", "d-none");
    // validate fields
    const input_extension_name = document.getElementById("extension-name")
    if (!input_extension_name.checkValidity()) {
        input_extension_name.reportValidity();
        return;
    }
    const input_extension_path = document.getElementById("extension-path")
    if (!input_extension_path.checkValidity()) {
        input_extension_path.reportValidity();
        return;
    }
    // build message
    let message = { command: "create", template: "extension" };
    message.fields = {
        name: document.getElementById("extension-name").value,
        title: document.getElementById("extension-title").value,
        description: document.getElementById("extension-description").value,
        keywords: document.getElementById("extension-keywords").value,
        authors: document.getElementById("extension-authors").value,
        repository: document.getElementById("extension-repository").value,
        category: document.getElementById("extension-category").value,
        path: document.getElementById("extension-path").value,
    }
    // pass message from webview to extension
    console.log("[button-extension-create.click] request:", JSON.stringify(message));
    vscode.postMessage(message);
});
