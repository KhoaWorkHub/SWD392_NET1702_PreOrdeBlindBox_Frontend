# Project Setup Guide for Collaborators
This guide provides instructions for setting up and running the project using either Bun or npm.
Prerequisites for Both Methods

Make sure you have Node.js installed (Latest LTS version recommended)
Clone the project repository:

bashCopygit clone [your-repository-url]
cd [project-name]
# Method 1: Using Bun (Recommended)
First-time Bun Setup

Install Bun (macOS/Linux):

bashCopycurl -fsSL https://bun.sh/install | bash

After installation, restart your terminal or run:

bashCopysource ~/.bashrc  # for bash users
# OR
source ~/.zshrc   # for zsh users

Verify Bun installation:

bashCopybun --version
Running the Project with Bun

Install dependencies:

bashCopybun install

Start the development server:

bashCopybun run dev
The project will be available at http://localhost:5173

# Method 2: Using npm
If you prefer using npm, follow these steps:

Ensure you have Node.js installed:

bashCopynode --version

Install dependencies:

bashCopynpm install

Start the development server:

bashCopynpm run dev
The project will be available at http://localhost:5173
Common Issues and Solutions
# For Bun Users:

If you encounter permission issues during Bun installation, try running the install command with sudo
If Bun command is not found, ensure your PATH includes ~/.bun/bin
For Windows users, use WSL2 as Bun requires a Unix-like environment

# For npm Users:

If you get dependency errors, try removing node_modules and package-lock.json, then run npm install again
If you encounter port conflicts, the development server will automatically try to use the next available port

Environment Setup
Make sure to create a .env file in the project root if required:
bashCopycp .env.example .env  # if .env.example exists
Additional Commands
For Bun:
bashCopybun run build        # Build for production
bun run preview      # Preview production build
For npm:
bashCopynpm run build        # Build for production
npm run preview      # Preview production build
Working with the Project

The development server supports hot module replacement (HMR)
Changes to code will automatically refresh in the browser
Check the console for any compilation errors
The development server will show compile errors in the browser

Getting Help
If you encounter any issues:

Check that you're using the correct Node.js version
Verify all dependencies are installed correctly
Make sure your environment variables are set properly
Consult the project's issue tracker or reach out to the team

Useful Development Tools

React Developer Tools for Chrome/Firefox
VS Code extensions:

ESLint
Prettier
Tailwind CSS IntelliSense



Remember to check the project's README.md for any project-specific setup instructions or requirements.


-------------------------------------------------------------------------------------------------------------------------------------------
# HOW TO SET UP REACT + VITE BLINDBOX PREORDER FRONTEND PROJECT

# Setting Up React + Vite Project with Bun and Tailwind CSS

This guide walks you through setting up a React project using Vite as the build tool, Bun as the JavaScript runtime/package manager, and Tailwind CSS for styling.

## Node.js Version Management

It's recommended to use Node Version Manager (NVM) for this project. The current recommended Node.js version is the latest LTS version.

### Installing NVM

1. Install NVM:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

2. Restart your terminal or run:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

3. Install and use the latest Node.js version:
```bash
nvm install node  # installs the latest version
nvm use node     # uses the latest version
```

4. Verify your Node.js version:
```bash
node --version
```

## Prerequisites

- macOS or Linux operating system
- Terminal access
- VS Code or WebStorm IDE

## Installation Steps

### 1. Install Bun

For macOS and Linux users, open your terminal and run:

```bash
curl -fsSL https://bun.sh/install | bash
```

After installation, restart your terminal or run:
```bash
source ~/.bashrc  # for bash users
# OR
source ~/.zshrc   # for zsh users
```

Verify the installation:
```bash
bun --version
```

### 2. Create a New Vite Project with Bun

Navigate to your desired project directory and run:

```bash
bun create vite
```

Follow the prompts:
1. Enter your project name
2. Select "React" as your framework
3. Choose "TypeScript" or "JavaScript" based on your preference

### 3. Navigate to Project Directory

```bash
cd your-project-name
```

### 4. IDE Setup

Open the project in your preferred IDE:

```bash
code .  # for VS Code
# OR
webstorm .  # for WebStorm
```

### 5. Clean Up Default Files

1. Delete `src/App.css`
2. Remove all content from `src/index.css`
3. Remove the CSS import from `src/App.tsx` or `src/App.jsx`

### 6. Install and Configure Tailwind CSS

1. Install Tailwind CSS and the Vite plugin:

```bash
bun add tailwindcss @tailwindcss/vite
```

2. Configure the Vite plugin in `vite.config.ts` (or `vite.config.js`):

```typescript
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})
```

3. Import Tailwind CSS in your main CSS file (`src/index.css`):

```css
@import "tailwindcss";
```

4. Ensure your CSS is included in the HTML head section. In a React + Vite project, this is typically handled automatically through your `main.tsx`/`main.jsx` file's import of `index.css`.

## Development

Start the development server:

```bash
bun run dev
```

Your project will be available at `http://localhost:5173` by default.

## Important Notes

- No need to run `bun install` or `npm install` separately as Bun handles dependencies automatically
- Use `bun run dev` for development
- Use `bun run build` for production builds
- The development server supports hot module replacement (HMR)

## Project Structure

```
your-project-name/
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js

└── vite.config.js
```

## Troubleshooting

If you encounter any issues:

1. Make sure Bun is properly installed and in your PATH
2. Check if all dependencies are correctly listed in `package.json`
3. Clear the Bun cache if needed: `bun pm cache rm`
4. Verify that your Node.js version is compatible with Vite
