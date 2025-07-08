#!/usr/bin/env node

const { Command } = require('commander');
const { select } = require('@inquirer/prompts');
const fs = require('fs-extra');
const path = require('path');
const ora = require('ora').default;

// Template mapping: folder name -> human readable name
const TEMPLATE_MAPPING = {
  'next-foundry-pvm': 'Next.js + Foundry (Polkadot VM)',
  'next-unique-nfts': 'Next.js + Unique SDK (Pallet NFTs)',
  'next-papi-nfts': 'Next.js + PAPI (Pallet NFTs)',
};

/**
 * Check if a directory is empty
 * @param {string} dirPath - Path to the directory to check
 * @returns {Promise<boolean>} - True if directory is empty or doesn't exist
 */
async function isDirectoryEmpty(dirPath) {
  if (!(await fs.pathExists(dirPath))) {
    return true;
  }

  const allowedFiles = ['.git', '.DS_Store'];

  const files = await fs.readdir(dirPath);
  const filteredFiles = files.filter(file => !allowedFiles.includes(file));
  return filteredFiles.length === 0;
}

/**
 * Validate that a directory can be used for project creation
 * @param {string} dirPath - Path to the directory to validate
 * @param {string} _dirName - Human-readable name for error messages (unused but kept for API consistency)
 * @throws {Error} - If directory is not suitable for project creation
 */
async function validateDirectory(dirPath, _dirName) {
  if (!(await isDirectoryEmpty(dirPath))) {
    throw new Error(
      `✖ Directory is not empty. Please provide a project name or use an empty directory.`
    );
  }
}

/**
 * Setup project path and name based on user input
 * @param {string|null} projectName - User-provided project name or null
 * @returns {Promise<{projectPath: string, projectName: string, useCurrentDir: boolean}>}
 */
async function setupProjectPath(projectName) {
  if (!projectName) {
    // Use current directory
    const currentDir = process.cwd();
    await validateDirectory(currentDir, 'current directory');

    return {
      projectPath: currentDir,
      projectName: path.basename(currentDir),
      useCurrentDir: true,
    };
  } else {
    // Create new directory
    const projectPath = path.join(process.cwd(), projectName);
    await validateDirectory(projectPath, projectName);

    return {
      projectPath,
      projectName,
      useCurrentDir: false,
    };
  }
}

/**
 * Get template selection from user
 * @param {string|null} templateOption - Pre-selected template from CLI options
 * @returns {Promise<string>} - Selected template folder name
 */
async function getTemplateSelection(templateOption) {
  if (templateOption) {
    return templateOption;
  }

  const templates = Object.keys(TEMPLATE_MAPPING);
  return await select({
    message: 'Choose a template:',
    choices: templates.map(t => ({
      name: TEMPLATE_MAPPING[t],
      value: t,
    })),
  });
}

/**
 * Create the project by copying template files
 * @param {string} templatePath - Source template path
 * @param {string} projectPath - Destination project path
 * @param {string} templateName - Human-readable template name
 */
async function createProject(templatePath, projectPath, templateName) {
  const spinner = ora(`Creating ${templateName} project...`).start();

  try {
    await fs.copy(templatePath, projectPath);
    spinner.succeed(`Created ${templateName} project`);
  } catch (error) {
    spinner.fail('Failed to create project');
    throw error;
  }
}

/**
 * Update package.json with project name
 * @param {string} projectPath - Path to the project
 * @param {string} projectName - Name for the project
 */
async function updatePackageJson(projectPath, projectName) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
}

/**
 * Display success message with next steps
 * @param {string} projectName - Name of the created project
 * @param {boolean} useCurrentDir - Whether project was created in current directory
 */
function showSuccessMessage(projectName, useCurrentDir) {
  console.log(`\nNext steps:`);
  if (!useCurrentDir) {
    console.log(`  cd ${projectName}`);
  }
  console.log(`  pnpm install`);
}

const program = new Command();

program
  .name('create-my-app')
  .argument('[project-name]')
  .option('-t, --template <template>', 'template to use')
  .action(async (projectName, options) => {
    try {
      // Setup project path and validate directory
      const {
        projectPath,
        projectName: finalProjectName,
        useCurrentDir,
      } = await setupProjectPath(projectName);

      // Get template selection
      const template = await getTemplateSelection(options.template);
      const templatePath = path.join(__dirname, '..', 'templates', template);

      // Create project
      await createProject(
        templatePath,
        projectPath,
        TEMPLATE_MAPPING[template]
      );

      // Update package.json
      await updatePackageJson(projectPath, finalProjectName);

      // Show success message
      showSuccessMessage(finalProjectName, useCurrentDir);
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  });

program.parse();
