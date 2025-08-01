# @qlover/create-app

## 0.7.0

### Minor Changes

#### ✨ Features

- **router:** implement locale routing and enhance route configuration ([c6ceec2](https://github.com/qlover/fe-base/commit/c6ceec28f83a6c3638872bb4bbb4d6534b02fca8)) ([#476](https://github.com/qlover/fe-base/pull/476))
  - Added support for locale-based routing in the application, allowing routes to include language prefixes.
  - Introduced `baseNoLocaleRoutes` to manage routes without localization, improving flexibility in route handling.
  - Updated `I18nService` to conditionally cache user language based on locale routing settings.
  - Enhanced `RouteService` to handle locale routes and added methods for redirection and language validation.
  - Modified `RegisterCommon` to utilize the appropriate route configuration based on locale settings.
  - Updated various components and hooks to integrate with the new routing logic, ensuring seamless navigation and language handling.

  These changes aim to improve the user experience by providing localized routes and better language management.

  Co-authored-by: QRJ <renjie.qin@brain.im>

## 0.6.3

### Patch Changes

#### ✨ Features

- **react-app:** add comprehensive documentation for Bootstrap, environment variable injection, global variable injection, and IOC container ([6c9b8e2](https://github.com/qlover/fe-base/commit/6c9b8e220b4b246f4593f25bc6830381157c0744)) ([#473](https://github.com/qlover/fe-base/pull/473))
  - Introduced detailed documentation for the Bootstrap system, explaining its purpose, implementation, and advantages in managing application initialization logic.
  - Added sections on environment variable injection, outlining the process and configuration for managing different environments.
  - Documented the global variable injection mechanism, detailing how core services can be accessed globally within the application.
  - Included a thorough explanation of the IOC container, its implementation, and best practices for dependency management.

  These additions aim to enhance developer understanding and usability of the framework, promoting best practices in application architecture.

- **react-app:** enhance project documentation and update scripts ([2a07fc8](https://github.com/qlover/fe-base/commit/2a07fc82647b4965121df9c6d70cd5d1841ad2d4)) ([#473](https://github.com/qlover/fe-base/pull/473))
  - Added a comprehensive English README file to provide an overview of the React app template, including features, requirements, and project structure.
  - Introduced a new documentation structure with detailed guides on Bootstrap, environment variable injection, global variable injection, and the IOC container.
  - Updated the existing Chinese README to include links to the new English documentation and expanded sections on development guidelines and core functionalities.
  - Modified the package.json to include additional directories in the Prettier configuration for improved formatting.
  - Enhanced CSS files for better readability and maintainability by formatting CSS variables.

  These changes aim to improve developer experience and provide clearer guidance on using the React app template effectively.

#### ♻️ Refactors

- **react-app:** enhance build process and update TypeScript configurations ([c2065b9](https://github.com/qlover/fe-base/commit/c2065b9ac847fb53776b871fc5bf62ac948801b6)) ([#473](https://github.com/qlover/fe-base/pull/473))
  - Updated the build script in package.json to run linting before building the project.
  - Modified tsconfig files to exclude node_modules and dist directories, improving TypeScript compilation efficiency.
  - Introduced a new IOCIdentifier.ts file to centralize dependency identifiers.
  - Refactored imports across various files to utilize the new IOCIdentifier.
  - Removed obsolete ApiTransactionInterface and RequestCatcherInterface files to streamline the codebase.
  - Implemented a new InversifyContainer class for better dependency injection management.

  These changes aim to improve the overall structure, maintainability, and build process of the react-app template.

## 0.6.2

### Patch Changes

#### ✨ Features

- **react-app:** add comprehensive documentation for Bootstrap, environment variable injection, global variable injection, and IOC container ([6c9b8e2](https://github.com/qlover/fe-base/commit/6c9b8e220b4b246f4593f25bc6830381157c0744)) ([#472](https://github.com/qlover/fe-base/pull/472))
  - Introduced detailed documentation for the Bootstrap system, explaining its purpose, implementation, and advantages in managing application initialization logic.
  - Added sections on environment variable injection, outlining the process and configuration for managing different environments.
  - Documented the global variable injection mechanism, detailing how core services can be accessed globally within the application.
  - Included a thorough explanation of the IOC container, its implementation, and best practices for dependency management.

  These additions aim to enhance developer understanding and usability of the framework, promoting best practices in application architecture.

#### ♻️ Refactors

- **react-app:** enhance build process and update TypeScript configurations ([c2065b9](https://github.com/qlover/fe-base/commit/c2065b9ac847fb53776b871fc5bf62ac948801b6)) ([#472](https://github.com/qlover/fe-base/pull/472))
  - Updated the build script in package.json to run linting before building the project.
  - Modified tsconfig files to exclude node_modules and dist directories, improving TypeScript compilation efficiency.
  - Introduced a new IOCIdentifier.ts file to centralize dependency identifiers.
  - Refactored imports across various files to utilize the new IOCIdentifier.
  - Removed obsolete ApiTransactionInterface and RequestCatcherInterface files to streamline the codebase.
  - Implemented a new InversifyContainer class for better dependency injection management.

  These changes aim to improve the overall structure, maintainability, and build process of the react-app template.

## 0.6.1

### Patch Changes

#### 🐞 Bug Fixes

- **vite.config:** update import path for vite-env-config to remove index file reference ([251ae17](https://github.com/qlover/fe-base/commit/251ae178c26238070fa6663826425d188e30745f)) ([#464](https://github.com/qlover/fe-base/pull/464))
  - Modified the import statement for envConfig in vite.config.ts to streamline the path by removing the explicit '/index' reference, improving clarity and consistency in module imports.

  This change enhances the maintainability of the configuration file within the react-app template.

## 0.6.0

### Minor Changes

#### 🐞 Bug Fixes

- **react-app:** update package dependencies and refactor UserApi and UserService ([35e58e4](https://github.com/qlover/fe-base/commit/35e58e4e618082b5dee16351d7d78bbd54ca9e83)) ([#460](https://github.com/qlover/fe-base/pull/460))
  - Changed dependencies in package.json to use the latest versions of @qlover/corekit-bridge and @qlover/fe-corekit for improved stability.
  - Refactored UserApi to utilize UserAuthState for better state management and type safety.
  - Updated UserService to align with the new UserApi structure, enhancing type definitions and simplifying state handling.
  - Removed outdated comments and streamlined the code for better readability and maintainability.

  These changes aim to enhance the overall functionality and reliability of the user authentication system within the react-app template.

## 0.5.0

### Minor Changes

#### ✨ Features

- **react-app:** enhance user authentication and error handling ([ee00e24](https://github.com/qlover/fe-base/commit/ee00e24ce1c713aff91100ff30f9c84d8b523c80)) ([#458](https://github.com/qlover/fe-base/pull/458))
  - Updated package.json to reference local corekit dependencies for improved development.
  - Added new error identifiers in common.error.ts for better error management.
  - Refactored UserApi to implement registration and improved login handling with token validation.
  - Introduced common error handling in UserService and updated related components to utilize new error identifiers.
  - Enhanced storage management by integrating new storage interfaces and updating related services.

  These changes aim to streamline user authentication processes and improve error reporting across the application.

## 0.4.6

### Patch Changes

#### ✨ Features

- **router:** add descriptions to route metadata and update identifiers ([9fe2025](https://github.com/qlover/fe-base/commit/9fe20251d9b38f42d9fc1417587636181844ac96)) ([#455](https://github.com/qlover/fe-base/pull/455))
  - Enhanced the routing configuration by adding descriptions to various route metadata, improving clarity and accessibility for developers.
  - Updated internationalization identifiers for pages, including home, login, register, and error pages, to include corresponding descriptions in both English and Chinese.
  - Refactored the import paths for error identifiers to streamline the codebase and improve maintainability.

  These changes aim to enhance the user experience by providing more context in the routing structure and improving the overall organization of internationalization resources.

- **pages:** add new pages and update routing configuration ([6ba6e19](https://github.com/qlover/fe-base/commit/6ba6e19ec32f243d51e8b819dfc07965ceac07a0)) ([#455](https://github.com/qlover/fe-base/pull/455))
  - Introduced new pages including RegisterPage, AboutPage, ErrorIdentifierPage, ExecutorPage, HomePage, JSONStoragePage, and RequestPage to enhance the application structure and user navigation.
  - Updated routing configuration to reflect changes in page paths, ensuring consistency and clarity in navigation.
  - Refactored existing routes to align with new page structures, improving maintainability and readability of the routing setup.

  These changes aim to enrich the user experience by providing additional functionality and a more organized navigation system.

- **i18n:** introduce I18nKeyErrorPlugin and refactor user services ([0575403](https://github.com/qlover/fe-base/commit/0575403692758dac10624eb9425fad0138536513)) ([#455](https://github.com/qlover/fe-base/pull/455))
  - Added I18nKeyErrorPlugin to handle error messages as internationalization keys, improving error reporting and localization.
  - Refactored ProcesserService to extend StoreInterface, enhancing state management and type safety.
  - Moved RegisterFormData interface to UserService for better organization and removed the obsolete LoginInterface.
  - Updated RegisterPage and ProcessProvider to utilize new service methods and improve application flow.

  These changes aim to enhance internationalization support and streamline service interactions within the application.

- **router:** refactor routing configuration and introduce ProcesserExecutor ([6a5a7a5](https://github.com/qlover/fe-base/commit/6a5a7a5a3ccbbd3c68da558f95c06c12e8a3c2f0)) ([#455](https://github.com/qlover/fe-base/pull/455))
  - Simplified the routing configuration by removing unnecessary metadata from base routes, enhancing clarity.
  - Introduced the ProcesserExecutor class to manage asynchronous execution processes, improving the handling of page processing.
  - Updated RouteService to extend StoreInterface, enhancing state management and type safety.
  - Refactored user services to utilize the new ProcessExecutorProvider, streamlining the authentication flow and loading states.
  - Removed the obsolete ProcessProvider, consolidating the process management into the new structure.

  These changes aim to improve the routing architecture and enhance the overall application flow.

- **create-app:** update dependencies and introduce project configuration ([8431f66](https://github.com/qlover/fe-base/commit/8431f6682a40660d7996ca918bc318ecf0d09aa4)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Added `commander` and updated `ignore` in `devDependencies` for enhanced functionality.
  - Removed `ora` from `devDependencies` and `dependencies` for better clarity.
  - Introduced a new `project.json` file to define build targets and streamline the build process using NX.
  - Updated `tsup.config.ts` to enable minification, improving the build output.

  These changes enhance the configuration and build orchestration for the create-app package.

- **create-app:** enhance asset management and update build configuration ([8578e7f](https://github.com/qlover/fe-base/commit/8578e7f5b1fa82fd08f5a472b0a401ef3972f63f)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Added support for ignoring specific patterns during asset copying in the `copyAssets` utility.
  - Updated `tsup.config.ts` to copy configuration and template files to the `dist` directory after the build process.
  - Removed obsolete references to `configs` and `templates` in `package.json` for clarity.
  - Adjusted the CLI to resolve paths for templates and configs using `resolve` for better compatibility.

  These changes improve the asset management capabilities and streamline the build process for the create-app package.

#### ♻️ Refactors

- restructure internationalization and routing configuration ([006affa](https://github.com/qlover/fe-base/commit/006affa0e78b4ae9dd42dd4c79d29301212ffb9a)) ([#455](https://github.com/qlover/fe-base/pull/455))
  - Updated the internationalization identifiers by consolidating them into a single index file for easier management and access.
  - Renamed and reorganized error and common identifiers for clarity and consistency.
  - Replaced the JSON router configuration with a TypeScript-based router for improved type safety and maintainability.
  - Removed outdated theme configuration files and migrated to a TypeScript-based theme configuration.
  - Enhanced the README documentation to reflect the changes in the project structure and configuration.

  These changes aim to streamline the internationalization process and improve the overall architecture of the routing and theming systems.

- **theme:** update ThemeService to extend StoreInterface and enhance type definitions ([7e647f6](https://github.com/qlover/fe-base/commit/7e647f6e5979aa6e37e239fcd9039fb3bd52ee2b)) ([#455](https://github.com/qlover/fe-base/pull/455))
  - Refactored ThemeService to extend StoreInterface instead of SliceStore, improving consistency across the codebase.
  - Updated ThemeServiceState to implement StoreStateInterface, enhancing type safety and maintainability.
  - Removed the obsolete StoreInterface file to streamline the project structure.
  - Adjusted import paths in various components and services to reflect the new StoreInterface location, ensuring proper integration.

  These changes aim to improve the overall architecture and type management within the theme service implementation.

- **user-service:** simplify state management and introduce language guard ([e7a433f](https://github.com/qlover/fe-base/commit/e7a433f1887c22c1fca77182e73aeba49b7afc8c)) ([#455](https://github.com/qlover/fe-base/pull/455))
  - Removed the setState method from UserService, directly emitting state changes instead.
  - Added useI18nGuard hook to handle language validation and redirection to a 404 page if the language is invalid.
  - Introduced useRouterService hook to manage routing dependencies.
  - Deleted the obsolete I18nGuideProvider, consolidating language guard functionality.

  These changes aim to streamline user service state management and enhance internationalization handling within the application.

## 0.4.5

### Patch Changes

#### ✨ Features

- **create-app:** implement logout functionality and enhance localization ([c49f956](https://github.com/qlover/fe-base/commit/c49f956aecbc11a6b96b28309d112f7219a7dcca)) ([#438](https://github.com/qlover/fe-base/pull/438))
  - Added a new LogoutButton component to handle user logout with a confirmation dialog.
  - Introduced localization keys for logout dialog titles and content in both English and Chinese.
  - Updated BaseHeader to conditionally display the logout button based on the layout context.
  - Refactored AppConfig to utilize the Vite environment mode directly.
  - Adjusted LoginInterface to accept a more generic parameter type for login.

  This update improves user experience by providing a clear logout process and enhances localization support for logout-related messages.

## 0.4.4

### Patch Changes

#### ✨ Features

- **create-app:** add error identifiers and localization support for new components ([0ec3780](https://github.com/qlover/fe-base/commit/0ec3780a7972acd855e1b4d2ae866575534dc094)) ([#434](https://github.com/qlover/fe-base/pull/434))
  - Introduced new error identifiers in Error.ts for handling various application states, including IOC not implemented and token absence.
  - Added extensive localization keys in I18n.ts for various pages and components, enhancing user experience across different languages.
  - Improved error handling and messaging consistency throughout the application.

  This update enhances the application's localization capabilities and error management, providing clearer feedback to users.

- **create-app:** enhance TypeScript configuration and linting ([f049395](https://github.com/qlover/fe-base/commit/f049395c90ee2c13a33d7358098a87251ef40913)) ([#434](https://github.com/qlover/fe-base/pull/434))
  - Updated the TypeScript configuration by introducing a new `tsconfig.app.json` for better modularity and organization.
  - Modified `tsconfig.json` to reference the new app configuration and streamline project structure.
  - Enhanced `tsconfig.node.json` with improved compiler options for better compatibility and performance.
  - Updated linting script in `package.json` to include TypeScript checks alongside ESLint, ensuring code quality and type safety.
  - Refactored imports in `RequestLogger.ts` and `ThemeSwitcher.tsx` to use type imports for better clarity and performance.

  This update improves the TypeScript setup and linting process, enhancing code quality and maintainability across the application.

#### ♻️ Refactors

- **create-app:** remove unused error identifiers and localization keys ([3b19f19](https://github.com/qlover/fe-base/commit/3b19f193b839c1e97fa727c1847a4bbd5ff84211)) ([#434](https://github.com/qlover/fe-base/pull/434))
  - Deleted Error.ts and I18n.ts files as they contained unused error identifiers and localization keys.
  - This cleanup improves the overall codebase by removing unnecessary files, enhancing maintainability and reducing clutter.

  This update streamlines the application by eliminating redundant localization and error handling resources.

## 0.4.3

### Patch Changes

#### ✨ Features

- **create-app:** enhance environment configuration and localization support ([76e5e22](https://github.com/qlover/fe-base/commit/76e5e22e41fe23ce109c303ca3974103f8a85cf6)) ([#432](https://github.com/qlover/fe-base/pull/432))
  - Updated .gitignore to include .env files and added .env.template to the repository.
  - Introduced a new .env.template file for environment variable configuration in the react-app template.
  - Enhanced package.json scripts for development modes: added staging and production modes.
  - Updated README.md to document environment variable usage with Vite.
  - Added new error identifiers for token handling in Error.ts and updated UserService to utilize these identifiers.
  - Improved localization files to include new keys for error messages related to token absence.

  This update improves the application's configuration management and localization, enhancing developer experience and user feedback.

## 0.4.2

### Patch Changes

#### ✨ Features

- **create-app:** enhance routing and configuration with router prefix and new services ([b32795d](https://github.com/qlover/fe-base/commit/b32795d02af4234d4708a5bdcb111bf8d2a54bd6)) ([#430](https://github.com/qlover/fe-base/pull/430))
  - Introduced a router prefix in the configuration to manage asset paths and API routes more effectively.
  - Updated the application to utilize the new RouteService for routing logic, replacing the previous RouterController.
  - Refactored user authentication handling to use UserService, improving modularity and maintainability.
  - Added PublicAssetsPath service to manage public asset paths dynamically based on the router prefix.
  - Updated localization files to include additional keys and ensure consistency across languages.
  - Modified various components to integrate the new services and ensure proper routing and asset management.

  This update enhances the overall structure and flexibility of the application, paving the way for future improvements.

- **create-app:** enhance login and registration features with improved localization and form handling ([a3724e5](https://github.com/qlover/fe-base/commit/a3724e5e75c8708dd00684ece563d9e1c63c0d00)) ([#430](https://github.com/qlover/fe-base/pull/430))
  - Updated routing configuration to include localized titles for various pages, enhancing user experience.
  - Added new keys for login and registration in localization files for both English and Chinese.
  - Implemented a registration form with validation and user feedback, integrating with the UserService for account creation.
  - Enhanced the Login component to utilize localized strings for better accessibility and clarity.
  - Refactored the I18nService to support dynamic title updates based on the current route.

  This update significantly improves the user interface and experience for authentication processes within the application.

- **create-app:** refactor internationalization and store management ([c86ed98](https://github.com/qlover/fe-base/commit/c86ed9818d844d4059878c11897051a6c504a333)) ([#430](https://github.com/qlover/fe-base/pull/430))
  - Updated file structure for internationalization resources, moving identifiers to a new directory for better organization.
  - Introduced new error and i18n identifier files to enhance localization support.
  - Refactored store management by implementing a new StoreInterface, improving state management across services.
  - Replaced deprecated useSliceStore with a new useStore hook for better integration with the updated store architecture.
  - Enhanced README documentation to reflect changes in project structure and build optimizations.

  This update significantly improves the maintainability and scalability of the application, paving the way for future enhancements.

## 0.4.1

### Patch Changes

#### 🐞 Bug Fixes

- **create-app:** correct prettier version formatting in package.json.template ([dbd9336](https://github.com/qlover/fe-base/commit/dbd93366e04dcbbeba245d2dc28a7909957b58c3)) ([#428](https://github.com/qlover/fe-base/pull/428))

## 0.4.0

### Minor Changes

#### 🐞 Bug Fixes

- **create-app:** update root path resolution to use dirname for compatibility with ES modules ([d091f0b](https://github.com/qlover/fe-base/commit/d091f0bc5ed17a6d16a7bedcac5416a41cba41d2)) ([#426](https://github.com/qlover/fe-base/pull/426))

## 0.3.8

### Patch Changes

#### 🐞 Bug Fixes

- **create-app:** update dependencies and tsup configuration for @qlover/create-app ([4a5fa84](https://github.com/qlover/fe-base/commit/4a5fa846ae6c3df97c73df5e594c3adb4fb7cda9)) ([#424](https://github.com/qlover/fe-base/pull/424))
  - Reorganized package.json to move "commander" and "ora" to dependencies from devDependencies, ensuring they are included in the production build.
  - Updated tsup.config.ts to enhance build configuration by defining external modules and adjusting minification and splitting settings for improved performance.

## 0.3.7

### Patch Changes

#### ✨ Features

- add tabify method to format commit body in GitChangelog ([5670b78](https://github.com/qlover/fe-base/commit/5670b78b1cb06a730d2cbd7ac1f5bd7e9e7df490)) ([#422](https://github.com/qlover/fe-base/pull/422))
  - Introduced a new `tabify` method to format the body of commit messages by adding indentation.
  - Updated `parseCommitlint` to utilize the `tabify` method for improved body formatting.

#### 🐞 Bug Fixes

- update @qlover/create-app to use ES module format ([5e9dffb](https://github.com/qlover/fe-base/commit/5e9dffb4d9e54dc2457588a81b11159820196067)) ([#422](https://github.com/qlover/fe-base/pull/422))
  - Changed the entry point in package.json from "dist/index.cjs" to "dist/index.js" to align with ES module standards.
  - Updated tsup.config.ts to output in ES module format instead of CommonJS.
  - Refactored index.ts to use fileURLToPath for resolving the root path, enhancing compatibility with ES modules.

## 0.3.6

### Patch Changes

#### ♻️ Refactors

- update @qlover/create-app with new build tools and dependencies ([a6d902b](https://github.com/qlover/fe-base/commit/a6d902bee8a5f8b3c37669f26cf0862bf317ef6f)) ([#420](https://github.com/qlover/fe-base/pull/420))

- Replaced Rollup with tsup for building the application, enhancing build performance and simplifying configuration.
- Updated package.json to reflect changes in dependencies and scripts, including the removal of outdated entries.
- Improved README with installation and usage instructions for better user guidance.
- Removed unnecessary files and streamlined the project structure for clarity.

## 0.3.5

### Patch Changes

#### ✨ Features

- enhance Vite configuration and add new dependencies for improved build performance ([e14ee42](https://github.com/qlover/fe-base/commit/e14ee428d46fc48decb99762103c25d6e6c8535e)) ([#418](https://github.com/qlover/fe-base/pull/418))

- Added `terser` for advanced minification options, including console log removal and improved compression.
- Introduced `vite-plugin-imp` to optimize Ant Design imports, reducing bundle size and improving load times.
- Updated Vite configuration to define manual chunks for better code splitting and chunk management.

  Co-authored-by: QRJ <renjie.qin@brain.im>

## 0.3.4

### Patch Changes

#### ✨ Features

- enhance React app with Ant Design integration and theming improvements ([374eaa3](https://github.com/qlover/fe-base/commit/374eaa36ab85b71543668721888823c41793aa23)) ([#414](https://github.com/qlover/fe-base/pull/414))

- Added Vite as a dependency for improved build performance.
- Introduced new Ant Design components and updated existing ones for a consistent UI experience.
- Enhanced theming capabilities with new CSS variables and custom themes (default, dark, pink).
- Updated localization keys for the About page and added new messages for better user feedback.
- Refactored DialogHandler to manage Ant Design's static APIs globally.
- Improved overall code structure and organization for better maintainability.

  Co-authored-by: QRJ <renjie.qin@brain.im>

- enhance React app with improved configuration management and new components ([67f88cb](https://github.com/qlover/fe-base/commit/67f88cbc7cc0ebab51cbd33be66f98117fc2cf21)) ([#414](https://github.com/qlover/fe-base/pull/414))

- Introduced centralized AppConfig class for managing application settings and environment variables.
- Added DialogHandler for handling notifications and confirmations using Ant Design components.
- Refactored RouterLoader to support dynamic route configurations and lazy loading of components.
- Updated various API adapters to utilize the new AppConfig structure for better maintainability.
- Removed outdated DialogHandler implementation and reorganized related files for improved clarity.

  Co-authored-by: QRJ <renjie.qin@brain.im>

- integrate @brain-toolkit/antd-theme-override for improved Ant D… ([4ebb081](https://github.com/qlover/fe-base/commit/4ebb081d89397424c459dd7f885817152098e322)) ([#414](https://github.com/qlover/fe-base/pull/414))
  - feat: integrate @brain-toolkit/antd-theme-override for improved Ant Design support
  * Added @brain-toolkit/antd-theme-override as a dependency to enhance theming capabilities.
  * Updated imports to utilize the new theming library, replacing the deprecated antd-overried references.
  * Removed outdated files related to the previous Ant Design integration to streamline the codebase.
  * Refactored components to leverage the new theme provider and static API interface for notifications and modals.

  Co-authored-by: QRJ <renjie.qin@brain.im>
  - feat(I18nService): add translation method for improved localization support
  * Implemented a new `t` method in the I18nService class to facilitate key-based translations.
  * The method accepts a translation key and optional parameters, returning the translated value or the key if no translation is found.
  * Enhanced localization handling to improve user experience across the application.

  ***

  Co-authored-by: QRJ <renjie.qin@brain.im>

## 0.3.3

### Patch Changes

#### ✨ Features

- **LanguageSwitcher:** add language switcher component to enhance localization ([72edba8](https://github.com/qlover/fe-base/commit/72edba8a71dabba00608fceafc355cf4bc2dfd63)) ([#411](https://github.com/qlover/fe-base/pull/411))
  - Introduced a new LanguageSwitcher component that allows users to change the application language.
  - Integrated the component into BaseHeader for improved accessibility.
  - Utilized Ant Design's Select component for a user-friendly interface.
  - Implemented language change functionality that updates the URL and i18n configuration accordingly.

- **Login:** integrate Ant Design components for enhanced user experience ([d380157](https://github.com/qlover/fe-base/commit/d380157d3360ad5b9e96d0e3edeb2639a3a6ba9f)) ([#408](https://github.com/qlover/fe-base/pull/408))
  - Added Ant Design library to the project dependencies.
  - Refactored the Login component to utilize Ant Design's Form, Input, and Button components, improving the UI and UX.
  - Implemented a structured login form with validation and Google sign-in option.
  - Enhanced layout with a brand section and feature highlights for better engagement.

- update React app with Tailwind CSS integration and Ant Design enhancements ([eff0ae2](https://github.com/qlover/fe-base/commit/eff0ae25eb2f831b2344a9d4307495377dce647f)) ([#408](https://github.com/qlover/fe-base/pull/408))

- Added Tailwind CSS and its PostCSS and Vite plugins to the project dependencies.
- Refactored the PostCSS configuration to utilize the new Tailwind CSS setup.
- Updated the Tailwind configuration to simplify theme management.
- Enhanced the Login component with Ant Design's Form and Input components, improving the UI.
- Introduced a new CSS structure for theming, including default, dark, and pink themes.
- Removed outdated Tailwind CSS files from the uikit directory to streamline styles.

- enhance React app UI with Ant Design components and improve theming ([008e69a](https://github.com/qlover/fe-base/commit/008e69a89ca0ed0fe23d60c2b368fbd88bb3f15c)) ([#408](https://github.com/qlover/fe-base/pull/408))

- Replaced various UI elements with Ant Design components for a consistent look and feel.
- Updated ErrorIdentifier and Executor components to utilize Ant Design's Button and layout features.
- Refactored styles to leverage CSS variables for better theming across components.
- Added new task management features in the Executor component, including task creation and status tracking.
- Improved overall layout and responsiveness of pages with enhanced CSS styling.

- enhance localization and error handling in React app ([f8a5398](https://github.com/qlover/fe-base/commit/f8a5398084cde69b967242a1db89d511a4b2b79e)) ([#408](https://github.com/qlover/fe-base/pull/408))
  feat: enhance localization and error handling in React app

- Introduced new localization keys for various pages including JSONStorage, Request, and Executor.
- Updated components to utilize new localization keys for improved internationalization support.
- Removed outdated error identifiers and added new ones for better clarity and consistency.
- Enhanced the Home, About, and ErrorIdentifier components with improved localization.
- Streamlined theme switcher labels to utilize localization keys for better user experience.

#### ♻️ Refactors

- **Bootstrap:** update dependencies and refactor core components ([9aeff78](https://github.com/qlover/fe-base/commit/9aeff78209925a9e3e6e4cdf1e5a7cbbcecb07f8)) ([#411](https://github.com/qlover/fe-base/pull/411))
  - Upgraded @qlover/corekit-bridge to version ^1.0.3 in package.json.
  - Refactored startup function to use 'root' instead of 'window' for better compatibility.
  - Removed InversifyIocInterface.ts as it was no longer needed.
  - Enhanced I18nService to manage loading state and language changes more effectively.
  - Introduced BootstrapsRegistry for improved bootstrap management and organization.
  - Updated various register classes to align with new IOC structure and improve dependency injection.
  - Added printBootstrap for logging successful bootstrap initialization.

- **Home, JSONStorage, Layout, BaseHeader:** enhance UI with Ant Design components and improve theming ([8023e01](https://github.com/qlover/fe-base/commit/8023e0179729859a1406f5dabf013f529c1a2b58)) ([#408](https://github.com/qlover/fe-base/pull/408))
  - Replaced button elements with Ant Design's Button component for a consistent UI experience.
  - Updated layout and background colors to utilize CSS variables for better theming.
  - Refactored navigation items in Home component for improved structure and readability.
  - Enhanced JSONStorage component styling and layout for better user interaction.
  - Improved BaseHeader styling with new background and border colors for a modern look.

- streamline UI components and enhance theming in React app ([9baf49b](https://github.com/qlover/fe-base/commit/9baf49b60b58f3c3e614f2bf473853a50abeff8e)) ([#408](https://github.com/qlover/fe-base/pull/408))

- Consolidated background and text color styles across various components to utilize CSS variables for improved theming.
- Updated 404 and 500 error pages to align with new color schemes.
- Refactored Login, About, and Executor components to enhance layout and responsiveness.
- Improved overall consistency in UI by replacing hardcoded colors with theme variables.
- Enhanced the Home and JSONStorage components for better user experience and visual appeal.

- update localization and error handling in React app ([b5617a1](https://github.com/qlover/fe-base/commit/b5617a1e04770352d92a840a59728a57955475fe)) ([#408](https://github.com/qlover/fe-base/pull/408))

- Renamed error identifier files for clarity and consistency.
- Introduced new localization identifiers for error messages and page content.
- Updated configuration to reflect new file paths for error handling.
- Removed outdated localization files to streamline the project structure.
- Enhanced the Home and About components with improved localization support.

- **Loading:** update loading component with animated bouncing dots ([83ede4b](https://github.com/qlover/fe-base/commit/83ede4b644a01843dd64e2d3e5254730f115d1ec)) ([#408](https://github.com/qlover/fe-base/pull/408))
  - Replaced the SVG spinner with a new loading animation using bouncing dots for improved visual appeal.
  - Utilized the clsx library for conditional class management, enhancing readability and maintainability.
  - Adjusted styles to support dark mode and added backdrop blur for fullscreen loading state.

## 0.3.2

### Patch Changes

#### 🐞 Bug Fixes

- **ColorFormatter.test:** remove unnecessary console.info call from test ([6f58880](https://github.com/qlover/fe-base/commit/6f588806c1db82042aaf2f9ebfa29846397e254c)) ([#389](https://github.com/qlover/fe-base/pull/389))

## 0.3.1

## 0.3.0

### Minor Changes

#### ✨ Features

- integrate @qlover/logger into corekit-bridge (#373)
  - Added @qlover/logger as a dependency across multiple files, replacing the previous logger from @qlover/fe-corekit.
  - Updated type references to LoggerInterface in Bootstrap, ApiCatchPlugin, and ApiMockPlugin.
  - Introduced ColorFormatter for enhanced logging capabilities, with tests added for ColorFormatter and ColorLogger.
  - Updated tsconfig.json to include test files for better coverage.
  - Adjusted pnpm-lock.yaml to reflect the new logger integration.

#### 🐞 Bug Fixes

- update ColorFormatter tests to utilize LogContext (#373)
  - Modified ColorFormatter tests to use the new LogContext class for improved context handling.
  - Adjusted the test setup to ensure proper formatting of color segments with the updated LogContext structure.
  - Exported LogContext from the logger package for broader accessibility.

#### ♻️ Refactors

- enhance context handling and update ColorFormatter tests (#373)
  - Refactored logger context handling to utilize a new LogContext class for better type safety and clarity.
  - Updated ColorFormatter tests to use logger.context for passing context objects.
  - Adjusted ColorFormatter methods to improve handling of color segments and context.
  - Improved documentation for context usage in logger methods.

- replace ConsoleAppender with ConsoleHandler (#373)
  - Updated tests and implementation to utilize ConsoleHandler instead of ConsoleAppender for improved logging functionality.
  - Introduced ConsoleHandler class to manage log events and formatting.
  - Adjusted Logger integration to reflect the new handler structure across various test files and implementations.

  ***

## 0.2.1

## 0.2.0

### Minor Changes

#### ✨ Features

- Update ReleaseParams to include batchTagName and modify batchBranchName format (#362)
  - Added `batchTagName` for batch release tagging with a new default format.
  - Updated `batchBranchName` format to improve clarity and consistency.
  - Enhanced the logic for generating release tags in the ReleaseParams class.

- Introduce viteMockPackage plugin and add mock implementations for env-loader and fe-corekit (#362)
  - Added a new viteMockPackage plugin to facilitate mocking of specified packages in Vite tests.
  - Implemented mock classes for Env in @qlover/env-loader and Logger in @qlover/fe-corekit.
  - Updated vite.config.ts to include alias mappings for the mocked packages.
  - Refactored tests to utilize the new mock implementations, enhancing test isolation and reliability.

#### ♻️ Refactors

- Simplify getDependencyReleaseLine function to return an empty string (#362)
  - Removed unnecessary parameters and streamlined the function for better clarity and performance.

- Update GitChangelogOptions interface and improve comments (#362)
  - Translated comments from Chinese to English for better clarity.
  - Enhanced the GitChangelogOptions interface by adding a new `formatter` property and updating existing descriptions for consistency.
  - Cleaned up comments in the GitChangelog class for improved readability.

- Enhance viteMockPackage to support dynamic alias mapping (#362)
  - Introduced `parsePackagesMap` function to dynamically generate alias mappings for specified packages in vite.config.ts.
  - Updated vite.config.ts to utilize the new function, improving maintainability and flexibility of package mocking.
  - Removed hardcoded alias mappings for a more scalable approach to package management.

  ***

## 0.1.22

### Patch Changes

#### ✨ Features

- Update ReleaseParams to include batchTagName and modify batchBranchName format (#362)
  - Added `batchTagName` for batch release tagging with a new default format.
  - Updated `batchBranchName` format to improve clarity and consistency.
  - Enhanced the logic for generating release tags in the ReleaseParams class.

- Introduce viteMockPackage plugin and add mock implementations for env-loader and fe-corekit (#362)
  - Added a new viteMockPackage plugin to facilitate mocking of specified packages in Vite tests.
  - Implemented mock classes for Env in @qlover/env-loader and Logger in @qlover/fe-corekit.
  - Updated vite.config.ts to include alias mappings for the mocked packages.
  - Refactored tests to utilize the new mock implementations, enhancing test isolation and reliability.

#### ♻️ Refactors

- Simplify getDependencyReleaseLine function to return an empty string (#362)
  - Removed unnecessary parameters and streamlined the function for better clarity and performance.

- Update GitChangelogOptions interface and improve comments (#362)
  - Translated comments from Chinese to English for better clarity.
  - Enhanced the GitChangelogOptions interface by adding a new `formatter` property and updating existing descriptions for consistency.
  - Cleaned up comments in the GitChangelog class for improved readability.

- Enhance viteMockPackage to support dynamic alias mapping (#362)
  - Introduced `parsePackagesMap` function to dynamically generate alias mappings for specified packages in vite.config.ts.
  - Updated vite.config.ts to utilize the new function, improving maintainability and flexibility of package mocking.
  - Removed hardcoded alias mappings for a more scalable approach to package management.

  ***

## 0.1.21

### Patch Changes

#### 🐞 Bug Fixes

- add dry run script for release PRs and update changelog template formatting (#358)

#### ♻️ Refactors

- enhance commit flattening logic and improve tag existence check; clean up Changelog plugin (#358)

- update default log format and add logCommand option for enhanced flexibility in changelog generation (#358)
- Updated dependencies

## 0.1.20

### Patch Changes

#### ✨ Features

- implement GitChangelog for improved changelog generation (#351)
  - Introduced a new GitChangelog class to facilitate the generation of changelogs based on Git commit history.
  - Added interfaces for PRCommit, CommitInfo, and FlatCommit to structure commit data.
  - Updated Changelog plugin to utilize GitChangelog for fetching and formatting PR commits, replacing the previous conventional-changelog implementation.
  - Enhanced default options for changelog types and formatting.

#### 🐞 Bug Fixes

- add option to push changed labels to release PRs in workflow (#353)

- Updated dependencies
  - @qlover/fe-corekit@1.2.8
  - @qlover/scripts-context@0.0.14

## 0.1.15 (2025-04-17)

### Features

- add inversify ioc ([#270](https://github.com/qlover/fe-base/issues/270)) ([8c7ba06](https://github.com/qlover/fe-base/commit/8c7ba06bc5bef63d85c59a94737afac9be59138f))
- add script-context ([#213](https://github.com/qlover/fe-base/issues/213)) ([e021441](https://github.com/qlover/fe-base/commit/e021441180d4c4bd89947b155d39224f89699fda))
- create app v0.1 ([#209](https://github.com/qlover/fe-base/issues/209)) ([b730d76](https://github.com/qlover/fe-base/commit/b730d76512a9e1ce765ec77145abfe179b585178))
- feature yarn to pnpm ([#297](https://github.com/qlover/fe-base/issues/297)) ([c3e13d5](https://github.com/qlover/fe-base/commit/c3e13d509a752267d9be29e7a5ed609d24c309ce))
- optz create-app deep ([#244](https://github.com/qlover/fe-base/issues/244)) ([c0a89ef](https://github.com/qlover/fe-base/commit/c0a89ef5dc2f3cc216b4fc1968b1b626c58947d5))
- template context ([#241](https://github.com/qlover/fe-base/issues/241)) ([9fb3046](https://github.com/qlover/fe-base/commit/9fb3046e3e67c02e5fe4fea81a9a3ef8422e3013))

### Bug Fixes

- .gitignore no file ([#207](https://github.com/qlover/fe-base/issues/207)) ([e61d468](https://github.com/qlover/fe-base/commit/e61d4683a072048326205272d927e7e67b87ba70))
- add pnpm install ([#248](https://github.com/qlover/fe-base/issues/248)) ([e1e9f48](https://github.com/qlover/fe-base/commit/e1e9f4841365c51e9b8ea7b01ac6fc70e35eec37))
- release publish npm ([#327](https://github.com/qlover/fe-base/issues/327)) ([fa26d04](https://github.com/qlover/fe-base/commit/fa26d04eab2fa1ea4baa05c4d3502e5a873d5c8c))

## 0.1.14 (2025-04-17)

## [0.1.12](https://github.com/qlover/fe-base/compare/create-app-v0.1.11...create-app-v0.1.12) (2025-03-18)

### Features

- add inversify ioc ([#270](https://github.com/qlover/fe-base/issues/270)) ([8c7ba06](https://github.com/qlover/fe-base/commit/8c7ba06bc5bef63d85c59a94737afac9be59138f))

## [0.1.11](https://github.com/qlover/fe-base/compare/create-app-v0.1.10...create-app-v0.1.11) (2025-03-12)

## [0.1.10](https://github.com/qlover/fe-base/compare/create-app-v0.1.9...create-app-v0.1.10) (2025-02-20)

## [0.1.9](https://github.com/qlover/fe-base/compare/create-app-v0.1.8...create-app-v0.1.9) (2025-02-20)

### Bug Fixes

- add pnpm install ([#248](https://github.com/qlover/fe-base/issues/248)) ([e1e9f48](https://github.com/qlover/fe-base/commit/e1e9f4841365c51e9b8ea7b01ac6fc70e35eec37))

## [0.1.8](https://github.com/qlover/fe-base/compare/create-app-v0.1.7...create-app-v0.1.8) (2025-02-19)

## [0.1.7](https://github.com/qlover/fe-base/compare/create-app-v0.1.6...create-app-v0.1.7) (2025-02-19)

### Features

- optz create-app deep ([#244](https://github.com/qlover/fe-base/issues/244)) ([c0a89ef](https://github.com/qlover/fe-base/commit/c0a89ef5dc2f3cc216b4fc1968b1b626c58947d5))

## [0.1.6](https://github.com/qlover/fe-base/compare/create-app-v0.1.5...create-app-v0.1.6) (2025-02-14)

### Features

- template context ([#241](https://github.com/qlover/fe-base/issues/241)) ([9fb3046](https://github.com/qlover/fe-base/commit/9fb3046e3e67c02e5fe4fea81a9a3ef8422e3013))

## [0.1.5](https://github.com/qlover/fe-base/compare/create-app-v0.1.4...create-app-v0.1.5) (2025-02-13)

## [0.1.4](https://github.com/qlover/fe-base/compare/create-app-v0.1.3...create-app-v0.1.4) (2025-01-20)

## [0.1.3](https://github.com/qlover/fe-base/compare/create-app-v0.1.2...create-app-v0.1.3) (2025-01-17)

## [0.1.2](https://github.com/qlover/fe-base/compare/create-app-v0.1.1...create-app-v0.1.2) (2025-01-17)

### Features

- add script-context ([#213](https://github.com/qlover/fe-base/issues/213)) ([e021441](https://github.com/qlover/fe-base/commit/e021441180d4c4bd89947b155d39224f89699fda))

## [0.1.1](https://github.com/qlover/fe-base/compare/create-app-v0.0.4...create-app-v0.1.1) (2025-01-15)

### Features

- create app v0.1 ([#209](https://github.com/qlover/fe-base/issues/209)) ([b730d76](https://github.com/qlover/fe-base/commit/b730d76512a9e1ce765ec77145abfe179b585178))

## [0.0.4](https://github.com/qlover/fe-base/compare/create-app-v0.0.3...create-app-v0.0.4) (2025-01-15)

### Bug Fixes

- .gitignore no file ([#207](https://github.com/qlover/fe-base/issues/207)) ([e61d468](https://github.com/qlover/fe-base/commit/e61d4683a072048326205272d927e7e67b87ba70))

## 0.0.1 (2025-01-14)

## 0.0.2 (2025-01-14)

### Features

- create fe app ([#200](https://github.com/qlover/fe-base/issues/200)) ([8d3668f](https://github.com/qlover/fe-base/commit/8d3668f0e69a579994a72fc7b36b5ba7d5633c70))
