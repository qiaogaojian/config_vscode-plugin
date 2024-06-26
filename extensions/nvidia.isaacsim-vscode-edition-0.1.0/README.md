# Isaac Sim VS Code Edition

*Isaac Sim VS Code Edition* is an extension for Visual Studio Code that provides development support for [*NVIDIA Omniverse*](https://www.nvidia.com/en-us/omniverse/) in general and [*Isaac Sim*](https://docs.omniverse.nvidia.com/isaacsim/latest/index.html) in particular. In its simplest form, it can be considered the VS Code version of the Omniverse [*Script Editor*](https://docs.omniverse.nvidia.com/extensions/latest/ext_script-editor.html).

> **Note:** This extension requires its Isaac Sim counterpart extension (`omni.isaac.vscode`) to be installed and enabled in order to execute Python code in an Omniverse/Isaac Sim application environment.

## Key Features

* Execute Python code, in the Python environment of an Omniverse application, locally or remotely from VS Code and show the output in the *Isaac Sim VS Code Edition* panel.

* Browse and insert snippets of code related to *Omnivese Kit*, *Universal Scene Description (USD)* and *Isaac Sim*

* Create templates for Omniverse/Isaac Sim extensions and other development approaches

* Quick access to the most relevant Omniverse/Isaac Sim documentation sources and resources without leaving the editor

## Extension interface

![interface](https://github.com/Toni-SM/semu.misc.vscode/assets/22400377/a0840f15-a326-41fc-b80a-91f4f3f1f691)

## Code execution

![execution](https://github.com/Toni-SM/semu.misc.vscode/assets/22400377/3657d274-a269-4d8b-915c-69d8a0eb1a0e)

### Local execution

* **Isaac Sim VS Code Edition: Run** - Execute the active editor's Python code in the locally configured (`localApplication.extensionPort` setting) NVIDIA Omniverse application and view the results in the Output panel.

* **Isaac Sim VS Code Edition: Run Selected Text** - Execute the active editor's Python selected code in the locally configured (`localApplication.extensionPort` setting) NVIDIA Omniverse application and view the results in the Output panel.

### Remote execution

* **Isaac Sim VS Code Edition: Run Remotely** - Execute the active editor's Python code in the remote configured (`remoteApplication.extensionIP` and `remoteApplication.extensionPort` settings) NVIDIA Omniverse application and view the results in the Output panel.

* **Isaac Sim VS Code Edition: Run Selected Text Remotely** - Execute the active editor's Python selected code in the remote configured (`remoteApplication.extensionIP` and `remoteApplication.extensionPort` settings) NVIDIA Omniverse application and view the results in the Output panel.

## Support
Reach out to us for feedback and questions via [our developer forum](https://forums.developer.nvidia.com/c/omniverse/simulation/69).
