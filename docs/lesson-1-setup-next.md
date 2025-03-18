# 🎯 Lesson 1: Setting Up a Next.js Project

In this first lesson, you'll learn how to set up a basic Next.js project that will serve as the foundation for building your NFT application on Polkadot's Asset Hub.

### 🔑 Objectives:
- Create and configure a Next.js project.
- Understand the structure of a Next.js project.

## 1. Creating a Next.js Project

Open your terminal and run the following command to bootstrap a fresh Next.js project with TypeScript:

```sh
npx create-next-app@latest nft-asset-hub --use-npm --typescript
```

> [!IMPORTANT]
> You will be asked a few questions that will define your project structure and dependencies. You are free to choose any configuration you like. However, if you want to follow the structure of this tutorial, answer as follows:
> - Would you like to use Tailwind CSS?: `Yes`
> - Would you like your code inside a `src/` directory: `No`
> - Would you like to use App Router? (recommended): `Yes`
> - Would you like to customize the import alias: `Yes`

This command will:

- Create a new directory named nft-asset-hub.
- Install necessary dependencies.
- Configure the project to use TypeScript.

## 2. Running Your Next.js Application

After successfully bootstrapping the project, navigate into the project directory:

```sh
cd nft-asset-hub
```

To verify everything was set up correctly, run your Next.js application locally with:

```sh
npm run dev
```

Open your browser and visit http://localhost:3000. You should see the default Next.js welcome page. If you see this, you've successfully set up your Next.js project!

## Understanding Your Next.js Project Structure

Your initial project structure will look like this:

```sh
nft-asset-hub
├── app
│   ├── layout.tsx
│   └── page.tsx
├── components (you will create later)
├── context (you will create later)
├── node_modules
├── public
├── .gitignore
├── next.config.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

Brief Explanation:
- `app` directory is used for routing and page components.
- `public` directory holds static files like images.
- `components` and `context` directories will be created later for reusable components and context providers.
- `next.config.ts` is for custom Next.js configurations.

### [➡️ Next lesson: Configuring Environment Variables](./lesson-2-setup-env.md)