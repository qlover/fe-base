# examples/react-seed

## 1.5.0

### Minor Changes

#### ♻️ Refactors

- **AuthStore, UserService:** Enhance authentication storage and session management ([6cc85e5](https://github.com/qlover/fe-base/commit/6cc85e5258c3422470b13e1219cb4efb5c834839)) ([#669](https://github.com/qlover/fe-base/pull/669))

### Patch Changes

- Update dependency **@qlover/corekit-bridge** from `3.3.0` to `3.4.0`
- Update dependency **@qlover/fe-corekit** from `3.4.4` to `3.5.0`
- Update dependency **@qlover/tailwind-theme** from `0.2.1` to `0.3.0`
- Update dependency **@qlover/oauth-wrapper** from `0.6.3` to `0.6.4`

## 1.4.4

### Patch Changes

#### ✨ Features

- **create-app:** Update package.json files across examples to enhance descriptions and improve clarity ([7cadb9b](https://github.com/qlover/fe-base/commit/7cadb9b48b54658184a93a9a68e96aa725cd31dd)) ([#661](https://github.com/qlover/fe-base/pull/661))

- **react-seed:** Refactor bootstrapping and schema validation ([f7ef618](https://github.com/qlover/fe-base/commit/f7ef61887d73902f5ee66650e9127d5b1871c726)) ([#658](https://github.com/qlover/fe-base/pull/658))

#### ♻️ Refactors

- **react-seed:** Remove lodash-es and replace with custom omit utility ([3cc4d28](https://github.com/qlover/fe-base/commit/3cc4d28f66712d7fe79eddc7c24b35138a9bfc02)) ([#658](https://github.com/qlover/fe-base/pull/658))

- **react-seed:** Revamp ESLint configuration and dependencies ([d854bd4](https://github.com/qlover/fe-base/commit/d854bd40fd04830d1888b5a7a27a60f88acb11cf)) ([#658](https://github.com/qlover/fe-base/pull/658))
- Update dependency **@qlover/fe-corekit** from `3.4.3` to `3.4.4`
- Update dependency **@qlover/corekit-bridge** from `3.3.0` to `3.3.1`
- Update dependency **@qlover/oauth-wrapper** from `0.6.3` to `0.6.4`

## 1.3.1

### Patch Changes

- Update dependency **@qlover/logger** from `1.2.0` to `1.2.1`
- Update dependency **@qlover/oauth-wrapper** from `0.6.2` to `0.6.3`
- Update dependency **@qlover/tailwind-theme** from `0.2.0` to `0.2.1`
- Update dependency **@qlover/corekit-bridge** from `3.3.0` to `3.3.1`

## 1.2.1

### Patch Changes

#### ✨ Features

- **next-oauth-wrapper:** add shared Tailwind styles and refactor imports ([41236fd](https://github.com/qlover/fe-base/commit/41236fddd553f68177d918e13d84763241a32cee)) ([#618](https://github.com/qlover/fe-base/pull/618))
  - Introduced a new `component.ts` file containing shared Tailwind class strings for the OAuth UI, enhancing consistency in styling across components.
  - Refactored various components to import the new shared styles from `@config/component`, replacing previous local imports for improved organization.
  - Removed the now redundant `headerStyles.ts` file, streamlining the codebase.
  - Updated type definitions in `AppRoutePage` to enhance clarity and maintainability.

#### 🐞 Bug Fixes

- **react-seed:** update OAuth URL and refactor user service usage ([6ebf0bf](https://github.com/qlover/fe-base/commit/6ebf0bfaf8baecfcd903dbac37dd772b3f8c05f8)) ([#618](https://github.com/qlover/fe-base/pull/618))
  - Changed the OAuth URL in `.env.template` from `http://localhost:3120` to `http://localhost:3200` for updated local server configuration.
  - Refactored the `Login.tsx` file to remove unnecessary type casting when using the `UserService`, improving code clarity and type safety.

## 1.2.0

### Minor Changes

#### ✨ Features

- **react-seed:** add useLocale hook for locale management ([9fcd9f8](https://github.com/qlover/fe-base/commit/9fcd9f8645d5454e516fe0fdd4e75fca00598f76)) ([#616](https://github.com/qlover/fe-base/pull/616))

  Introduced a new `useLocale` hook to manage locale settings within the application. This hook retrieves the current locale from route parameters or defaults to the configured locale, and provides a method to change the locale, updating the navigation accordingly. Additionally, updated `useOAuthLogin` to utilize the new `useLocale` hook for locale configuration during OAuth login processes.

  Also, added a `patchConfig` method in the `OAuthClient` class to allow dynamic updates to the client configuration, including locale settings.

- **react-seed:** add cancel button to logout dialog and update i18n identifiers ([27aa415](https://github.com/qlover/fe-base/commit/27aa415ab8d812704299bd53a536203022fe8eb0)) ([#616](https://github.com/qlover/fe-base/pull/616))

  Introduced a new `COMMON_CANCEL` identifier for localization and integrated it into the logout dialog in the `HomePage` component. The dialog now includes a cancel button that allows users to close the dialog without logging out, enhancing user experience and accessibility. Additionally, refactored import statements in `UserService.ts` for improved organization.

#### ♻️ Refactors

- **react-seed:** migrate OAuth client to @qlover/oauth-wrapper ([61c0ddc](https://github.com/qlover/fe-base/commit/61c0ddc7a39fbb4c5effadd08a1c1c0d84084b31)) ([#616](https://github.com/qlover/fe-base/pull/616))

  Replace local src/oauth helpers with SeedOAuthClient, persist refresh tokens for session restore, and add optional token revocation on logout.

## 1.1.2

### Patch Changes

#### ✨ Features

- **next-oauth-wrapper:** implement OAuth login flow and callback handling ([a539bb2](https://github.com/qlover/fe-base/commit/a539bb215187748c48d2e3cc9d159514945401d5)) ([#613](https://github.com/qlover/fe-base/pull/613))
  - Added a new `.env.template` file for OAuth configuration variables.
  - Introduced OAuth login functionality with `useOAuthLogin` hook for initiating login and handling errors.
  - Created `OAuthCallback` page to process OAuth responses and manage user sessions.
  - Updated internationalization mappings for OAuth-related texts in multiple languages.
  - Refactored login page to integrate OAuth login button and display loading/error states.

  These changes enhance the authentication process by integrating OAuth support, improving user experience during login.

#### 🐞 Bug Fixes

- **next-oauth-wrapper, next-seed:** update local server ports in configuration files ([9192149](https://github.com/qlover/fe-base/commit/91921496c5dc6c61256a0d67cab500eeec45f6ae)) ([#613](https://github.com/qlover/fe-base/pull/613))
  - Changed default local server ports from 3100 to 3120 in `next-sitemap.config.js`, `package.json`, and `robots.txt` for the next-oauth-wrapper example.
  - Updated local server ports from 3100 to 3110 in `next-sitemap.config.js` and `robots.txt` for the next-seed example.
  - Adjusted API documentation URLs in `route.ts` to reflect the new local server port for the next-seed example.

  These changes ensure consistency in local development environments across examples.

#### ♻️ Refactors

- **next-oauth-wrapper:** clean up and organize OAuth-related code ([c363be5](https://github.com/qlover/fe-base/commit/c363be56850fe6aa97d3e68ac02d9049727c3684)) ([#613](https://github.com/qlover/fe-base/pull/613))
  - Refactored import statements in various files for improved clarity and organization.
  - Updated ESLint configuration to include additional OAuth-related files.
  - Made minor formatting adjustments in several files for consistency.
  - Removed unnecessary trailing whitespace in localization files.

  These changes enhance the maintainability and readability of the OAuth wrapper codebase.

## 1.1.0

### Minor Changes

#### ✨ Features

- **react-seed:** integrate @qlover/ui-theme and enhance theme management ([8d8a4d8](https://github.com/qlover/fe-base/commit/8d8a4d83c0947b021f529ca6dc602ba0c0bb391c)) ([#609](https://github.com/qlover/fe-base/pull/609))
  - Added @qlover/ui-theme as a dependency in the react-seed example for improved theming capabilities.
  - Updated theme configuration to utilize data attributes for theme management, enhancing flexibility.
  - Introduced kvStorage for local storage management and integrated ThemeService for theme state handling.
  - Removed outdated theme CSS files and streamlined the import process for better organization.
  - Updated pnpm-lock.yaml to reflect the new dependency and versioning for @qlover/ui-theme.

  These changes aim to enhance the theming experience and maintain consistency across the application.

- **ui-theme:** update ESLint configuration and enhance theme integration ([0f47517](https://github.com/qlover/fe-base/commit/0f47517c5cbf9fec01bba632001c6b285350f3da)) ([#609](https://github.com/qlover/fe-base/pull/609))
  - Modified ESLint configuration to allow global variables in the newly added kvStorage implementation.
  - Updated IOCIdentifierRegister to streamline imports and improve code organization.
  - Removed the test script from package.json in ui-theme to simplify the build process.
  - Added English and Chinese README files for the @qlover/ui-theme package, providing comprehensive documentation on installation, features, and usage.

  These changes aim to improve code quality, enhance theme management, and provide better documentation for users.

#### ♻️ Refactors

- **theme:** rename ui-theme to tailwind-theme and update dependencies ([6eb08ac](https://github.com/qlover/fe-base/commit/6eb08ac6d7f808b900365407b24ec6fa7a033ce1)) ([#609](https://github.com/qlover/fe-base/pull/609))
  - Replaced all instances of '@qlover/ui-theme' with '@qlover/tailwind-theme' across various files to reflect the new package name.
  - Updated the pnpm-lock.yaml to link the new tailwind-theme package and adjust dependencies accordingly.
  - Modified configuration files and example projects to utilize the new tailwind-theme for improved theming support.
  - Enhanced documentation in README files to guide users on the new theme integration.

  These changes aim to streamline the theming experience and ensure consistency across the application.

## 1.0.0

### Major Changes

#### ✨ Features

- **react-seed:** enhance type safety and store management ([2d6317c](https://github.com/qlover/fe-base/commit/2d6317ca46c45a30c8298b390ef81ab46b89d277)) ([#604](https://github.com/qlover/fe-base/pull/604))
  - Added a new `type-check` script to the package.json for TypeScript type checking.
  - Updated `tsconfig.node.json` to include base URL and path mappings for improved module resolution.
  - Refactored `AppRouterProvider` and `BaseLayout` components to utilize the new `getUIStore` method for accessing the UI store.
  - Enhanced `RouteService` to implement `getUIStore`, providing a more consistent interface for store access.
  - Updated various tests to reflect changes in store management and ensure type safety.

  These changes aim to improve the overall type safety and maintainability of the React seed example.

- **docs:** add English README for browser-plugin-seed ([f93e3d4](https://github.com/qlover/fe-base/commit/f93e3d48fdee677bae56e01c00cd64a180b95ee4)) ([#604](https://github.com/qlover/fe-base/pull/604))
  - Introduced a new English README file for the browser-plugin-seed example, providing installation instructions, project layout, and core concepts.
  - Updated the existing Chinese README to include a link to the new English version.
  - Enhanced clarity on setup steps, including prerequisites, installation, running the development server, and building for production.

  These changes aim to improve accessibility and usability for English-speaking developers using the browser-plugin-seed template.

#### ♻️ Refactors

- **RouteService:** replace updateState with emit for route updates ([e8306d0](https://github.com/qlover/fe-base/commit/e8306d08ce6359c34487bb2e4d74258dc6196503)) ([#604](https://github.com/qlover/fe-base/pull/604))
  - Updated the RouteService class to replace the updateState method with emit for managing active routes in both useMainRoutes and useAuthRoutes methods.
  - This change enhances consistency in state management across the application, aligning with recent updates in the store handling.

  These modifications aim to improve clarity and maintainability in route management.

## 0.1.3

### Patch Changes

#### ✨ Features

- **tests:** enhance test configurations and logging ([15baa77](https://github.com/qlover/fe-base/commit/15baa77d26ae38a2306e4f212e8501c281fdcedd)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Updated `vite.config.ts` to set the environment to 'development', ensuring React's `act()` is exposed during testing.
  - Modified `index.ts` in the tests directory to enforce the development environment for better compatibility with testing tools.
  - Introduced a mock logger in the `reader.test.ts` to improve logging during tests, enhancing clarity and debugging capabilities.
  - Added console warning suppression in multiple test files to reduce noise in test outputs.

  These changes aim to improve the testing environment and enhance the clarity of test outputs.

#### 🐞 Bug Fixes

- **container:** adjust reflect-metadata import in InversifyContainer and IOCProvider ([828ee71](https://github.com/qlover/fe-base/commit/828ee71d14edcce8685c608b18584437ae25dddd)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Removed the import of 'reflect-metadata' from InversifyContainer.ts to streamline the container setup.
  - Added the 'reflect-metadata' import in IOCProvider.tsx to ensure proper functionality of dependency injection.

  These changes aim to improve the configuration of the Inversify container and ensure correct metadata reflection in the IOC provider.

#### ♻️ Refactors

- **dep:** update eslint configuration and package dependencies ([e9275ee](https://github.com/qlover/fe-base/commit/e9275ee01bbab01ef9d95a008f97e18eec4d6895)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Updated `eslint.config.js` to include the `examples` directory in the linting process, improving code quality checks across all examples.
  - Added a new script `nx:build:packages` in `package.json` to facilitate building packages while excluding the `examples` directory, streamlining the build process.
  - Updated `pnpm-lock.yaml` to reflect the latest versions of various dependencies, enhancing compatibility and performance across the project.

  These changes aim to improve the development workflow and maintain a cleaner project structure.

- **config:** update SeedConfigInterface and BootstrapClient implementation ([af8bc42](https://github.com/qlover/fe-base/commit/af8bc426c3cac801eba6f715fef1d991da1262c0)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Refactored the SeedConfigInterface to be imported from '@qlover/corekit-bridge/bootstrap', enhancing consistency across the project.
  - Removed obsolete SeedBootstrapInterface and updated BootstrapClient to implement the new BootstrapInterface, streamlining the bootstrapping process.
  - Adjusted various imports in related files to align with the new structure, improving code organization and maintainability.
  - Enhanced the logging configuration in the BootstrapClient to utilize a dynamic log level setting.

  These changes aim to improve the overall architecture and maintainability of the project by consolidating configuration interfaces and refining the bootstrapping logic.

- **react-seed:** change env property to a getter in ReactSeedConfig ([f10efb7](https://github.com/qlover/fe-base/commit/f10efb765017467e87e77ff56d60fc1871c3145d)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Updated the `env` property in `ReactSeedConfig` to a getter method, improving encapsulation and allowing for dynamic retrieval of the environment mode.
  - This change enhances the flexibility of the configuration by ensuring the environment value is always up-to-date with `import.meta.env.MODE`.

## 0.1.2

### Patch Changes

#### ✨ Features

- **tests:** enhance test configurations and logging ([15baa77](https://github.com/qlover/fe-base/commit/15baa77d26ae38a2306e4f212e8501c281fdcedd)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Updated `vite.config.ts` to set the environment to 'development', ensuring React's `act()` is exposed during testing.
  - Modified `index.ts` in the tests directory to enforce the development environment for better compatibility with testing tools.
  - Introduced a mock logger in the `reader.test.ts` to improve logging during tests, enhancing clarity and debugging capabilities.
  - Added console warning suppression in multiple test files to reduce noise in test outputs.

  These changes aim to improve the testing environment and enhance the clarity of test outputs.

#### 🐞 Bug Fixes

- **container:** adjust reflect-metadata import in InversifyContainer and IOCProvider ([828ee71](https://github.com/qlover/fe-base/commit/828ee71d14edcce8685c608b18584437ae25dddd)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Removed the import of 'reflect-metadata' from InversifyContainer.ts to streamline the container setup.
  - Added the 'reflect-metadata' import in IOCProvider.tsx to ensure proper functionality of dependency injection.

  These changes aim to improve the configuration of the Inversify container and ensure correct metadata reflection in the IOC provider.

#### ♻️ Refactors

- **dep:** update eslint configuration and package dependencies ([e9275ee](https://github.com/qlover/fe-base/commit/e9275ee01bbab01ef9d95a008f97e18eec4d6895)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Updated `eslint.config.js` to include the `examples` directory in the linting process, improving code quality checks across all examples.
  - Added a new script `nx:build:packages` in `package.json` to facilitate building packages while excluding the `examples` directory, streamlining the build process.
  - Updated `pnpm-lock.yaml` to reflect the latest versions of various dependencies, enhancing compatibility and performance across the project.

  These changes aim to improve the development workflow and maintain a cleaner project structure.

- **config:** update SeedConfigInterface and BootstrapClient implementation ([af8bc42](https://github.com/qlover/fe-base/commit/af8bc426c3cac801eba6f715fef1d991da1262c0)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Refactored the SeedConfigInterface to be imported from '@qlover/corekit-bridge/bootstrap', enhancing consistency across the project.
  - Removed obsolete SeedBootstrapInterface and updated BootstrapClient to implement the new BootstrapInterface, streamlining the bootstrapping process.
  - Adjusted various imports in related files to align with the new structure, improving code organization and maintainability.
  - Enhanced the logging configuration in the BootstrapClient to utilize a dynamic log level setting.

  These changes aim to improve the overall architecture and maintainability of the project by consolidating configuration interfaces and refining the bootstrapping logic.

- **react-seed:** change env property to a getter in ReactSeedConfig ([f10efb7](https://github.com/qlover/fe-base/commit/f10efb765017467e87e77ff56d60fc1871c3145d)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Updated the `env` property in `ReactSeedConfig` to a getter method, improving encapsulation and allowing for dynamic retrieval of the environment mode.
  - This change enhances the flexibility of the configuration by ensuring the environment value is always up-to-date with `import.meta.env.MODE`.

## 0.1.0

### Minor Changes

#### ✨ Features

- **react-seed:** Initialize React + TypeScript + Vite template ([6ae1e51](https://github.com/qlover/fe-base/commit/6ae1e512af454287b641c3bec7a40dde74dbb430)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Added a new project template integrating React, TypeScript, and Vite for streamlined development.
  - Included essential configuration files: `.gitignore`, `package.json`, `vite.config.ts`, and ESLint configuration.
  - Created initial application structure with `index.html`, main entry point `main.tsx`, and a sample `App.tsx` component.
  - Integrated Tailwind CSS for styling and established global styles.
  - Set up TypeScript configurations for both application and node environments.
  - Added SVG assets for logos and included a README for project guidance.

  This commit establishes a foundational setup for building React applications with TypeScript and Vite, enhancing developer experience and productivity.

- **react-seed:** Enhance project configuration and structure ([6efd67a](https://github.com/qlover/fe-base/commit/6efd67abcc0593726f9a4c73c0ddf4868512386e)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Updated `pnpm-lock.yaml` to reflect new dependency versions for improved stability and compatibility.
  - Modified `pnpm-workspace.yaml` to include the `examples` directory for better workspace management.
  - Enhanced ESLint configuration in `examples/react-seed` to integrate `@qlover/eslint-plugin` and enforce specific rules for TypeScript files.
  - Updated `package.json` in `examples/react-seed` to include new scripts for different development modes and added necessary dependencies.
  - Refined TypeScript configurations to improve build performance and added path mappings for better module resolution.
  - Introduced new files for global configuration and bootstrapping logic, enhancing the application's structure and maintainability.

  These changes aim to streamline development processes and improve the overall architecture of the React seed project.

- **react-seed:** Update dependencies and enhance ESLint configuration ([954c4db](https://github.com/qlover/fe-base/commit/954c4db59081a2af035fc93c7f4e2f1895413d33)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Updated `pnpm-lock.yaml` to include new dependencies such as `@typescript-eslint/parser`, `eslint-plugin-import`, and `inversify`, ensuring compatibility and improved functionality.
  - Enhanced ESLint configuration in `examples/react-seed/eslint.config.js` to enforce import order and consistent type imports, improving code quality and maintainability.
  - Modified `package.json` to include new build scripts and dependencies, streamlining the build process and enhancing development workflows.
  - Refined TypeScript configurations in `tsconfig.app.json` and `tsconfig.node.json` for better module resolution.
  - Introduced new IOC container implementations in `src/impls` to support dependency injection, enhancing the application's architecture.

  These changes aim to improve the overall development experience and maintainability of the React seed project.

- **react-seed:** Enhance project structure and add new features ([24dd8ec](https://github.com/qlover/fe-base/commit/24dd8ec229e67931881c5a4a1ec748e4d4cb2d9f)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Updated `pnpm-lock.yaml` to include `react-router-dom` and `react-router` dependencies, ensuring proper routing capabilities in the application.
  - Enhanced ESLint configuration in `examples/react-seed/eslint.config.js` to include `console` in the global variables, improving code quality checks.
  - Modified `package.json` to add a Prettier script for consistent code formatting across various file types.
  - Refined TypeScript configurations in `tsconfig.app.json` and `tsconfig.node.json` to enable experimental decorators and emit metadata, enhancing type safety and functionality.
  - Introduced new service implementations in `src/impls` for improved dependency injection and routing management, enhancing the application's architecture.

  These changes aim to improve the overall development experience and maintainability of the React seed project.

- **react-seed:** Enhance testing setup and configuration ([0039bee](https://github.com/qlover/fe-base/commit/0039bee453054c9cbefa2d70d70a39caa0787ec1)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Updated ESLint configuration in `examples/react-seed/eslint.config.js` to include separate rules for test files, improving code quality checks for testing.
  - Added a new `tsconfig.test.json` for better TypeScript support in tests, ensuring proper type checking and configuration.
  - Introduced new test files in `__tests__` directory, including `globals.test.ts` and `index.ts`, to enhance testing coverage and structure.
  - Updated `package.json` to include a test script for running tests with Vitest, streamlining the testing process.
  - Enhanced `vite.config.ts` to configure the testing environment with JSDOM, improving compatibility for testing React components.

  These changes aim to improve the testing framework and overall development experience in the React seed project.

- **react-seed:** Add unit tests for main.tsx and implement useIOC hook ([1d670da](https://github.com/qlover/fe-base/commit/1d670da44a1d10dd8b4374b42c0201dcda613fb6)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Introduced a new test file `main.test.tsx` to cover the initialization and rendering logic of the main application component, ensuring proper instantiation of the BootstrapClient and verification of IOC references.
  - Added a new hook `useIOC` in `src/hooks/useIOC.ts` to facilitate dependency injection, allowing for flexible retrieval of IOC instances based on identifiers.
  - Enhanced testing coverage by verifying the correct behavior of the BootstrapClient and its interaction with global IOC configurations.

  These changes aim to improve the reliability and maintainability of the React seed project through comprehensive testing and better dependency management.

- **react-seed:** Enhance testing and mock implementations ([41b4cc1](https://github.com/qlover/fe-base/commit/41b4cc175936869a8e2d9abcd1afba260c18729e)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Updated the mock implementation for globals in `index.ts` to include original values and additional properties, improving test accuracy.
  - Removed unnecessary `afterEach` reset in `main.test.tsx` to streamline test execution.
  - Added comprehensive tests for the `useIOC` hook in `useIOC.test.ts`, covering various scenarios for dependency injection and service retrieval.
  - Introduced new test files for `BootstrapClient` and `ReactSeedConfig`, ensuring robust coverage of core functionalities.
  - Enhanced the `BootstrapClient` startup method to return `BootstrapPluginOptions`, improving type safety and integration with plugins.

  These changes aim to strengthen the testing framework and ensure better reliability of the React seed project.

- **react-seed:** Implement RouterLoader and enhance routing capabilities ([d2271e0](https://github.com/qlover/fe-base/commit/d2271e07adf23b5c89d940ed24d59872e4658b07)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Introduced the `RouterLoader` class to manage dynamic routing and component loading, supporting both lazy and direct component rendering.
  - Added new route configuration interfaces to improve type safety and structure for route definitions.
  - Created test files for `RouterLoader` to ensure robust functionality and accurate component mapping.
  - Updated ESLint and TypeScript configurations to accommodate new routing features and improve code quality checks.

  These changes aim to enhance the routing architecture and improve the overall maintainability of the React seed project.

- **react-seed:** Update ESLint configuration and add unused imports plugin ([fba0e26](https://github.com/qlover/fe-base/commit/fba0e2671b4c0237552f10ce88f48344f8f616ed)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Enhanced ESLint configuration in `examples/react-seed/eslint.config.js` to include the `eslint-plugin-unused-imports`, improving code quality by checking for unused imports and variables.
  - Updated `package.json` to include the new `eslint-plugin-unused-imports` dependency.
  - Refined TypeScript configurations in `tsconfig.app.json` and `tsconfig.node.json` for better module resolution and compatibility.
  - Adjusted `tsconfig.test.json` to improve test file handling and include necessary paths.

  These changes aim to enhance code quality checks and streamline the development process in the React seed project.

- **react-seed:** Add routing and loading components, update dependencies ([ef8f56c](https://github.com/qlover/fe-base/commit/ef8f56c40bf8d7bc247aba06a3f03affa214542b)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Introduced a new `AppRouterProvider` component to manage routing using `react-router-dom`, enhancing navigation capabilities.
  - Added a `Loading` component for displaying loading states, improving user experience during asynchronous operations.
  - Created base layout and home page components to structure the application.
  - Updated `package.json` to include `clsx` for conditional class names, and added new routes in `app.router.ts`.
  - Removed unused `App.css` file to streamline styles and improve maintainability.

  These changes aim to enhance the routing architecture and improve the overall user experience in the React seed project.

- **react-seed:** Add i18n support and new interface for localization ([f4ea1d4](https://github.com/qlover/fe-base/commit/f4ea1d42c6b7285b646347cbddc2e944d73684ea)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Updated `package.json` to include `i18next`, `i18next-browser-languagedetector`, `i18next-http-backend`, and `react-i18next` for internationalization capabilities.
  - Introduced a new `I18nInterface` in `src/interfaces/I18nInterface.ts` to define methods for localization management, enhancing type safety and structure for i18n implementations.

  These changes aim to improve localization support in the React seed project, facilitating multi-language functionality.

- **react-seed:** Integrate i18n functionality and enhance localization support ([e9afb09](https://github.com/qlover/fe-base/commit/e9afb09932052be73f07829339363a85d9898662)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Added a new `I18nService` class to manage internationalization using `i18next`, including language detection and backend support.
  - Updated ESLint configuration to include rules for TypeScript files, ensuring better code quality.
  - Introduced a custom `useTranslation` hook to override the default translation function, allowing for enhanced translation capabilities.
  - Created a new `i18n.ts` configuration file to define localization settings and supported languages.
  - Updated various components and pages to utilize the new i18n features, improving user experience with localized content.

  These changes aim to provide robust localization support in the React seed project, facilitating multi-language functionality and improving overall user experience.

- **react-seed:** Update dependencies and enhance routing and localization features ([0829933](https://github.com/qlover/fe-base/commit/0829933ef64bd4129ad4701deb9d03fa7593b9fa)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Added new dependencies for `@brain-toolkit/react-kit` and `@qlover/slice-store-react` to improve component functionality.
  - Updated `@brain-toolkit/ts2locales` version for better localization support.
  - Enhanced routing configuration by introducing a `RedirectWithLocalePath` component for automatic language redirection.
  - Improved route management with dynamic loading and filtering based on categories.
  - Refactored various components to utilize the new routing and localization features, enhancing user experience.

  These changes aim to strengthen the application's routing architecture and localization capabilities, providing a more seamless experience for users.

- **react-seed:** Add home page localization and new LocaleLink component ([c51d6ba](https://github.com/qlover/fe-base/commit/c51d6ba907d73343716e351bec9988af0f7b74d7)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Introduced new localization constants for the home page, including titles and descriptions in both English and Chinese.
  - Created a `LocaleLink` component to facilitate locale-aware navigation, enhancing user experience with localized links.
  - Updated the `HomePage` component to utilize the new localization constants and `LocaleLink`, improving content accessibility for different languages.
  - Enhanced the `BaseLayout` to synchronize the route locale with the i18n service, ensuring consistent language handling across the application.

  These changes aim to strengthen the localization features of the React seed project, providing a more inclusive experience for users across different languages.

- **react-seed:** Enhance localization and routing configuration ([1045272](https://github.com/qlover/fe-base/commit/1045272c340411cbe39fc50d2823dd06a48315a5)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Updated ESLint configuration to exclude components starting with uppercase letters from the `@qlover-eslint/require-root-testid` rule.
  - Introduced `routePathLocaleParamKey` for dynamic route parameter handling in `app.router.ts` and updated related components to utilize this key for improved localization.
  - Enhanced `i18n.ts` with detailed comments on language detection order and added type definitions for query string keys.
  - Refactored `BaseLayout` and `RouterRenderComponent` to streamline loading states and improve code readability.
  - Updated `I18nService` to use the new `pathLocaleQSKeys` for query string language detection, ensuring consistent language handling across the application.

  These changes aim to strengthen the localization features and routing capabilities of the React seed project, providing a more seamless user experience.

- **react-seed:** Integrate user authentication and API handling ([85bdaa9](https://github.com/qlover/fe-base/commit/85bdaa931635b081be4ecd714ac4f22930e2178a)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Added `UserGateway` and `AppApiRequester` classes to manage user-related API interactions, including login, registration, and user info retrieval.
  - Introduced Zod schemas for user data validation, enhancing type safety and ensuring data integrity.
  - Updated `BootstrapClient` to utilize a dynamic route plugin for user authentication, improving route management based on user state.
  - Refactored `UserService` to extend functionality from the bridge, integrating user gateway for seamless user management.
  - Enhanced error handling in the `BootstrapClient` startup process to improve robustness during initialization.

  These changes aim to strengthen user authentication and API handling capabilities in the React seed project, providing a more secure and user-friendly experience.

- **react-seed:** Enhance routing and localization components ([a24a2a7](https://github.com/qlover/fe-base/commit/a24a2a7d12691e1d8fdeadf8a943c45ad413baa6)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Refactored routing configuration in `app.router.ts` to improve locale handling with `pathLocalRoutePrefix`.
  - Updated `App` component to log page information for better debugging.
  - Introduced a new `Page` component to manage locale synchronization and rendering logic.
  - Modified `RouterRenderComponent` to wrap content in the new `Page` component, enhancing structure and readability.
  - Updated `BaseLayout` and `RedirectWithLocalePath` components to streamline locale handling and remove unnecessary code.

  These changes aim to strengthen the routing and localization features of the React seed project, providing a more organized and user-friendly experience.

- **react-seed:** Integrate mock server and enhance API handling ([df40b3a](https://github.com/qlover/fe-base/commit/df40b3ab8b543182a063be3a13a7e111b9ce2453)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Added `vite-plugin-mock` to facilitate mock API responses during development, improving testing capabilities.
  - Updated `vite.config.ts` to configure the mock server with a specified mock file directory.
  - Introduced new endpoint management utilities in `endpoints/_endpoint.ts` for better API structure.
  - Created mock responses for user-related endpoints in `mock/user.ts`, enhancing the development experience.
  - Refactored `UserGateway` to utilize endpoint objects for cleaner API request handling.
  - Enhanced `IOCIdentifier` to include a new `Config` identifier for improved dependency management.

  These changes aim to strengthen the API handling and testing capabilities of the React seed project, providing a more robust development environment.

- **react-seed:** Implement authentication routes and enhance user mock responses ([086d3ca](https://github.com/qlover/fe-base/commit/086d3ca4b6b1e2895979a6890733865bbad2919d)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Added `authRoutes` to `app.router.ts` for user authentication, including a new `Login` page component.
  - Updated routing configuration to integrate authentication routes with locale handling.
  - Enhanced mock user responses in `mock/user.ts` to utilize `prefixEndpointWithMock`, improving testing capabilities.
  - Refactored error handling in `userRoutePlugin.ts` to include debug logging for better error tracking.

  These changes aim to strengthen user authentication features and improve the development experience with enhanced mock API responses.

- **react-seed:** Add comprehensive tests for routing components and services ([870434a](https://github.com/qlover/fe-base/commit/870434a4b588354705e54dd417fd82314a3c7090)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Introduced new test files for `AppRouterProvider`, `RouterRenderComponent`, `RouterLoader`, and `RouteService` to ensure robust routing functionality.
  - Implemented various test cases to validate rendering, route handling, and component integration within the routing system.
  - Enhanced mock implementations for better isolation and testing of routing logic.
  - Added tests for user route plugin functionality to verify user authentication flow and logging behavior.

  These changes aim to strengthen the testing framework for routing components, ensuring reliability and maintainability in the React seed project.

- **react-seed:** Enhance i18n configuration and introduce new home page localization ([1b7a624](https://github.com/qlover/fe-base/commit/1b7a6240b81814838663b151c8728bd67a0a5673)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Updated i18n configuration to support dynamic loading paths and improved locale handling.
  - Refactored the `Page` component to include loading states during locale changes.
  - Introduced new i18n identifiers for the home page, consolidating localization keys into a dedicated mapping structure.
  - Created utility functions for locale redirection and streamlined translation handling with a new `useI18nMapping` hook.
  - Removed deprecated localization constants from the common identifiers to improve clarity and maintainability.

  These changes aim to strengthen the localization framework and enhance the user experience on the home page by providing a more organized and efficient approach to internationalization.

- **react-seed:** Implement login page and enhance i18n support ([672ebbc](https://github.com/qlover/fe-base/commit/672ebbc27d07d3988df74647b4b6b27219284961)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Added a new `Login` page component with localization support, including various i18n identifiers for titles, descriptions, and form elements.
  - Updated routing configuration to include the new `Login` page and adjusted existing routes for better clarity.
  - Enhanced i18n mapping for the home page to include a link to the login page.
  - Created a dedicated layout for authentication pages to improve structure and usability.
  - Refactored existing components to utilize the new i18n keys, ensuring a consistent user experience across the application.

  These changes aim to strengthen the authentication flow and improve the overall localization framework in the React seed project.

- **react-seed:** Add registration and redirect functionality to authentication flow ([a2eb232](https://github.com/qlover/fe-base/commit/a2eb23262d46f94991703bb0ccfa066b544a33f7)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Introduced a new `Register` page component with localization support, including various i18n identifiers for titles, descriptions, and form elements.
  - Updated routing configuration to include a redirect from the auth layout index to the login page and added the new registration route.
  - Enhanced mock user responses to support registration functionality.
  - Improved error handling and form validation in the `Login` and `Register` components for a better user experience.

  These changes aim to strengthen the authentication flow by providing a complete registration process and improving user feedback during login and registration.

- **react-seed:** Enhance authentication flow with login and register redirects ([3857431](https://github.com/qlover/fe-base/commit/3857431b8991742764857907d7ec94ad84ebddf5)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Added `RedirectToHome` component to redirect users from login and register paths to the home page if they are already logged in.
  - Updated routing configuration to include new routes for login and register, ensuring proper navigation within the application.
  - Improved i18n identifiers for login and register pages, enhancing localization support.
  - Refactored `UserService` to utilize a user credential key stored in cookies for better user session management.

  These changes aim to streamline the authentication process and improve user experience by providing clear navigation paths and enhanced localization.

#### 🐞 Bug Fixes

- **react-seed:** Update package name and enhance BootstrapClient tests ([2e3e270](https://github.com/qlover/fe-base/commit/2e3e27062c4af10c763dd2d61e87c9a2b1994db4)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Changed the package name in `package.json` from `react-seed` to `examples/react-seed` for better clarity.
  - Updated `BootstrapClient.test.ts` to include additional plugin checks and improved assertions for plugin initialization.
  - Refactored test cases to enhance readability and maintainability, including commented-out tests for future implementation.
  - Adjusted `RouterLoader` tests to ensure correct handling of route metadata.

  These changes aim to improve the structure and clarity of the project while enhancing the testing framework for better reliability.

#### ♻️ Refactors

- **react-seed:** Consolidate configuration imports and enhance type definitions ([7ad8754](https://github.com/qlover/fe-base/commit/7ad8754f334620a68ded3a08eb90300985e36afb)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Updated import paths in various files to reference the new `seed.config` and `ioc-identifier` modules for better organization and clarity.
  - Introduced new `ioc-identifier.ts` and `router.ts` files to centralize IOC identifiers and routing configurations, respectively.
  - Refactored components and tests to align with the updated import structure, improving maintainability and readability.
  - Enhanced type definitions for better type safety across the application.

  These changes aim to streamline the configuration management and improve the overall structure of the React seed project.

- **vite:** Consolidate test configuration and enhance user service error handling ([c7fd224](https://github.com/qlover/fe-base/commit/c7fd2248398e627e05b802404bb6c1b8d63f2c99)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Replaced the `vitest.root.config.ts` with a more structured configuration directly in `vite.config.ts`, improving clarity and organization.
  - Updated the `UserService` class to throw specific `ExecutorError` instances for invalid credentials and users, enhancing error handling.
  - Adjusted return types in the `UserServiceInterface` to ensure consistency and clarity in method signatures.
  - Added workspace dependencies in the `react-seed` example to streamline local development.

  These changes aim to improve the testing framework and error management within the user service, enhancing overall maintainability and developer experience.
