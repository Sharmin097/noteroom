# Welcome to the NoteRoom Project

**NoteRoom** is the premier platform for mastering learning, streamlining organization, and fostering intellectual collaboration, all while enhancing your cognitive social experience.

---
<br>

# Folder Structure and Conventions

Our project is based on **NodeJS-Express-MongoDB (mongoose)** and **React**.
This documentation will show you all the conventions, tools and other things we use to make things aligned acorss the team

- ### Folder Structure
   1. `backend/` - All the backend APIs, services and database models
   
      - `apis/` - REST APIs
      - `graphql/` - GraphQL APIs
         - `queries/` - The GraphQL queries used by the client
         - `resolvers/` - Query resolvers
         - `scalar/` - Custom GraphQL scalars
         - `typeDefs/` - GraphQL query type definitions

      - `schemas/` - Database schemas and models
      - `services/` - Backend services and business logics

   2. `frontend/` - All the frontend components (Currently React), controllers, managers and functions
      - `src/assets` - Public images, videos and all those things
      - `src/public` - Publicl css, js if needed
      - `src/pages` - Components and controllers for each page. Each page will have a folder
      - `src/partials` - Common components used across the platform
      - `src/reducers` - React Reducers implementations
      - `src/context` - React Context Managers implementations
      - `src/utils` - Utility functions
      

   3. `types/` - All the globally defined types which are used by the backend and frontend to follow a fixed data structure. 

- ### File naming conventions:
   For naming files, we use *file suffix conventions* or *role-based file namings*. The role of the file is added right after its name using a dot.notation before the extension. Like API files will be like, something.api.ts, GraphQL type definition files will be like something.typeDef.ts

- ### Environment Variables:
   There are currently 2 .env files, one for backend which will be inside **backend/** directory at root level. And the other one will be for frontend which will be inside **frontend/** at root level.

- ### File Organization Rules:
   Currently we are following type-based file organization. Same type of files will go together. For say all the REST APIs will go into backend/apis folder

- ### Best Practices:
   - Try to use 4 space tabs. 
   - We prefer not to break lines unnecessarily, specially breaking each lines of HTML attributes. Avoid using Prettier or configure it in that way.
   - We prefer functional approach rather than OOP in JavaScript. But obviously depends on the product's complexity and developer's mindset. But for React, we have been using functional approach rather than OOP for a long time for simplicity. 
   - For React components, we prefer defining functions by `function` keyword rather than arrow functions. This makes the component look a bit cool!! But for smaller chunks, arrow functions can be used.

- ### Important Extensions We Use:  
   <table border="1">
      <tr>
         <th>Extension</th>
         <th>Extension ID</th>
      </tr>
      <tr>
         <td>Better Comments</td>
         <td>aaron-bond.better-comments</td>
      </tr>
      <tr>
         <td>Error Lens</td>
         <td>usernamehw.errorlens</td>
      </tr>
      <tr>
         <td>Postman</td>
         <td>Postman.postman-for-vscode</td>
      </tr>
      <tr>
         <td>TypeLens</td>
         <td>kisstkondoros.typelens</td>
      </tr>
      <tr>
         <td>Rainbow Brackets</td>
         <td>tal7aouy.rainbow-bracket</td>
      </tr>
      <tr>
         <td>ESLint</td>
         <td>dbaeumer.vscode-eslint</td>
      </tr>
      <tr>
         <td>Apollo GraphQL</td>
         <td>apollographql.vscode-apollo</td>
      </tr>
   </table>
<br>

---
# NPM Monorepo Guide

This project follows a **monorepo structure** with a root `package.json` file and separate `package.json` files for the **frontend** (`frontend/package.json`) and **backend** (`backend/package.json`).

## Module Installation

Since this is a **monorepo**, where both frontend and backend are managed from a single root `package.json`, module installation follows specific rules:

1. **Installing all dependencies** (for both frontend and backend):
   ```sh
   npm install --workspaces
   ```
   This installs all required dependencies and distributes them into the respective workspaces.

2. **Installing a shared module (used in both frontend and backend):**
   ```sh
   npm install <package-name> -w backend -w frontend
   ```
   This ensures the module is installed and accessible in both workspaces.

3. **Installing a backend-only module:**
   ```sh
   npm install <package-name> -w backend
   ```

4. **Installing a frontend-only module:**
   ```sh
   npm install <package-name> -w frontend
   ```

## Scripts Overview

All development and build scripts are **listed in the root `package.json`**. Scripts must be executed from the root directory.

1. **Building the backend:**
   ```sh
   npm run build:backend
   ```
   - This compiles TypeScript files and generates a `dist/` folder inside `backend/`.

2. **Building the frontend:**
   ```sh
   npm run build:frontend
   ```
   - This compiles React files and generates a `dist/` folder inside `frontend/`.

3. **Running the backend development server:**
   ```sh
   npm run dev:backend
   ```
   - This starts the Node.js server with `nodemon` for automatic restarts on file changes.

4. **Running the frontend development server:**
   ```sh
   npm run dev:frontend
   ```
   - This starts the **Vite** development server for the React frontend.


<br><br>

<hr>

<p align="center" style="margin-top: 40px;">
  <img src="https://storage.googleapis.com/noteroom-fb1a7.appspot.com/Assets/ng_logo.png" alt="Noteroom Logo" width="100" height="100" />
</p>

<p align="center" style="font-size: 16px; font-weight: 400; margin-top: 10px;">
  Maintained by <span style="font-size: 20px; font-weight: 600">NoteRoom</span>
</p>

<hr>
