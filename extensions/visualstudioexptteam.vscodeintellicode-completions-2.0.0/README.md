# IntelliCode Completions

**IntelliCode Completions** predicts up to a whole line of code based on your current context. Predictions appear as grey-text to the right of your cursor. This extension supports Python, JavaScript, and TypeScript.

This extension is automatically installed as a part of the main IntelliCode extension. If you are looking to disable grey-text predictions while keeping the stars that help rank the IntelliSense list, you can configure this behaviour per language using the instructions in the FAQ below, or uninstall just this extension.

## How to use

![GIF demonstrating grey-text completions. Users can hit tab to accept inline completion offered as grey text.](https://aka.ms/intellicode/assets/visualstudioexptteam.vscodeintellicode-completions/vscode-wlc-1.gif)

Completions will appear after your cursor as you type, with a faded color. At any time, you can accept the suggestion by pressing the tab key. Additionally, you can dismiss any shown suggestion by pressing the ESC key.

![GIF demonstrating different grey-text completions shown based on IntelliSense selection. The first tab accepts the IntelliSense selection shown in grey-text, the second tab accepts the rest of the grey-text](https://aka.ms/intellicode/assets/visualstudioexptteam.vscodeintellicode-completions/vscode-wlc-intellisense.gif)

Users' IntelliSense selection helps steer the model's prediction. When the IntelliSense window is open, pressing 'TAB' once accepts the token selected in the InteliSense window, while a second 'TAB' accepts the rest of the inline completion.

## FAQ

### How do I disable IntelliCode Completions?

You have the option to enable or disable whole-line autocomplete for **each supported language (Python/JS/TS)** by searching for `@ext:VisualStudioExptTeam.vscodeintellicode-completions` in Visual Studio Code's Settings.

### Feedback and Troubleshooting

IntelliCode has benefitted greatly from all the rich feedback we've received from you - thank you! We hope you'll help us continue to improve by giving the newly enhanced completions a try and letting us know what you think.

Please report any issues you see on our GitHub repo if you have them: <https://github.com/MicrosoftDocs/intellicode/issues>.

### Privacy and Security

- Your code does not leave your machine and is not used to train our model.
- This extension collects usage metadata and sends it to Microsoft to help improve our products and services. This extension [respects the `telemetry.enableTelemetry` setting](https://code.visualstudio.com/docs/supporting/faq#_how-to-disable-telemetry-reporting).
- For additional information, see [Microsoft Privacy Statement](https://privacy.microsoft.com/en-us/privacystatement)
