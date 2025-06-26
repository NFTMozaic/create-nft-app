#!/usr/bin/env node

const { Command } = require('commander');
const { select } = require('@inquirer/prompts');
const fs = require('fs-extra');
const path = require('path');

const program = new Command();

program
  .name('create-my-app')
  .argument('[project-name]')
  .option('-t, --template <template>', 'template to use')
  .action(async (projectName, options) => {
    const templates = ['next-foundry'];

    let template = options.template;

    if (!template) {
      template = await select({
        message: 'Choose a template:',
        choices: templates.map(t => ({ name: t, value: t })),
      });
    }

    const templatePath = path.join(__dirname, '..', 'templates', template);
    const projectPath = path.join(process.cwd(), projectName);

    try {
      await fs.copy(templatePath, projectPath);

      const packageJsonPath = path.join(projectPath, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        packageJson.name = projectName;
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      }

      console.log(`✅ Created ${projectName} with ${template} template`);
      console.log(`\nNext steps:`);
      console.log(`  cd ${projectName}`);
      console.log(`  pnpm install`);
    } catch (error) {
      console.error('❌ Error creating project:', error.message);
    }
  });

program.parse();
