
const path = require('path')
const fs = require('fs')
const loaderUtils = require('loader-utils');

function getAcceptHotForComponent (componentName, relativePath) {
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

function getComponentsWithRelativePath (contextPath, componentTypes) {
  const components = []

  Object.keys(componentTypes).forEach((compName) => {
    const compType = componentTypes[compName]
    let compModulePath

    if (!compType.directory) {
      return
    }

    compModulePath = path.join(compType.directory, 'shared/index.js')

    components.push({
      name: compName,
      relativePath: path.relative(
        contextPath,
        compModulePath
      )
    })
  })

  return components
}

module.exports = function(content) {
  const loaderOptions = loaderUtils.getOptions(this)
  let components = []

  if (loaderOptions && loaderOptions.componentTypes) {
    components = getComponentsWithRelativePath(
      path.dirname(this.resourcePath),
      loaderOptions.componentTypes
    )
  }

  if (components.length === 0) {
    return
  }

  const acceptCalls = (
    components
    .map((comp) => getAcceptHotForComponent(comp.name, comp.relativePath))
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
