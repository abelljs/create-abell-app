const prompts = require('prompts');
const { valueOf } = require('./helpers.js')

function getTemplate() {
  let template = valueOf('--template');
  
  // when there is not --template flag
  if (!template) {
    return 'default';
  }

  // when `--template default` or `--template minimal`
  if (template === 'default' || template === 'minimal') {
    return template;
  }

  // when `--template abelljs/abell-starter-portfolio`
  if (!template.startsWith('https://github.com/')) {
    // If template value is `abelljs/abell-starter-portfolio`, add https://github.com before it.
    template = 'https://github.com/' + template;
  }

  // when `--template https://github.com/abelljs/abell-starter-portfolio`
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
    if (valueOf('--installer') === 'yarn') {
      installCommand = 'yarn';
    } else {
      installCommand = 'npm install'
    }
  }

  return installCommand;
}

module.exports = { getInstaller, getTemplate }