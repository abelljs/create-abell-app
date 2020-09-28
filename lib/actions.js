const fs = require('fs');
const path = require('path');

const prompts = require('prompts');
const { spawn } = require('child_process');

const { 
  getTemplate, 
  copyFolderSync,
  rmdirRecursiveSync,
  getInstallCommand, 
  colors,
  setCorrectAppName 
} = require("./utils.js");

async function executeCommand(...command) {
  return new Promise((resolve, reject) => {
    const child = spawn(...command);
  
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  })
}

async function createProject(projectName, template, installCommand) {
  if (template === 'default' || template === 'minimal') {
    // copy default template from templates directory
    const templatesDir = path.join(__dirname, '..', 'templates')
    copyFolderSync(
      path.join(templatesDir, template), 
      projectName, 
      [path.join(templatesDir, template, 'node_modules')]
    )
  } else {
    // Execute git clone
    console.log(`\n${colors.green('>')} Fetching Template from GitHub ✨\n\n`);
    try {
      await executeCommand('git', ['clone', template, projectName], {
        stdio: [process.stdin, process.stdout, process.stderr]
      });
    } catch (err) {
      throw err;
    }
  }

  // remove package-lock.json if preferred installer is yarn
  if (installCommand === 'yarn') {
    fs.unlinkSync(path.join(projectName, 'package-lock.json'));
  }

  // Delete git history
  rmdirRecursiveSync(path.join(projectName, '.git'));
}

async function main(projectName, options) {
  // if projectName is falsy, prompt user for new name
  if (!projectName) {
    projectName = (await prompts({
      type: 'text',
      message: 'Enter Name of your project',
      name: 'projectName',
      initial: 'hello-world'
    })).projectName;
  }

  projectName = projectName.toLowerCase().replace(/ |_/g, '-');
  const template = getTemplate(options.template);
  const installCommand = await getInstallCommand(options.installer);
  
  console.log(`\n${colors.green('>>')} Creating New Abell Project 🌻`) 
  console.log(`${colors.cyan('Directory:')} ${projectName}\n${colors.cyan('Template:')} ${template}\n${colors.cyan('Package Installer:')} ${installCommand}\n`);

  // Create project directory
  await createProject(projectName, template, installCommand)

  // Install dependencies
  console.log(`\n${colors.green('>')} Installing Dependencies 📚\n\n`);

  await executeCommand(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['install'] , {
    cwd: projectName,
    stdio: [process.stdin, process.stdout, process.stderr]
  });

  await setCorrectAppName(projectName);

  // Finish log
  console.log(`\n${colors.green('>')} Finished Installing Dependencies 🤠`);
  console.log(`${colors.green('>')} Successfully Created ${projectName} 🚀`);
  console.log(`\n${colors.green('>>')} \`cd ${projectName}\` and \`${installCommand === 'yarn' ? 'yarn' : 'npm run'} dev\` to run dev-server ✨\n\n`);
}

module.exports = {main}