#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prompts = require('prompts');

const {
  valueOf, 
  copyFolderSync,
  rmdirRecursiveSync, 
  colors
} = require('../lib/helpers.js');

function getTemplate() {
  let template = valueOf('--template');
  if (!template) {
    return 'default';
  }

  if (!template.startsWith('https://github.com/')) {
    // If template value is `abelljs/abell-starter-portfolio`, add https://github.com before it.
    template = 'https://github.com/' + template;
  }

  return template;
}

async function getInstaller() {
  let installCommand = 'npm install';

  if (!valueOf('--installer')) {
    const answers = await prompts({
      type: 'select',
      message: 'Select Installer',
      name: 'installCommand',
      choices: [
        {
          title: 'npm',
          value: 'npm install'
        },
        {
          title: 'yarn',
          value: 'yarn'
        }
      ]
    })

    installCommand = answers.installCommand;
  } else {
    installCommand = valueOf('--installer');
  }

  return installCommand;
}

async function createAbellApp(directoryName) {

  const template = getTemplate();
  const installCommand = await getInstaller();
  
  const execOptions = {
    stdio: [0, 1, 2]
  }
  
  if (template === 'default') {
    // copy default template from templates/default
    const templatesDir = path.join(__dirname, '..', 'templates')
    copyFolderSync(
      path.join(templatesDir, 'default'), 
      directoryName, 
      [path.join(templatesDir, 'default', 'node_modules')]
    )
  } else {
    // Execute git clone
    console.log(`\n${colors.green('>>')} Fetching Template from GitHub ✨\n\n`);
    execSync(`git clone ${template} ${directoryName}`, execOptions)
  }
  

  if (installCommand === 'yarn') {
    fs.unlinkSync(path.join(directoryName, 'package-lock.json'))
  }
  // Delete git history
  rmdirRecursiveSync(path.join(directoryName, '.git'));
  
  // Install dependencies
  console.log(`\n${colors.green('>>')} Installing Dependencies 📚\n\n`);
  execSync(`cd ${directoryName} && ${installCommand}`, execOptions)
  
  // Finish log
  console.log(`\n${colors.green('>>')} Finished Installing 🚀`);
  console.log(`${colors.green('>>')} \`cd ${directoryName}\` and \`${installCommand === 'yarn' ? 'yarn' : 'npm run'} dev\` to run dev server ✨\n\n`);
}

// Main 
(async () => {
  const args = process.argv.slice(2);
  
  let command = args[0];
  if (!command) {
    command = (await prompts({
      type: 'text',
      message: 'Enter Name of your project',
      name: 'projectName',
      initial: 'hello-world'
    })).projectName;
  }
  
  if (command.toLowerCase() === '-v' || command.toLowerCase() === '--version') {
    console.log('v' + require('../package.json').version);
  } else {
    createAbellApp(command);
  }
})();


module.exports = createAbellApp