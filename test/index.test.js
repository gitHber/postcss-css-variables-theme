const postcss = require('postcss');
const PostCssVariablesTheme = require('../index');

const compile = (css, options) => {
    return postcss([PostCssVariablesTheme(options)]).process(css, { from: '' });
};

describe('postcss-css-variables-theme', function () {
    test('default option', async () => {
        const { css } = await compile(
            `:root { --primary-color: blue; } .a { color: var(--primary-color); }`,
            {
                variables: {
                    '--primary-color': '#15c213',
                },
            }
        );
        expect(css).toBe(`.a { color: #15c213; }`);
        expect(css).toMatchSnapshot();
    });
    test('not exist', async () => {
        const { css } = await compile(
            `:root { --primary-color: blue; } .a { color: var(--primary-color); }`,
            {
                variables: {},
            }
        );
        expect(css).toBe(`.a { color: var(--primary-color); }`);
        expect(css).toMatchSnapshot();
    });
    test('mutiple themes', async () => {
        const { css } = await compile(`.a { color: var(--primary-color); }`, {
            variables: {
                '--primary-color': {
                    default: '#15c213',
                    light: '#9ae899',
                    dark: '#2a562a',
                },
            },
        });
        expect(css).toBe(
            `.a { color: #15c213; }\nbody.light .a { color: #9ae899; }\nbody.dark .a { color: #2a562a; }`
        );
        expect(css).toMatchSnapshot();
    });
    test('preserve:true mutiple themes', async () => {
        const { css } = await compile(`.a { color: var(--primary-color); }`, {
            preserve: true,
            variables: {
                '--primary-color': {
                    default: '#15c213',
                    light: '#9ae899',
                    dark: '#2a562a',
                },
            },
        });
        expect(css).toBe(
            `.a { color: #15c213; color: var(--primary-color); }\nbody.light .a { color: #9ae899; color: var(--primary-color); }\nbody.dark .a { color: #2a562a; color: var(--primary-color); }`
        );
        expect(css).toMatchSnapshot();
    });
    test('preserve: true', async () => {
        const { css } = await compile(
            `:root { --primary-color: blue; } .a { color: var(--primary-color); }`,
            {
                preserve: true,
                variables: {
                    '--primary-color': '#15c213',
                },
            }
        );
        expect(css).toBe(
            `:root { --primary-color: blue; } .a { color: #15c213; color: var(--primary-color); }`
        );
        expect(css).toMatchSnapshot();
    });
    test('preserve: false', async () => {
        const { css } = await compile(
            `:root { --primary-color: blue; } .a { color: var(--primary-color); }`,
            {
                preserve: false,
                variables: {
                    '--primary-color': '#15c213',
                },
            }
        );
        expect(css).toBe(`.a { color: #15c213; }`);
        expect(css).toMatchSnapshot();
    });
    test('preserve: computed', async () => {
        const { css } = await compile(
            `:root { --primary-color: blue; } .a { color: var(--primary-color); }`,
            {
                preserve: 'computed',
                variables: {
                    '--primary-color': '#15c213',
                },
            }
        );
        expect(css).toBe(
            `:root { --primary-color: blue; } .a { color: #15c213; }`
        );
        expect(css).toMatchSnapshot();
    });
    test('preserve: function', async () => {
        const { css } = await compile(
            `
                :root {
                    --primary-color: blue;
                    --secondary-color: red;
                }
                .a {
                    color: var(--primary-color);
                    background-color: var(--secondary-color);
                }
            `,
            {
                preserve: (node) =>
                    node.prop === '--primary-color' ||
                    node.value.includes('--primary-color')
                        ? true
                        : false,
                variables: {
                    '--primary-color': '#15c213',
                    '--secondary-color': '#15c',
                },
            }
        );
        expect(css).toBe(
            `
                :root {
                    --primary-color: blue;
                }
                .a {
                    color: #15c213;
                    color: var(--primary-color);
                    background-color: #15c;
                }
            `
        );
        expect(css).toMatchSnapshot();
    });

    test('themeSelector', async () => {
        const { css } = await compile(`.a { color: var(--primary-color); }`, {
            themeSelector: (theme, selector) => `.${theme} ${selector}`,
            variables: {
                '--primary-color': {
                    default: '#15c213',
                    light: '#15c',
                },
            },
        });
        expect(css).toBe(`.a { color: #15c213; }\n.light .a { color: #15c; }`);
        expect(css).toMatchSnapshot();
    });

    test('preserveInjectedVariables', async () => {
        const { css } = await compile(`.a { color: var(--primary-color); }`, {
            preserveInjectedVariables: true,
            variables: {
                '--primary-color': '#15c213',
            },
        });
        expect(css).toBe(
            `body { --primary-color: #15c213; }\n.a { color: #15c213; }`
        );
        expect(css).toMatchSnapshot();
    });
    test('themeDefineSelector is not effective with preserveInjectedVariables is false', async () => {
        const { css } = await compile(`.a { color: var(--primary-color); }`, {
            preserveInjectedVariables: false,
            themeDefineSelector: (theme) => `body[${theme}]`,
            variables: {
                '--primary-color': {
                    default: '#15c213',
                    light: '#15c',
                },
            },
        });
        expect(css).toBe(
            `.a { color: #15c213; }\nbody.light .a { color: #15c; }`
        );
        expect(css).toMatchSnapshot();
    });
    test('themeDefineSelector with preserveInjectedVariables is true', async () => {
        const { css } = await compile(`.a { color: var(--primary-color); }`, {
            preserveInjectedVariables: true,
            themeDefineSelector: (theme) => {
                if (theme === 'default') return 'body';
                return `body[${theme}]`;
            },
            variables: {
                '--primary-color': {
                    default: '#15c213',
                    light: '#15c',
                },
            },
        });
        expect(css).toBe(
            `body[light] { --primary-color: #15c; }\nbody { --primary-color: #15c213; }\n.a { color: #15c213; }\nbody.light .a { color: #15c; }`
        );
        expect(css).toMatchSnapshot();
    });
    test('theme extra prop will be remove', async () => {
        const { css } = await compile(
            `.a { color: var(--primary-color); font-size: 14px; background-color: var(--secondary-color); }`,
            {
                variables: {
                    '--primary-color': {
                        default: '#ccc',
                        light: '#fff',
                        dark: '#000',
                    },
                    '--secondary-color': {
                        default: '#eee',
                        happy: '#15c213',
                    },
                },
            }
        );
        expect(css).toBe(
            `.a { color: #ccc; font-size: 14px; background-color: #eee; }\nbody.light .a { color: #fff; }\nbody.dark .a { color: #000; }\nbody.happy .a { background-color: #15c213; }`
        );
        expect(css).toMatchSnapshot();
    });
});
