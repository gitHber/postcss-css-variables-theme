/**
 * generate variables by *.css(ps: test/theme.css)
 * @param {*} path
 * @returns
 */
exports.readThemeConfig = (
    path,
    selectorToTheme = (selector) => selector.slice(1)
) => {
    let variables = {};
    let content = require('fs').readFileSync(path, { encoding: 'utf8' });
    content = content.replace(/\n/g, '');
    const reg = /body(\.[^{\s]*)?\s*{((\s*(--[0-9a-zA-Z-]*):\s*([^;]*);)*)}/g;
    let pattern;
    while ((pattern = reg.exec(content))) {
        const [classStr, selector, decls] = pattern;
        const declReg = /(--[0-9a-zA-Z-]*):\s*([^;]*);/g;
        let declPattern;
        while ((declPattern = declReg.exec(decls))) {
            const [declStr, prop, value] = declPattern;
            if (!variables[prop]) {
                variables[prop] = {};
            }
            variables[prop][selector ? selectorToTheme(selector) : 'default'] =
                value;
        }
    }
    return variables;
};
