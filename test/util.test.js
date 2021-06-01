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
});
