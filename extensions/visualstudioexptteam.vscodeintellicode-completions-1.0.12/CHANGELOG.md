# Change Log

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
