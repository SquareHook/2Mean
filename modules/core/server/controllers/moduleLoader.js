var path = require('path');

var fs = require('fs');

function moduleLoader(config) {
  var modDirs = [];

  var moduleDir = path.resolve(config.basedir, 'modules');

  var moduleList = [];

  var loadedModules = {
    roleManager: roles
  };

  var loadedModels = [];

  var roles;

  constructor();

  function constructor() {
    processModules(fs.readdirSync(moduleDir));
  }

  function processModules(mods) {
    var i = 0;

    for (; i < mods.length; i++) {
      // Valid until proven not valid
      let moduleInfo = {
        absPath: moduleDir + '/' + mods[i],
        name: mods[i],
        valid: true
      };

      let config = parseConfiguration(moduleInfo, 'module.js');

      // Prevent core from double loading.
      if (config && mods[i] !== 'core') {
        moduleInfo.routes = parseConfiguration(moduleInfo, 'routes.js') || [];
        moduleInfo.config = config;

        moduleList.push(moduleInfo);
      }
    }
  }

  function parseConfiguration(modInfo, filename) {
    var configFile = path.resolve(modInfo.absPath + '/server/config/' + filename);

    if (fs.existsSync(configFile)) {
      return require(configFile);
    }

    return null;
  }

  function getRoutes() {
    var routes = {};

    moduleList.forEach((module) => {
      var modName = module.name;

      routes[modName] = module.routes;
    });

    return routes;
  }

  /*
   * Will allow retreival of modules.
   *
   * @param {string} moduleName The name of the module to retreive.
   *
   * @return {Object} The module.
   */
  function get(moduleName) {
    var modConfig = findModule(moduleName);
    var dependencies = [];
    var module = null;

    if (loadedModules[moduleName]) {
      return loadedModules[moduleName];
    }

    loadModels(modConfig);

    if (modConfig === null) {
      return null;
    }

    if (modConfig.config.dependencies && modConfig.config.dependencies.length > 0) {

      // Load dependencies first for injection.
      for (let i = 0; i < modConfig.config.dependencies.length; i++) {
        let depInfo = findModule(modConfig.config.dependencies[i]);

        if (depInfo !== null) {
          dependencies.push(get(depInfo.name));
        }
      }
    }

    module = require(modConfig.absPath + '/server/');

    // Loads the module and also provides the module loader as a second argument
    loadedModules[modConfig.name] = new module(dependencies, this);

    return loadedModules[modConfig.name];
  }

  function loadModels(modInfo) {
    if (!modInfo.config.models || modInfo.config.models.length < 1) {
      return;
    }

    modInfo.config.models.forEach((model) => {
      let modelFile = modInfo.absPath + '/server/models/' + model;

      if (fs.existsSync(modelFile + '.js')) {
        loadedModels[model] = require(modelFile);
      }
    });
  }

  /*
   * Finds and returns the registered information on a given module.
   *
   * @param {string} name The name of the module to find.
   *
   * @return {Object} The configuration data on the module.
   */
  function findModule(name) {
    for (var i = 0; i < moduleList.length; i++) {
      if (moduleList[i].name === name) {
        return moduleList[i];
      }
    }
    return null;
  }

  function listModules() {
    return moduleList;
  }

  function setRoles(roleManager) {
    roles = roleManager;
  }

  function reportRoles() {
    console.log(roles);
  }

  return {
    getRoutes   : getRoutes,
    get         : get,
    listModules : listModules,
    setRoles    : setRoles
  }
}

module.exports = moduleLoader;
