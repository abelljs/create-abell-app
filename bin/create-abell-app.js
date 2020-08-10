#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prompts = require('prompts');

const {
  copyFolderSync,
  rmdirRecursiveSync, 
  colors
} = require('../lib/helpers.js');

const { getInstaller, getTemplate } = require('../lib/create-utils.js');

async function createAbellApp(directoryName) {

  const template = getTemplate();
  const installCommand = await getInstaller();
  
  const execOptions = {
    stdio: [0, 1, 2]
  }
  
  if (template === 'default' || template === 'minimal') {
    // copy default template from templates/default
    const templatesDir = path.join(__dirname, '..', 'templates')
    copyFolderSync(
      path.join(templatesDir, template), 
      directoryName, 
      [path.join(templatesDir, template, 'node_modules')]
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