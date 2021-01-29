const fs = require('fs');
const path = require('path');

const prompts = require('prompts');
const { spawn } = require('child_process');

const {
  getTemplate,
  copyFolderSync,
  rmdirRecursiveSync,
  getInstaller,
  colors,
  setNameInPackageJSON
} = require('./utils.js');

/**
 * Executes command
 * @param  {...any} command Exection parameters
 */
async function executeCommand(...command) {
  return new Promise((resolve, reject) => {
    const child = spawn(...command);

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject();
      }
    });
  });
}

/**
 * Creates project boilerplate
 * @param {string} projectPath name of the project
 * @param {string} template name of the template
 * @param {string} installer package installer
 */
async function createProject(projectPath, template, installer) {
  if (template === 'default' || template === 'minimal') {
    // copy default template from templates directory
    const templatesDir = path.join(__dirname, '..', 'templates');
    copyFolderSync(path.join(templatesDir, template), projectPath, [
      path.join(templatesDir, template, 'node_modules')
    ]);
  } else {
    // Execute git clone
    console.log(`\n${colors.green('>')} Fetching Template from GitHub ✨\n\n`);
    try {
      await executeCommand('git', ['clone', template, projectPath], {
        stdio: [process.stdin, process.stdout, process.stderr]
      });
    } catch (err) {
      throw err;
    }
  }

  // remove package-lock.json if preferred installer is yarn
  if (installer === 'yarn') {
    if (fs.existsSync(path.join(projectPath, 'package-lock.json'))) {
      fs.unlinkSync(path.join(projectPath, 'package-lock.json'));
    }
  }

  // Delete git history
  rmdirRecursiveSync(path.join(projectPath, '.git'));
}

/**
 * main function that executes
 * @param {string} projectName name of the project
 * @param {object} options
 */
async function main(projectName, options) {
  // if projectName is falsy, prompt user for new name
  if (!projectName) {
    projectName = (
      await prompts({
        type: 'text',
        message: 'Enter Name of your project',
        name: 'projectName',
        initial: 'hello-world'
      })
    ).projectName;
  }

  const projectSlugName = projectName.toLowerCase().replace(/ |_/g, '-');
  const projectPath = path.join(process.cwd(), projectSlugName);
  const projectDisplayName = path.basename(projectPath);

  if (fs.existsSync(projectPath)) {
    // oops. Can be an issue
    if (fs.readdirSync(projectPath).length !== 0) {
      // Not an empty directory so break!
      console.error(
        `${colors.red(
          '>> '
        )} The directory already exists and is not an empty directory`
      );
      process.exit(0);
    }
  }

  const template = getTemplate(options.template);
  const installer = await getInstaller(options.installer);
  // does not exist so go on and create!

  console.log(`\n${colors.green('>>')} Creating New Abell Project 🌻`);
  console.log(
    `${colors.cyan('Directory:')} ${projectDisplayName}\n${colors.cyan(
      'Template:'
    )} ${template}\n${colors.cyan('Package Installer:')} ${installer}\n`
  );

  await createProject(projectPath, template, installer);

  // Install dependencies
  console.log(`\n${colors.green('>')} Installing Dependencies 📚\n\n`);

  const isWindows = /^win/.test(process.platform);
  let installerCommand;

  // checking if the template is local
  if (template === 'default' || template === 'minimal') {
    // TODO: Before releasing 1.0.0, We will have to do update the templates

    // If the template is local, we install latest version of abell
    installerCommand = [
      isWindows ? 'npm.cmd' : 'npm',
      ['install', '--save-dev', 'abell@latest']
    ];

    if (installer === 'yarn') {
      installerCommand = [
        isWindows ? 'yarn.cmd' : 'yarn',
        ['add', '--dev', 'abell@latest']
      ];
    }
  } else {
    // If template is not local, we run `npm install` which installs the version
    // mentioned in package.json of the repository.
    installerCommand = [isWindows ? 'npm.cmd' : 'npm', ['install']];

    if (installer === 'yarn') {
      installerCommand = [isWindows ? 'yarn.cmd' : 'yarn'];
    }
  }

  await executeCommand(...installerCommand, {
    cwd: path.join(process.cwd(), projectName),
    stdio: [process.stdin, process.stdout, process.stderr]
  });

  // Set projectName in package.json name field
  try {
    const packageName = path.basename(projectDisplayName);
    const packagePath = path.join(
      process.cwd(),
      projectDisplayName,
      'package.json'
    );
    setNameInPackageJSON(packagePath, packageName);
  } catch (err) {
    console.log(
      // eslint-disable-next-line max-len
      '> Could not add custom name to package.json. Not a big issue. Everything will still work.'
    );
  }

  // Finish log
  console.log(`\n${colors.green('>')} Finished Installing Dependencies 🤠`);
  console.log(
    `${colors.green('>')} Successfully Created ${projectDisplayName} 🚀`
  );
  if (projectName !== '.') {
    console.log(
      `\n${colors.green('>>')} \`cd ${projectSlugName}\` and \`${
        installer === 'yarn' ? 'yarn' : 'npm run'
      } dev\` to run dev-server ✨\n\n`
    );
  } else {
    console.log(
      `\n${colors.green('>>')} \ \`${
        installer === 'yarn' ? 'yarn' : 'npm run'
      } dev\` to run dev-server ✨\n\n`
    );
  }
}

module.exports = { main, executeCommand };
