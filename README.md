# postcss-css-variables-theme

[![npm version](https://badge.fury.io/js/postcss-css-variables-theme.svg)](http://badge.fury.io/js/postcss-css-variables-theme) [![Build Status](https://travis-ci.org/gitHber/postcss-css-variables-theme.svg)](https://travis-ci.org/github/gitHber/postcss-css-variables-theme) [![codecov](https://codecov.io/gh/gitHber/postcss-css-variables-theme/branch/master/graph/badge.svg)](https://codecov.io/gh/gitHber/postcss-css-variables-theme)

Just like postcss-css-variables but support multiple theme class
[postcss-css-variables](https://github.com/MadLittleMods/postcss-css-variables/blob/v0.17.0/README.md)

## Option

```js
{
    /**
     * true: keep variables
     * false(default): not keep & remove variable defination
     * computed: not keep variables but keep variable defination
     * (decl: Node) => boolean | 'computed'
     */
    preserve: false,
    variables: {
        '--main-color': { // theme
            default: 'blue', // default
            light: '#fff', // theme: light
            dark: '#000', // theme: dark
        },
        '--secondary-color': '#aef', // default
    },
    /**
     * prifix of multiple theme selector
     * @param {*} selector
     * @param {*} theme
     * @returns `body.${theme} ${selector}`
     */
    themeSelector: (theme, selector) => `body.${theme} ${selector}`,
    /**
     * true: generate variables defination
     * false(default): do nothing
     */
    preserveInjectedVariables: false,
    /**
     * selector of variables defination
     * @param {*} selector
     * @param {*} theme
     * @returns
     */
    defineThemeSelector: (theme) => {
        if (theme === 'default') return 'body';
        return `body.${theme}`;
    },
};
```

## Generate variables

you can generate variables just by \*.css, there is util function can help you
theme.css

```css
/**
* write rule
* body.[name] {
*    --[var-name]: [value-name]; 
* }
*/
body {
    --primary-color: #fe3666;
    --primary-bgcolor: #fe366620;
}
body.light {
    --primary-color: #ff4906;
    --primary-bgcolor: #ff490620;
}
body.dark {
    --primary-color: #906000;
    --primary-bgcolor: #90600020;
}
```

```js
const { readThemeConfig } = require('postcss-css-variables-theme/util');
readThemeConfig(require('path').resolve(__dirname, './theme.css'));
// {
//     '--primary-color': {
//         default: '#fe3666',
//         light: '#ff4906',
//         dark: '#906000',
//     },
//     '--primary-bgcolor': {
//         default: '#fe366620',
//         light: '#ff490620',
//         dark: '#90600020',
//     },
// }
```

# examples

## default

### option

```js
{
    variables: {
        '--primary-color': '#15c213'
    }
}
```

### ps:

```css
.a {
    color: var(--primary-color);
}
```

```css
.a {
    color: #15c213;
}
```

## mutiple themes

### options

```js
{
    variables: {
        '--primary-color': {
            default: '#15c213',
            light: '#9ae899',
            dark: '#2a562a',
        }
    }
}
```

### ps:

```css
.a {
    color: var(--primary-color);
}
```

```css
.a {
    color: #15c213;
}
body.light .a {
    color: #9ae899;
}
body.dark .a {
    color: #2a562a;
}
```

## preserve: true

### option

```js
{
    preserve: true,
    variables: {
        '--primary-color': '#15c213'
    }
)
```

### ps:

```css
:root {
    --primary-color: blue;
}
.a {
    color: var(--primary-color);
}
```

```css
:root {
    --primary-color: blue;
}
.a {
    color: #15c213;
    color: var(--primary-color);
}
```

## preserve: false

### option

```js
{
    preserve: false,
    variables: {
        '--primary-color': '#15c213'
    }
}
```

### ps:

```css
:root {
    --primary-color: blue;
}
.a {
    color: var(--primary-color);
}
```

```css
.a {
    color: #15c213;
}
```

## preserve: computed

### option

```js
{
    preserve: 'computed',
    variables: {
        '--primary-color': '#15c213'
    }
}
```

### ps:

```css
:root {
    --primary-color: blue;
}
.a {
    color: var(--primary-color);
}
```

```css
:root {
    --primary-color: blue;
}
.a {
    color: #15c213;
}
```

## preserve: function

### option

```js
{
    preserve: (node) =>
        node.prop === '--primary-color' ||
        node.value.includes('--primary-color')
        ? true
        : false,
    variables: {
        '--primary-color': '#15c213',
        '--secondary-color': '#15c'
    }
}
```

### ps:

```css
:root {
    --primary-color: blue;
    --secondary-color: red;
}
.a {
    color: var(--primary-color);
    background-color: var(--secondary-color);
}
```

```css
:root {
    --primary-color: blue;
}
.a {
    color: #15c213;
    color: var(--primary-color);
    background-color: #15c;
}
```

## themeSelector

### option

```js
{
    themeSelector: (theme, selector) => `.custom-${theme} ${selector}`,
    variables: {
        '--primary-color': {
            default: '#15c213',
            light: '#15c',
        }
    }
}
```

### ps:

```css
.a {
    color: var(--primary-color);
}
```

```css
.a {
    color: #15c213;
}
.custom-light .a {
    color: #15c;
}
```

## preserveInjectedVariables

### option

```js
{
    preserveInjectedVariables: true,
    variables: {
        '--primary-color': '#15c213'
    }
}
```

### ps:

```css
.a {
    color: var(--primary-color);
}
```

```css
body {
    --primary-color: #15c213;
}
.a {
    color: #15c213;
}
```

## defineThemeSelector (preserveInjectedVariables must be true)

### option

```js
{
    preserveInjectedVariables: true,
    defineThemeSelector: (theme) => {
        if (theme === 'default') return 'body';
        return `body[${theme}]`;
    },
    variables: {
        '--primary-color': {
            default: '#15c213',
            light: '#15c',
        },
    },
}
```

### ps:

```css
.a {
    color: var(--primary-color);
}
```

```css
body[light] {
    --primary-color: #15c;
}
body {
    --primary-color: #15c213;
}
.a {
    color: #15c213;
}
body.light .a {
    color: #15c;
}
```
