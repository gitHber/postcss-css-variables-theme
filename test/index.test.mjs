import postcss from 'postcss';
const PostcssCssTheme = require('../index');
postcss([PostcssCssTheme()])
    .process('.a {color: var(--primary-color);}', {
        from: './a.css',
        to: './a.compile.css',
    })
    .then((result) => {
        console.log(result.css)
    });
