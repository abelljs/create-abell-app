#!/usr/bin/env node
const { program } = require('commander');
const { main } = require('../lib/actions.js');

program.version(require('../package.json').version, '-v|--version');

// main

/** 
 * create-abell-app [projectName] --template <template> --installer <installer>
 */
program
  .option('-t|--template <template>', 'Specify template for abell app')
  .option('-i|--installer <installer>', 'Specify package installer. npm or yarn.')
  .arguments('[projectName]')
  .action((projectName) => 
    main(projectName, {
      template: program.template,
      installer: program.installer
    })
  )
  
program.parse(process.argv);