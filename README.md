# jsreport-designer-dev

[![NPM Version](http://img.shields.io/npm/v/jsreport-designer-dev.svg?style=flat-square)](https://npmjs.com/package/jsreport-designer-dev)

> **Utils for developing jsreport designer extensions**

## jsreport-designer-start
`jsreport-designer-start` starts the jsreport designer in the development mode with hot reloading used for developing custom extensions.

## jsreport-designer-build

`jsreport-designer-build` command should be run from the main extension directory. It automatically locates `designer/main_dev.js` and build it. The most common approach is to run it from the `package.json`  `prepublish` script. It's also recommended to additionally install and use [in-publish](https://github.com/iarna/in-publish) module to assure the `jsreport-designer-build` does run only during npm publish.

```js
"scripts": {  
    "prepublish": "in-publish && jsreport-designer-build || not-in-publish"
}
```
