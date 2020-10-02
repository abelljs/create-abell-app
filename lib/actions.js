const fs = require("fs");
const path = require("path");

const prompts = require("prompts");
const { spawn } = require("child_process");

const {
  getTemplate,
  copyFolderSync,
  rmdirRecursiveSync,
  getInstaller,
  colors,
  setNameInPackageJSON,
} = require("./utils.js");

async function executeCommand(...command) {
  return new Promise((resolve, reject) => {
    const child = spawn(...command);

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
}

async function createProject(projectName, template, installer) {
  if (template === "default" || template === "minimal") {
    // copy default template from templates directory
    const templatesDir = path.join(__dirname, "..", "templates");
    copyFolderSync(path.join(templatesDir, template), projectName, [
      path.join(templatesDir, template, "node_modules"),
    ]);
  } else {
    // Execute git clone
    console.log(`\n${colors.green(">")} Fetching Template from GitHub ✨\n\n`);
    try {
      await executeCommand("git", ["clone", template, projectName], {
        stdio: [process.stdin, process.stdout, process.stderr],
      });
    } catch (err) {
      throw err;
    }
  }

  // remove package-lock.json if preferred installer is yarn
  if (installer === "yarn") {
    fs.unlinkSync(path.join(projectName, "package-lock.json"));
  }

  // Delete git history
  rmdirRecursiveSync(path.join(projectName, ".git"));
}

async function main(projectName, options) {
  // if projectName is falsy, prompt user for new name
  if (!projectName) {
    projectName = (
      await prompts({
        type: "text",
        message: "Enter Name of your project",
        name: "projectName",
        initial: "hello-world",
      })
    ).projectName;
  }

  projectName = projectName.toLowerCase().replace(/ |_/g, "-");
  const template = getTemplate(options.template);
  const installer = await getInstaller(options.installer);

  console.log(`\n${colors.green(">>")} Creating New Abell Project 🌻`);
  console.log(
    `${colors.cyan("Directory:")} ${projectName}\n${colors.cyan(
      "Template:"
    )} ${template}\n${colors.cyan("Package Installer:")} ${installer}\n`
  );

  // Create project directory
  await createProject(projectName, template, installer);

  // Install dependencies
  console.log(`\n${colors.green(">")} Installing Dependencies 📚\n\n`);

  // checking if the template is local
  if (template === "default" || template === "minimal") {
    // version abell from templates
    // we will be using it after V 1.0.0
    // const packageFile = require("../templates/default/package.json");
    // const abellTemplateVersion = parseInt(
    //   packageFile.devDependencies.abell[1] + 1
    // );
    const isWindows = /^win/.test(process.platform);
    let installerCommand = [
      isWindows ? "npm.cmd" : "npm",
      ["install", "abell@latest"],
    ];
    // if local, ignoring the command
    if (installer === "yarn") {
      installerCommand = [
        isWindows ? "yarn.cmd" : "yarn",
        ["add", "abell@latest"],
      ];
    }
    await executeCommand(...installerCommand, {
      cwd: projectName,
      stdio: [process.stdin, process.stdout, process.stderr],
    });
  } else {
    const isWindows = /^win/.test(process.platform);
    let installerCommand = [isWindows ? "npm.cmd" : "npm", ["install"]];
    if (installer === "yarn") {
      installerCommand = [isWindows ? "yarn.cmd" : "yarn"];
    }
    await executeCommand(...installerCommand, {
      cwd: projectName,
      stdio: [process.stdin, process.stdout, process.stderr],
    });
  }

  // Set projectName in package.json name field
  try {
    const packageName = path.basename(projectName);
    const packagePath = path.join(process.cwd(), projectName, "package.json");
    setNameInPackageJSON(packagePath, packageName);
  } catch (err) {
    console.log(
      "> Could not add custom name to package.json. Not a big issue. Everything will still work."
    );
  }

  // Finish log
  console.log(`\n${colors.green(">")} Finished Installing Dependencies 🤠`);
  console.log(`${colors.green(">")} Successfully Created ${projectName} 🚀`);
  console.log(
    `\n${colors.green(">>")} \`cd ${projectName}\` and \`${
      installer === "yarn" ? "yarn" : "npm run"
    } dev\` to run dev-server ✨\n\n`
  );
}

module.exports = { main };
