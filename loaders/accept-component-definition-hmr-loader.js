
const path = require('path')
const fs = require('fs')
const loaderUtils = require('loader-utils');

function getAcceptHotForComponent (relativePath, componentName) {
  return (
    `
    module.hot.accept('${relativePath}', () => {
      let ${componentName} = require('${relativePath}');

      if (${componentName}.default) {
        ${componentName} = ${componentName}.default;
      }

      window.__designer_components_hmr__.emit('designerComponentFileHMR', { name: '${componentName}', module: ${componentName} });
    });
    `
  )
}

function componentFilesHotWrapper () {
  if (window.__designer_components_hmr__) {
    '__ACCEPT_CALLS__'
  }
}

function getComponentsInPath (contextPath, componentsDirName) {
  const componentsPath = path.join(contextPath, '../', componentsDirName)
  const files = fs.readdirSync(componentsPath)
  const components = []

  files.forEach((file) => {
    let ext = path.extname(file)
    let name

    if (ext !== '.js' && ext !== '.jsx') {
      return
    }

    name = file.slice(0, file.lastIndexOf('.') !== -1 ? file.lastIndexOf('.') : file.length)

    components.push({
      name,
      relativePath: path.relative(
        contextPath,
        path.join(componentsPath, file)
      )
    })
  })

  return components
}

module.exports = function(content) {
  const loaderOptions = loaderUtils.getOptions(this)
  let components = []

  if (loaderOptions && loaderOptions.componentsDirName) {
    components = getComponentsInPath(
      path.dirname(this.resourcePath),
      loaderOptions.componentsDirName
    )
  }

  if (components.length === 0) {
    return
  }

  const acceptCalls = (
    components
    .map((comp) => getAcceptHotForComponent(comp.relativePath, comp.name))
    .join('\n')
  )

  const wrapperFn = componentFilesHotWrapper.toString().replace(/'__ACCEPT_CALLS__'/g, acceptCalls)

  return (
    `
    ${content}

    ;(${wrapperFn})();
    `
  )
}
