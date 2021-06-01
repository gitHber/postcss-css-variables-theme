/**
 * generate variables by *.css(ps: test/theme.css)
 * @param {*} path
 * @returns
 */
exports.readThemeConfig = (path) => {
    let variables = {};
    let content = require('fs').readFileSync(path, { encoding: 'utf8' });
    content = content.replace(/\n/g, '');
    const reg =
        /body(\.theme-([^{\s]*))?\s*{((\s*(--[0-9a-zA-Z-]*):\s*([^;]*);)*)}/g;
    let pattern;
    while ((pattern = reg.exec(content))) {
        const [classStr, themeSelector, theme, decls] = pattern;
        const declReg = /(--[0-9a-zA-Z-]*):\s*([^;]*);/g;
        let declPattern;
        while ((declPattern = declReg.exec(decls))) {
            const [declStr, prop, value] = declPattern;
            if (!variables[prop]) {
                variables[prop] = {};
            }
            variables[prop][theme || 'default'] = value;
        }
    }
    return variables;
};
