const { readThemeConfig } = require('../util');

describe('util', function () {
    test('generate variables by theme.css', async () => {
        const variables = readThemeConfig(
            require('path').resolve(__dirname, './theme.css')
        );
        expect(variables).toEqual({
            '--primary-color': {
                default: '#fe3666',
                light: '#ff4906',
                dark: '#906000',
            },
            '--primary-bgcolor': {
                default: '#fe366620',
                light: '#ff490620',
                dark: '#90600020',
            },
        });
    });
    test('generate selectorToTheme', async () => {
        const variables = readThemeConfig(
            require('path').resolve(__dirname, './theme.css'),
            (theme) => `theme-${theme.slice(1)}`
        );
        expect(variables).toEqual({
            '--primary-color': {
                default: '#fe3666',
                'theme-light': '#ff4906',
                'theme-dark': '#906000',
            },
            '--primary-bgcolor': {
                default: '#fe366620',
                'theme-light': '#ff490620',
                'theme-dark': '#90600020',
            },
        });
    });
});
