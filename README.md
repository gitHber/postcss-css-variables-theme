# postcss-css-variables-theme

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
        '--secondary-color': '#aef',
    },
    /**
     * prifix of multiple theme selector
     * @param {*} selector
     * @param {*} theme
     * @returns `body.theme-${theme} ${selector}`
     */
    themeSelector: (theme, selector) => `body.theme-${theme} ${selector}`,
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
        return `body.theme-${theme}`;
    },
};
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
body.theme-light .a {
    color: #9ae899;
}
body.theme-dark .a {
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
body.theme-light .a {
    color: #15c;
}
```
