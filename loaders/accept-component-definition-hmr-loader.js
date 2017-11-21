
const path = require('path')
const fs = require('fs')
const loaderUtils = require('loader-utils');

function getAcceptHotForComponent (componentName, relativePath) {
  return (
    `
    module.hot.accept('${relativePath}', function () {
      var ${componentName} = require('${relativePath}');

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
    '__ACCEPT_CALL__'
  }
}

function getComponentWithRelativePath (contextPath, componentTypes) {
  let component

  Object.keys(componentTypes).some((compName) => {
    const compType = componentTypes[compName]

    if (!compType.directory) {
      return false
    }

    if (path.join(compType.directory, 'index.designer.js') === contextPath) {
      component = compType
      return true
    }

    return false
  })

  if (!component) {
    return
  }

  const compModulePath = path.join(component.directory, 'shared/index.js')

  component = {
    name: component.name,
    relativePath: `./${path.relative(
      path.dirname(contextPath),
      compModulePath
    )}`
  }

  return component
}

module.exports = function(content) {
  const loaderOptions = loaderUtils.getOptions(this)
  let componentRelative

  if (loaderOptions && loaderOptions.componentTypes) {
    componentRelative = getComponentWithRelativePath(
      this.resourcePath,
      loaderOptions.componentTypes
    )
  }

  if (!componentRelative) {
    return content
  }

  const acceptCall = getAcceptHotForComponent(componentRelative.name, componentRelative.relativePath)
  const wrapperFn = componentFilesHotWrapper.toString().replace(/'__ACCEPT_CALL__'/g, acceptCall)

  return (
    `
    ${content}

    ;(${wrapperFn})();
    `
  )
}
