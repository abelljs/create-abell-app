const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const expect = require('chai').expect;
const { createPathIfAbsent, rmdirRecursiveSync } = require('../lib/utils.js')

const basePath = path.join(__dirname, 'resources')


async function runCreateAbellApp({
  projectName,
  installer,
  template
}) {
  return new Promise((resolve, reject) => {
    const args = ['../../bin/create-abell-app.js', projectName];

    if (installer) {
      args.push('--installer', installer)
    }

    if (template) {
      args.push('--template', template);
    }

    const child = spawn(
      'node', 
      args, 
      {
        cwd: basePath,
        stdio: [process.stdin, process.stdout, process.stderr]
      }
    )

    child.on('close', (code) => {
      resolve();
    })
  })
}

function expectTheseFilesToExist(checkForFiles) {
  for (const filePath of checkForFiles) {
    it (`should have ${path.basename(filePath)}`, () => {
      expect(fs.existsSync(filePath)).to.equal(true)
    })
  }
}

describe('create-abell-app command', () => {
  before(() => {
    createPathIfAbsent(basePath);
  })

  describe('default template', () => {
    before(async () => {
      await runCreateAbellApp({
        projectName: 'my-test-blog',
        installer: 'npm',
        template: ''
      });
    })

    const checkForFiles = [
      path.join(basePath, 'my-test-blog', 'theme', 'index.abell'),
      path.join(basePath, 'my-test-blog', 'abell.config.js'),
      path.join(basePath, 'my-test-blog', 'node_modules', 'abell'),
      path.join(basePath, 'my-test-blog', '.gitignore')
    ]

    expectTheseFilesToExist(checkForFiles);

    it('should have a given name in package.json name field', () => {
      const packageJSON = require(path.join(basePath, 'my-test-blog', 'package.json'))
      expect(packageJSON.name).to.equal('my-test-blog');
    })
  })

  describe('remote template', () => {
    before(async () => {
      await runCreateAbellApp({
        projectName: 'my-remote-test-blog',
        installer: 'npm',
        template: 'abelljs/abell-default-starter'
      });
    })

    const checkForFiles = [
      path.join(basePath, 'my-remote-test-blog', 'theme', 'index.abell'),
      path.join(basePath, 'my-remote-test-blog', 'theme', 'components'),
      path.join(basePath, 'my-remote-test-blog', 'abell.config.js'),
      path.join(basePath, 'my-remote-test-blog', 'node_modules', 'abell'),
      path.join(basePath, 'my-remote-test-blog', '.gitignore')
    ]

    expectTheseFilesToExist(checkForFiles);
  })

  after(() => {
    rmdirRecursiveSync(basePath);
  })
});