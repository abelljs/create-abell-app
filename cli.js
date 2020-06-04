#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const {
  valueOf, 
  rmdirRecursiveSync, 
  boldGreen
} = require('./helpers.js');

const args = process.argv.slice(2);
const template = valueOf('--template') || 'https://github.com/abelljs/abell-starter-minima';

console.log(`\n${boldGreen('>>')} Fetching Template from GitHub ✨\n\n`);
execSync(`git clone ${template} ${args[0]}`, {
  stdio: [0, 1, 2] // we need this so node will print the command output
})

rmdirRecursiveSync(path.join(args[0], '.git'));

console.log(`\n${boldGreen('>>')} Installing Dependencies 📚\n\n`);
execSync(`cd ${args[0]} && npm install`, {
  stdio: [0, 1, 2] 
})

console.log(`\n${boldGreen('>>')} Finished Installing 🚀`);
console.log(`${boldGreen('>>')} \`cd ${args[0]}\` and \`npm run dev\` to run dev server ✨\n\n`);