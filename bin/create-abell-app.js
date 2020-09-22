#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');


const prompts = require('prompts');
const { program } = require('commander');

const { copyFolderSync, colors, rmdirRecursiveSync } = require('../lib/utils.js');

program.version(require('../package.json').version, '-v|--version');

// main

/** 
 * create-abell-app [projectName] --template <template> --installer <installer>
 */
program
  .option('-t|--template <template>', 'Specify template for abell app')
  .option('-i|--installer <installer>', 'Specify package installer. npm or yarn.')
  .arguments('[projectName]')
  .action(async (projectName) => {
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
    const template = getTemplate();
    const installCommand = await getInstallCommand();
    const execOptions = {
      stdio: [0, 1, 2]
    }
    
    console.log(`\n${colors.green('>>')} Creating New Abell Project 🌻`) 
    console.log(`${colors.cyan('Directory:')} ${projectName}\n${colors.cyan('Template:')} ${template}\n${colors.cyan('Package Installer:')} ${installCommand}\n`);
    
    
    // Start creating new project

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
      execSync(`git clone ${template} ${projectName}`)
    }

    // remove package-lock.json if preferred installer is yarn
    if (installCommand === 'yarn') {
      fs.unlinkSync(path.join(projectName, 'package-lock.json'));
    }

    // Delete git history
    rmdirRecursiveSync(path.join(projectName, '.git'));

    // Install dependencies
    console.log(`\n${colors.green('>')} Installing Dependencies 📚\n\n`);
    execSync(`cd ${projectName} && ${installCommand}`, execOptions)

    // Finish log
    console.log(`\n${colors.green('>')} Finished Installing Dependencies 🤠`);
    console.log(`${colors.green('>')} Successfully Created ${projectName} 🚀`);
    console.log(`\n${colors.green('>>')} \`cd ${projectName}\` and \`${installCommand === 'yarn' ? 'yarn' : 'npm run'} dev\` to run dev-server ✨\n\n`);
    // Exit
    process.exit(-1);
  });


// Functions
async function getInstallCommand() {
  if (!program.installer) {
    // if installer flag is undefined, ask user.
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

    return answers.installCommand;
  } 

  if (program.installer === 'yarn') {
    return 'yarn'
  } else {
    return 'npm install'
  }
}


function getTemplate() {
  // return default when value is not defined
  if (!program.template) return 'default'; 

  if (program.template === 'default' || program.template === 'minimal') {
    // 'default' and 'minimal' are valid templates. Return them as it is
    return program.template;
  }

  // when `--template abelljs/abell-starter-portfolio`
  if (!program.template.startsWith('https://github.com/')) {
    // If template value is `abelljs/abell-starter-portfolio`, add https://github.com before it.
    return 'https://github.com/' + program.template;
  }

  // when `--template https://github.com/abelljs/abell-starter-portfolio`
  return program.template;
}
  
program.parse(process.argv);