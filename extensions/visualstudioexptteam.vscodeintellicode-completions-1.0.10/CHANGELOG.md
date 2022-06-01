# Change Log

## 1.0.10 - 2022-04-12

- In workbook documents, use code context from preceding cells
- Update outdated dependencies
- Simplify extension name

## 1.0.8 - 2022-02-15

- Refinements to parse error completion filtering
    - Disallow completions containing Python 2.x-style print statements
    - Allow completions which open blocks without closing them
- Remove superfluous settings which caused problems with completion insertion in some situations
