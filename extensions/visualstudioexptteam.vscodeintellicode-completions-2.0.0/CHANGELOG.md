# Change Log

## 2.0.0 - 2024-04-03

- Fix [issue](https://github.com/MicrosoftDocs/intellicode/issues/491) where IntelliCode Completions was unusable on versions of VSCode >= 1.82
- Remove confusing toast prompting users to disable GitHub Copilot to be able to use IntelliCode.
    - The message is replaced by an unintrusive output log message saying that this extension will not suggest inline completions.
    - This is because having multiple extensions provide inline completions introduces timing-related inconsistency as the displayed completion may change after being displayed, depending on when each extension provides its completion.
    - In this case, we disable IntelliCode Completions, because:
        - GitHub Copilot, which uses an online model, is better able to provide a quality completion than IntelliCode Completions, which uses an offline model.
        - IntelliCode completions will often provide an inline completion sooner, because there's no network round-trip involved.
        - Therefore, using both at the same time often results in seeing a completion from IntelliCode for a second before it is then replaced by a totally different completion from GitHub Copilot.
    - If you would like to use both anyway, configure `"intellicodeCompletions.runAlongsideCopilot": true` in your settings.
- Miscellaneous improvements to lifecycle management for the inference worker process
- Change default log verbosity to `INFO` from `ERROR`
- Reduce log volume at `INFO` level

## 1.0.23 - 2023-09-05
- Update dependencies and readme

## 1.0.22 - 2023-04-17
- Adding improved Intellisense experience
- Enabling JS/TS by default

## 1.0.21 - 2022-11-29
- Improving Intellisense + Inline completion experience

## 1.0.20 - 2022-10-10
- Enabling JS/TS by default
## 1.0.19 - 2022-10-03
- Adding multi-trigger feature experimentation support
- Increasing confidence threshold
- Improved snippet experience

## 1.0.18 - 2022-08-31
- Adding telemetry and experimentation support

## 1.0.17 - 2022-08-11
- Bracket completion
- Improving UX when typing in the middle of the line
- Localization available

## 1.0.16 - 2022-08-02
- Hotfix for extension crashing the extension host

## 1.0.15 - 2022-07-20
- Fix for blingfire crashes and requests timing out
- Added resiliency when worker threads crash

## 1.0.14 - 2022-06-28
- Updating vscode extension telemetry package
- Removing duplicate telemetry sent

## 1.0.13 - 2022-06-21
- Updating extension to use VS Code finalized InlineCompletion API 
- Improved error handling and logging in worker thread

## 1.0.12 - 2022-05-05
- Updating minimist version

## 1.0.11 - 2022-04-13 

- Updating to temporary VS Code proposed API while their migration is taking place
- This change only impacts version 1.67 i.e. VS Code Insiders
- Most of the changes made in this version will be changed again when 1.67 is ready to be moved to VS Code Stable.

## 1.0.10 - 2022-04-12

- In workbook documents, use code context from preceding cells
- Update outdated dependencies
- Simplify extension name

## 1.0.8 - 2022-02-15

- Refinements to parse error completion filtering
    - Disallow completions containing Python 2.x-style print statements
    - Allow completions which open blocks without closing them
- Remove superfluous settings which caused problems with completion insertion in some situations
