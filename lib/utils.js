const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

/**
 * Recursively creates the path
 * @param {String} pathToCreate path that you want to create
 */
function createPathIfAbsent(pathToCreate) {
  // prettier-ignore
  pathToCreate
    .split(path.sep)
    .reduce((prevPath, folder) => {
      const currentPath = path.join(prevPath, folder, path.sep);
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      }
      return currentPath;
    }, '');
}

/**
 *
 * @param {String} from - Path to copy from
 * @param {String} to - Path to copy to
 * @param {Array} ignore - files/directories to ignore
 * @param {Boolean} ignoreEmptyDirs - Ignore empty directories while copying
 * @return {void}
 */
function copyFolderSync(from, to, ignore = [], ignoreEmptyDirs = true) {
  if (ignore.includes(from)) {
    return;
  }
  const fromDirectories = fs.readdirSync(from);

  createPathIfAbsent(to);
  fromDirectories.forEach((element) => {
    const fromElement = path.join(from, element);
    const toElement = path.join(to, element);
    if (fs.lstatSync(fromElement).isFile()) {
      if (!ignore.includes(fromElement)) {
        fs.copyFileSync(fromElement, toElement.replace(/gitignore/g, '.gitignore'));
      }
    } else {
      copyFolderSync(fromElement, toElement, ignore);
      if (fs.existsSync(toElement) && ignoreEmptyDirs) {
        try {
          fs.rmdirSync(toElement);
        } catch (err) {
          if (err.code !== 'ENOTEMPTY') throw err;
        }
      }
    }
  });
}


function rmdirRecursiveSync(pathToRemove) {
  if (fs.existsSync(pathToRemove)) {
    fs.readdirSync(pathToRemove).forEach((file, index) => {
      const curPath = path.join(pathToRemove, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        rmdirRecursiveSync(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathToRemove);
  }
};

function getTemplate(templateVal) {
  // return default when value is not defined
  if (!templateVal) return 'default'; 

  if (templateVal === 'default' || templateVal === 'minimal') {
    // 'default' and 'minimal' are valid templates. Return them as it is
    return templateVal;
  }

  // when `--template abelljs/abell-starter-portfolio`
  if (!templateVal.startsWith('https://github.com/')) {
    // If template value is `abelljs/abell-starter-portfolio`, add https://github.com before it.
    return 'https://github.com/' + templateVal;
  }

  // when `--template https://github.com/abelljs/abell-starter-portfolio`
  return templateVal;
}



// Functions
async function getInstaller(installerVal) {
  if (!installerVal) {
    // if installer flag is undefined, ask user.
    const answers = await prompts({
      type: 'select',
      message: 'Select Installer',
      name: 'installer',
      choices: [
        {
          title: 'npm',
          value: 'npm'
        },
        {
          title: 'yarn',
          value: 'yarn'
        }
      ]
    })

    return answers.installer;
  } 

  if (installerVal === 'yarn') {
    return 'yarn'
  } else {
    return 'npm install'
  }
}

const colors = {
  cyan: (message) => `\u001b[36m${message}\u001b[39m`,
  green: (message) => `\u001b[1m\u001b[32m${message}\u001b[39m\u001b[22m`
}

/**
 * @param {String} packagePath full path to package.json
 * @param {String} appName name of the app
 * @description Updates the name property in JSON file
 */
function setNameInPackageJSON(packagePath, appName) {
  const packageJSON = require(packagePath);
  packageJSON.name = appName;
  fs.writeFileSync(packagePath, JSON.stringify(packageJSON, null, 2));
}

module.exports = {
  rmdirRecursiveSync, 
  createPathIfAbsent,
  copyFolderSync, 
  getTemplate,
  getInstaller,
  colors,
  setNameInPackageJSON
};
