const postcss = require('postcss');

const defaultOption = {
    /**
     * true: 同时保留var写法
     * false: 不保留
     * computed: 不保留var写法，但是也不会去除 var 变量的定义(默认会删掉定义)
     * (decl) => boolean | 'computed'
     */
    preserve: false,
    variables: {
        '--main-color': {
            default: 'blue', // default不会加上前缀
            light: '#fff',
            dark: '#000',
        },
        '--s-color': '#aef',
    },
    /**
     * 为选择器添加对应的主题前缀，方便用户动态设置主题，默认使用 data-*，也可以使用class
     * @param {*} selector 选择器
     * @param {*} theme 主题
     * @returns
     */
    themeSelector: (theme, selector) => `body.${theme} ${selector}`,
    /**
     * 插件会自动生成 :root {--var: value}
     * 设置成false，不会保留，需要用户自己提前设置好
     * 默认true
     */
    preserveInjectedVariables: false,
    /**
     * 定义变量的选择器
     * @param {*} selector 选择器
     * @param {*} theme 主题
     * @returns
     */
    defineThemeSelector: (theme) => {
        if (theme === 'default') return 'body';
        return `body.${theme}`;
    },
};

module.exports = postcss.plugin(
    'postcss-css-variables-theme',
    function (options) {
        options = { ...defaultOption, ...options };
        const {
            variables,
            preserve,
            themeSelector,
            preserveInjectedVariables,
            defineThemeSelector,
        } = options;
        return function (css) {
            // 稍后删除的节点
            const nodesToRemoveAtEnd = [];
            // 定义变量
            const defineRulesMap = new Map();
            const VAR_REG = /var\((--[0-9a-zA-Z-]*)(,[^()]*)?\)/g;
            /**
             * 替换变量
             * @param {*} node 节点
             * @param {*} variable 属性名 var(--main-color, red)
             * @param {*} value 属性值 #fff
             * @param {*} preserve 保留
             */
            const replaceVariables = (node, variable, value) => {
                if (node._preserve) return;
                let preserveDecl = preserve;
                if (typeof preserve === 'function') {
                    preserveDecl = preserve(node);
                }
                if (preserveDecl === true && !node._preserveNode) {
                    const preserveNode = node.clone();
                    preserveNode._preserve = true; // 标识这个被保留的节点
                    node._preserveNode = preserveNode; // 标识源节点的保留节点
                    node.parent.insertAfter(node, preserveNode);
                }
                node.value = node.value.replace(variable, value);
            };
            /**
             * 删除变量定义
             * @param {*} node
             * @param {*} preserve
             */
            const removeVariables = (node) => {
                let preserveDecl;
                const declParentRule = node.parent;
                if (typeof preserve === 'function') {
                    preserveDecl = preserve(node);
                } else {
                    preserveDecl = preserve;
                }
                if (!preserveDecl) {
                    node.remove();
                }
                if (declParentRule.nodes.length === 0) {
                    nodesToRemoveAtEnd.push(declParentRule);
                }
            };
            /**
             * 定义变量
             * @param {*} prop
             * @param {*} value
             * @param {*} theme
             */
            const defineVariables = (prop, value, theme) => {
                if (!preserveInjectedVariables) return;
                if (!theme) {
                    theme = 'default';
                }
                let node = defineRulesMap.get(theme);
                if (!node) {
                    node = new postcss.rule({
                        selector: defineThemeSelector(theme),
                    });
                    node._properties = new Set();
                    defineRulesMap.set(theme, node);
                }
                if (!node._properties.has(prop)) {
                    node._properties.add(prop);
                    node.append(
                        new postcss.decl({
                            prop,
                            value,
                        })
                    );
                }
            };

            css.walkDecls((node) => {
                // 变量定义处理
                if (node.prop.startsWith('--')) {
                    removeVariables(node);
                    return;
                }
                let decl = node.value;
                // css property
                if (decl.includes('var(')) {
                    let pattern;
                    while ((pattern = VAR_REG.exec(decl))) {
                        const [patternStr, property] = pattern;
                        const config = variables[property];
                        if (!config) return;
                        // 单个主题，直接替换
                        if (typeof config === 'string') {
                            defineVariables(property, config);
                            replaceVariables(node, patternStr, config);
                        } else if (typeof config === 'object') {
                            // 多个主题，生成node
                            const declParentRule = node.parent;
                            if (
                                declParentRule &&
                                declParentRule.type === 'rule'
                            ) {
                                if (
                                    !declParentRule._theme &&
                                    !declParentRule._relatedThemeNodeMap
                                ) {
                                    Object.entries(config).forEach(
                                        ([theme, value]) => {
                                            // 添加变量定义
                                            defineVariables(
                                                property,
                                                value,
                                                theme
                                            );
                                            if (theme === 'default') return;
                                            let themeNodes = new Map();
                                            // the theme brother node of rule node
                                            if (
                                                declParentRule._relatedThemeNodeMap
                                            ) {
                                                themeNodes =
                                                    declParentRule._relatedThemeNodeMap;
                                            }
                                            if (!themeNodes.has(theme)) {
                                                const node =
                                                    declParentRule.clone();
                                                // define what theme is node belong to
                                                node._theme = theme;
                                                // add prefix to selector
                                                node.selectors =
                                                    node.selectors.map(
                                                        (selector) =>
                                                            themeSelector(
                                                                theme,
                                                                selector
                                                            )
                                                    );
                                                themeNodes.set(theme, node);
                                                declParentRule.parent.push(
                                                    node
                                                );
                                            }
                                            declParentRule._relatedThemeNodeMap =
                                                themeNodes;
                                        }
                                    );
                                }
                                // 主题节点
                                replaceVariables(
                                    node,
                                    patternStr,
                                    config[declParentRule._theme || 'default']
                                );
                            } else {
                                node.error('decl Without rule!!');
                            }
                        }
                    }
                }
            });
            nodesToRemoveAtEnd.forEach((node) => node.remove());
            [...defineRulesMap.values()].forEach((node) => css.prepend(node));
        };
    }
);
