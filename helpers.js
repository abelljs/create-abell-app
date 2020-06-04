const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

function valueOf(flag) {
  if (args.includes(flag)) {
    return args[args.indexOf(flag) + 1];
  }
  return false;
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

const boldGreen = (message) =>
  `\u001b[1m\u001b[32m${message}\u001b[39m\u001b[22m`;

module.exports = {valueOf, rmdirRecursiveSync, boldGreen};
