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
    themeDefineSelector: (theme) => {
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
            themeDefineSelector,
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
                    node.parent.insertBefore(node, preserveNode);
                    node = preserveNode;
                }
                node.value = node.value.replace(variable, value);
            };
            /**
             * 删除变量定义
             * @param {*} node
             * @param {*} preserve
             */
            const removeVariables = (declNode) => {
                let preserveDecl;
                const ruleNode = declNode.parent;
                if (typeof preserve === 'function') {
                    preserveDecl = preserve(declNode);
                } else {
                    preserveDecl = preserve;
                }
                if (!preserveDecl) {
                    declNode.remove();
                }
                if (ruleNode.nodes.length === 0) {
                    nodesToRemoveAtEnd.push(ruleNode);
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
                        selector: themeDefineSelector(theme),
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

            css.walkDecls((declNode) => {
                // 变量定义处理
                if (declNode.prop.startsWith('--')) {
                    removeVariables(declNode);
                    return;
                }
                let decl = declNode.value;
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
                            replaceVariables(declNode, patternStr, config);
                        } else if (typeof config === 'object') {
                            // 多个主题，生成node
                            const ruleNode = declNode.parent;
                            if (ruleNode && ruleNode.type === 'rule') {
                                // 原css rule
                                if (!ruleNode._theme) {
                                    Object.entries(config).forEach(
                                        ([theme, value]) => {
                                            // 添加变量定义
                                            defineVariables(
                                                property,
                                                value,
                                                theme
                                            );
                                            if (theme === 'default') return;
                                            // the theme brother node of rule node
                                            if (
                                                !ruleNode._relatedThemeRuleNodeMap
                                            ) {
                                                ruleNode._relatedThemeRuleNodeMap =
                                                    new Map();
                                            }
                                            // 最后插入的主题rule
                                            if (!ruleNode._lastThemeRuleNode) {
                                                ruleNode._lastThemeRuleNode =
                                                    ruleNode;
                                            }
                                            const themeNodes =
                                                ruleNode._relatedThemeRuleNodeMap;
                                            let themeRuleNode =
                                                themeNodes.get(theme);
                                            if (!themeRuleNode) {
                                                themeRuleNode =
                                                    new postcss.rule({
                                                        selectors:
                                                            ruleNode.selectors.map(
                                                                (selector) =>
                                                                    themeSelector(
                                                                        theme,
                                                                        selector
                                                                    )
                                                            ),
                                                    });
                                                // define what theme is node belong to
                                                themeRuleNode._theme = theme;
                                                // add prefix to selector
                                                themeNodes.set(
                                                    theme,
                                                    themeRuleNode
                                                );
                                                ruleNode.parent.insertAfter(
                                                    ruleNode._lastThemeRuleNode,
                                                    themeRuleNode
                                                );
                                                ruleNode._lastThemeRuleNode =
                                                    themeRuleNode;
                                            }
                                            themeRuleNode.push(
                                                declNode.clone()
                                            );
                                        }
                                    );
                                }
                                // 主题节点
                                replaceVariables(
                                    declNode,
                                    patternStr,
                                    config[ruleNode._theme || 'default']
                                );
                            } else {
                                declNode.error('decl Without rule!!');
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
