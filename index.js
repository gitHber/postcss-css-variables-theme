const postcss = require('postcss')

const varReg = /var\(--.*\)/
const plugin =  postcss.plugin('postcss-css-variables-theme', function(options) {
    return function(css, result) {
        debugger
        css.walk(node => {
            // css property
            if(node.type === 'decl' && node.value.includes('var(')) {
                node.value = node.value.replace(/var\((--[a-zA-Z\-])/, )
            }
        })
        console.log(css, result)
    }
})

postcss([plugin()]).process(`
.b .a[c] {
    color: var(--c);
    background-color: blue;
    border: 1px solid red;
}
.g {
    color: white;
}


`,{from: './a.css', to: './b.css'}).then(res => {
   debugger
    console.log(res)
})