# examples/next-seed

## 0.0.3

### Patch Changes

#### ♻️ Refactors

- **eslint:** remove node globals restriction and adjust reflect-metadata imports ([589a430](https://github.com/qlover/fe-base/commit/589a430b5a2c78e9211c0b8d21ce1ebd175ed741)) ([#596](https://github.com/qlover/fe-base/pull/596))
  - Removed the restriction of node globals in the ESLint configuration for `fe-corekit` and `corekit-node`, simplifying the linting setup.
  - Eliminated unnecessary `reflect-metadata` imports from several files in the `next-seed` example, streamlining the codebase.
  - Added `reflect-metadata` import in `index.ts` of the shared container to ensure proper functionality of dependency injection.

  These changes aim to enhance code clarity and maintainability across the project.

## 0.0.2

### Patch Changes

#### ✨ Features

- **next-seed:** enhance logging and configuration management ([943d774](https://github.com/qlover/fe-base/commit/943d774b48454b111ff6abaaeaeefe04f777ada3)) ([#585](https://github.com/qlover/fe-base/pull/585))
  - Added `LOG_LEVEL` to `.env.template` for configurable logging levels.
  - Updated `ServerConfig` and `ServerGlobals` to utilize the new `logLevel` setting, improving log management.
  - Enhanced error handling in `NextApiServer` to log errors at the appropriate level based on the environment.
  - Introduced new localization identifiers for improved user feedback in the UI, including error messages related to user information refresh.

  These changes aim to provide better control over logging behavior and enhance user experience through improved error messaging.

- **next-seed:** enhance internationalization support and localization files ([43ac4ed](https://github.com/qlover/fe-base/commit/43ac4ed6dc6b949e63b93d5fde152f6d9acc7043)) ([#584](https://github.com/qlover/fe-base/pull/584))
  - Updated `generateLocales` function to accept a project root directory, improving flexibility in locale generation.
  - Added new localization identifiers for various pages, including user authentication, admin management, and home page content, enhancing multi-language support.
  - Introduced new files for common and page-specific localization keys, ensuring a comprehensive approach to internationalization.
  - Improved error handling in locale generation to provide clearer feedback during the build process.

  These changes aim to strengthen the internationalization framework and improve the overall user experience across different languages.

- **next-seed:** Initialize Next.js full-stack application template ([b5b0a39](https://github.com/qlover/fe-base/commit/b5b0a39dd1144de52a587d402f24530b6359be15)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Created a new full-stack application template using Next.js, featuring a layered architecture and interface-driven design.
  - Added essential configuration files including `next.config.ts`, `package.json`, and ESLint configuration.
  - Integrated Tailwind CSS for styling and established a theme system.
  - Implemented comprehensive internationalization support with English and Chinese locales.
  - Set up TypeScript configurations and included various utility libraries for enhanced functionality.
  - Introduced a README file detailing project structure, setup instructions, and key features.

  These changes aim to provide a robust foundation for developing full-stack applications with Next.js, improving developer experience and maintainability.

- **next-seed:** Implement StringEncryptor and enhance configuration interfaces ([d37f5ce](https://github.com/qlover/fe-base/commit/d37f5cee7ee47c8ac7e00b9d1c9fd7daf5aa337c)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Added a new `StringEncryptor` class for secure string encryption and decryption, utilizing a custom algorithm and Base64 serialization.
  - Updated `adminNavs.ts` to use internationalization constants for navigation items, improving localization support.
  - Refactored `ioc-identifiter.ts` to replace `AppConfig` with `SeedConfigInterface`, enhancing type safety in dependency injection.
  - Introduced new interfaces for seed configuration and bootstrapping, improving project structure and maintainability.
  - Removed obsolete `AdminLayoutInterface` and related files to streamline the codebase.
  - Added various validation schemas and interfaces for user authentication and pagination, enhancing data integrity and validation processes.

  These changes aim to strengthen security, improve localization, and enhance the overall architecture of the Next.js application.

- **next-seed:** Introduce new CSS structure and Ant Design theme variables ([9148db8](https://github.com/qlover/fe-base/commit/9148db8c972a8c0b0219ec6db0d54221588382e9)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Added new CSS files for Tailwind and Ant Design themes, establishing a modular styling approach.
  - Created `index.css` to import Tailwind and Ant Design theme styles, enhancing the overall styling architecture.
  - Introduced various theme-specific CSS files, including `common.css`, `menu.css`, `pagination.css`, and `table.css`, to define custom variables for Ant Design components.
  - Removed obsolete CSS files to streamline the styling structure and improve maintainability.

  These changes aim to enhance the styling capabilities of the Next.js application, providing a more organized and theme-driven approach to CSS management.

- **next-seed:** Enhance ESLint configuration and update project documentation ([0054b76](https://github.com/qlover/fe-base/commit/0054b76400bdb0f6e917d986d60d6663efdfb0ce)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Updated ESLint configuration to include new language options for TypeScript, improving linting accuracy and support.
  - Revised the README files to reflect the new project structure and key features, enhancing clarity for developers.
  - Adjusted import paths in layout and page components to align with the updated directory structure, ensuring consistency across the codebase.
  - Removed obsolete login and register form components to streamline the authentication flow, improving maintainability.

  These changes aim to improve code quality, enhance documentation, and refine the overall structure of the Next.js application.

- **next-seed:** Update dependencies and enhance API documentation ([231110d](https://github.com/qlover/fe-base/commit/231110d4a1060d15333f9c4e6d08d74a008eebc9)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Added new dependencies including `@scalar/nextjs-api-reference`, `next-swagger-doc`, and `swagger-ui-react` to improve API documentation capabilities.
  - Updated `pnpm-lock.yaml` to reflect new package versions and their dependencies.
  - Introduced Swagger annotations in various API routes to provide detailed documentation for endpoints, enhancing developer experience.
  - Removed obsolete `auth/callback` route to streamline the authentication flow.

  These changes aim to improve API documentation and maintainability of the Next.js application.

- **next-seed:** Update project configuration and enhance sitemap functionality ([1e66102](https://github.com/qlover/fe-base/commit/1e66102379234b33cd23623b216bf4663345339f)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Added `next-sitemap` dependency to facilitate sitemap generation for improved SEO.
  - Updated `.env.template` to include new environment variables for site URL configuration.
  - Created `next-sitemap.config.js` to define sitemap settings and rules for robots.txt generation.
  - Modified `package.json` build scripts to automatically generate the sitemap during the build process.
  - Updated `.gitignore` to exclude generated sitemap files from version control.
  - Introduced a new `robots.txt` file to guide search engine indexing.

  These changes aim to enhance the SEO capabilities of the Next.js application and streamline the sitemap generation process.

#### 🐞 Bug Fixes

- **container:** adjust reflect-metadata import in InversifyContainer and IOCProvider ([828ee71](https://github.com/qlover/fe-base/commit/828ee71d14edcce8685c608b18584437ae25dddd)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Removed the import of 'reflect-metadata' from InversifyContainer.ts to streamline the container setup.
  - Added the 'reflect-metadata' import in IOCProvider.tsx to ensure proper functionality of dependency injection.

  These changes aim to improve the configuration of the Inversify container and ensure correct metadata reflection in the IOC provider.

- **next-seed:** improve environment variable handling in ServerConfig and AppConfig ([c3f12b0](https://github.com/qlover/fe-base/commit/c3f12b0e5eab8f725ebb6f4bf9c3191c7490a454)) ([#585](https://github.com/qlover/fe-base/pull/585))
  - Updated environment variable assignments in `ServerConfig.ts` and `AppConfig.ts` to use nullish coalescing, providing default values for critical configurations.
  - Added error handling in `AIService.ts` to ensure that both OpenAI API key and base URL are provided, enhancing robustness in service initialization.
  - These changes aim to improve the reliability of configuration management and prevent runtime errors due to missing environment variables.

- **next-seed:** update build scripts and enhance logging behavior ([f246599](https://github.com/qlover/fe-base/commit/f2465993e78de40418bbcca4fc336dba65a9dd55)) ([#584](https://github.com/qlover/fe-base/pull/584))
  - Modified build scripts in `package.json` to set `NODE_ENV` to `production` for staging and development builds, ensuring optimized performance.
  - Updated logging configuration in `ServerGlobals.ts` to silence logs in production, improving log management.
  - Refactored `SimpleIOCContainer` to handle optional logger instances, enhancing flexibility in dependency injection.
  - Simplified type definitions in `PagesRouter.ts` by removing unused router types, streamlining the codebase.
  - Refactored `_app.tsx` to directly export the App component, improving clarity and removing unnecessary router wrapping.
  - Updated `_document.tsx` to use a class-based component for better structure and maintainability.
  - Replaced `useRouter` with `usePathname` in `AdminLayout.tsx` and `LanguageSwitcher.tsx` for improved routing capabilities in Next.js.

  These changes aim to enhance the build process, improve logging behavior, and streamline the overall code structure in the Next.js seed project.

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

- **interfaces:** update SeedServerConfigInterface imports across services ([27e0d59](https://github.com/qlover/fe-base/commit/27e0d59d3bc6582f478bed6791b0105e49fc4166)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Replaced imports of SeedServerConfigInterface from '@qlover/corekit-bridge/bootstrap' to '@interfaces/SeedConfigInterface' in multiple service files, including ServerAuth, ServerConfig, AIService, and UserService.
  - This change enhances consistency in interface usage and improves code organization across the project.

- **LocaleLink:** refine props interface by omitting 'children' from HTML attributes ([be9d80f](https://github.com/qlover/fe-base/commit/be9d80fe533531a170e195b5c1bf814bc6bd4c90)) ([#590](https://github.com/qlover/fe-base/pull/590))
  - Updated the `LocaleLinkProps` interface in `LocaleLink.tsx` to omit the 'children' property from `React.HTMLAttributes<HTMLAnchorElement>`, ensuring better type safety and clarity in component usage.

  This change aims to enhance the type definitions for the `LocaleLink` component, improving developer experience and reducing potential errors.

- **next-seed:** Update import paths and enhance server structure ([1a328e4](https://github.com/qlover/fe-base/commit/1a328e407bcbd069de861c50a4e0dd6e32ff9a02)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Changed import paths for `AppErrorApi` and `AppSuccessApi` to use the new `@interfaces` directory, improving consistency across the codebase.
  - Introduced new `BootstrapServer`, `Datetime`, `ServerConfig`, `ServerGlobals`, and `serverIoc` files to enhance server initialization and configuration management.
  - Removed obsolete `AdminLocalesController`, `AdminUserController`, and related interfaces to streamline the codebase.
  - Updated various service and controller files to align with the new structure and interfaces, improving maintainability and clarity.

  These changes aim to strengthen the server architecture and improve code organization within the Next.js application.

- **next-seed:** Simplify layout structure by removing BootstrapsProvider ([a23d8b7](https://github.com/qlover/fe-base/commit/a23d8b7a704b128e12775312b74675e51a881807)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Removed the `BootstrapsProvider` from the layout component to streamline the component hierarchy.
  - Retained the `ClientRootProvider` for theme configuration, ensuring that child components still receive necessary context.
  - This change aims to enhance code clarity and maintainability by reducing unnecessary nesting in the layout structure.

## 0.0.1

### Patch Changes

#### ✨ Features

- **next-seed:** enhance logging and configuration management ([943d774](https://github.com/qlover/fe-base/commit/943d774b48454b111ff6abaaeaeefe04f777ada3)) ([#585](https://github.com/qlover/fe-base/pull/585))
  - Added `LOG_LEVEL` to `.env.template` for configurable logging levels.
  - Updated `ServerConfig` and `ServerGlobals` to utilize the new `logLevel` setting, improving log management.
  - Enhanced error handling in `NextApiServer` to log errors at the appropriate level based on the environment.
  - Introduced new localization identifiers for improved user feedback in the UI, including error messages related to user information refresh.

  These changes aim to provide better control over logging behavior and enhance user experience through improved error messaging.

- **next-seed:** enhance internationalization support and localization files ([43ac4ed](https://github.com/qlover/fe-base/commit/43ac4ed6dc6b949e63b93d5fde152f6d9acc7043)) ([#584](https://github.com/qlover/fe-base/pull/584))
  - Updated `generateLocales` function to accept a project root directory, improving flexibility in locale generation.
  - Added new localization identifiers for various pages, including user authentication, admin management, and home page content, enhancing multi-language support.
  - Introduced new files for common and page-specific localization keys, ensuring a comprehensive approach to internationalization.
  - Improved error handling in locale generation to provide clearer feedback during the build process.

  These changes aim to strengthen the internationalization framework and improve the overall user experience across different languages.

- **next-seed:** Initialize Next.js full-stack application template ([b5b0a39](https://github.com/qlover/fe-base/commit/b5b0a39dd1144de52a587d402f24530b6359be15)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Created a new full-stack application template using Next.js, featuring a layered architecture and interface-driven design.
  - Added essential configuration files including `next.config.ts`, `package.json`, and ESLint configuration.
  - Integrated Tailwind CSS for styling and established a theme system.
  - Implemented comprehensive internationalization support with English and Chinese locales.
  - Set up TypeScript configurations and included various utility libraries for enhanced functionality.
  - Introduced a README file detailing project structure, setup instructions, and key features.

  These changes aim to provide a robust foundation for developing full-stack applications with Next.js, improving developer experience and maintainability.

- **next-seed:** Implement StringEncryptor and enhance configuration interfaces ([d37f5ce](https://github.com/qlover/fe-base/commit/d37f5cee7ee47c8ac7e00b9d1c9fd7daf5aa337c)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Added a new `StringEncryptor` class for secure string encryption and decryption, utilizing a custom algorithm and Base64 serialization.
  - Updated `adminNavs.ts` to use internationalization constants for navigation items, improving localization support.
  - Refactored `ioc-identifiter.ts` to replace `AppConfig` with `SeedConfigInterface`, enhancing type safety in dependency injection.
  - Introduced new interfaces for seed configuration and bootstrapping, improving project structure and maintainability.
  - Removed obsolete `AdminLayoutInterface` and related files to streamline the codebase.
  - Added various validation schemas and interfaces for user authentication and pagination, enhancing data integrity and validation processes.

  These changes aim to strengthen security, improve localization, and enhance the overall architecture of the Next.js application.

- **next-seed:** Introduce new CSS structure and Ant Design theme variables ([9148db8](https://github.com/qlover/fe-base/commit/9148db8c972a8c0b0219ec6db0d54221588382e9)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Added new CSS files for Tailwind and Ant Design themes, establishing a modular styling approach.
  - Created `index.css` to import Tailwind and Ant Design theme styles, enhancing the overall styling architecture.
  - Introduced various theme-specific CSS files, including `common.css`, `menu.css`, `pagination.css`, and `table.css`, to define custom variables for Ant Design components.
  - Removed obsolete CSS files to streamline the styling structure and improve maintainability.

  These changes aim to enhance the styling capabilities of the Next.js application, providing a more organized and theme-driven approach to CSS management.

- **next-seed:** Enhance ESLint configuration and update project documentation ([0054b76](https://github.com/qlover/fe-base/commit/0054b76400bdb0f6e917d986d60d6663efdfb0ce)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Updated ESLint configuration to include new language options for TypeScript, improving linting accuracy and support.
  - Revised the README files to reflect the new project structure and key features, enhancing clarity for developers.
  - Adjusted import paths in layout and page components to align with the updated directory structure, ensuring consistency across the codebase.
  - Removed obsolete login and register form components to streamline the authentication flow, improving maintainability.

  These changes aim to improve code quality, enhance documentation, and refine the overall structure of the Next.js application.

- **next-seed:** Update dependencies and enhance API documentation ([231110d](https://github.com/qlover/fe-base/commit/231110d4a1060d15333f9c4e6d08d74a008eebc9)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Added new dependencies including `@scalar/nextjs-api-reference`, `next-swagger-doc`, and `swagger-ui-react` to improve API documentation capabilities.
  - Updated `pnpm-lock.yaml` to reflect new package versions and their dependencies.
  - Introduced Swagger annotations in various API routes to provide detailed documentation for endpoints, enhancing developer experience.
  - Removed obsolete `auth/callback` route to streamline the authentication flow.

  These changes aim to improve API documentation and maintainability of the Next.js application.

- **next-seed:** Update project configuration and enhance sitemap functionality ([1e66102](https://github.com/qlover/fe-base/commit/1e66102379234b33cd23623b216bf4663345339f)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Added `next-sitemap` dependency to facilitate sitemap generation for improved SEO.
  - Updated `.env.template` to include new environment variables for site URL configuration.
  - Created `next-sitemap.config.js` to define sitemap settings and rules for robots.txt generation.
  - Modified `package.json` build scripts to automatically generate the sitemap during the build process.
  - Updated `.gitignore` to exclude generated sitemap files from version control.
  - Introduced a new `robots.txt` file to guide search engine indexing.

  These changes aim to enhance the SEO capabilities of the Next.js application and streamline the sitemap generation process.

#### 🐞 Bug Fixes

- **container:** adjust reflect-metadata import in InversifyContainer and IOCProvider ([828ee71](https://github.com/qlover/fe-base/commit/828ee71d14edcce8685c608b18584437ae25dddd)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Removed the import of 'reflect-metadata' from InversifyContainer.ts to streamline the container setup.
  - Added the 'reflect-metadata' import in IOCProvider.tsx to ensure proper functionality of dependency injection.

  These changes aim to improve the configuration of the Inversify container and ensure correct metadata reflection in the IOC provider.

- **next-seed:** improve environment variable handling in ServerConfig and AppConfig ([c3f12b0](https://github.com/qlover/fe-base/commit/c3f12b0e5eab8f725ebb6f4bf9c3191c7490a454)) ([#585](https://github.com/qlover/fe-base/pull/585))
  - Updated environment variable assignments in `ServerConfig.ts` and `AppConfig.ts` to use nullish coalescing, providing default values for critical configurations.
  - Added error handling in `AIService.ts` to ensure that both OpenAI API key and base URL are provided, enhancing robustness in service initialization.
  - These changes aim to improve the reliability of configuration management and prevent runtime errors due to missing environment variables.

- **next-seed:** update build scripts and enhance logging behavior ([f246599](https://github.com/qlover/fe-base/commit/f2465993e78de40418bbcca4fc336dba65a9dd55)) ([#584](https://github.com/qlover/fe-base/pull/584))
  - Modified build scripts in `package.json` to set `NODE_ENV` to `production` for staging and development builds, ensuring optimized performance.
  - Updated logging configuration in `ServerGlobals.ts` to silence logs in production, improving log management.
  - Refactored `SimpleIOCContainer` to handle optional logger instances, enhancing flexibility in dependency injection.
  - Simplified type definitions in `PagesRouter.ts` by removing unused router types, streamlining the codebase.
  - Refactored `_app.tsx` to directly export the App component, improving clarity and removing unnecessary router wrapping.
  - Updated `_document.tsx` to use a class-based component for better structure and maintainability.
  - Replaced `useRouter` with `usePathname` in `AdminLayout.tsx` and `LanguageSwitcher.tsx` for improved routing capabilities in Next.js.

  These changes aim to enhance the build process, improve logging behavior, and streamline the overall code structure in the Next.js seed project.

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

- **interfaces:** update SeedServerConfigInterface imports across services ([27e0d59](https://github.com/qlover/fe-base/commit/27e0d59d3bc6582f478bed6791b0105e49fc4166)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Replaced imports of SeedServerConfigInterface from '@qlover/corekit-bridge/bootstrap' to '@interfaces/SeedConfigInterface' in multiple service files, including ServerAuth, ServerConfig, AIService, and UserService.
  - This change enhances consistency in interface usage and improves code organization across the project.

- **LocaleLink:** refine props interface by omitting 'children' from HTML attributes ([be9d80f](https://github.com/qlover/fe-base/commit/be9d80fe533531a170e195b5c1bf814bc6bd4c90)) ([#590](https://github.com/qlover/fe-base/pull/590))
  - Updated the `LocaleLinkProps` interface in `LocaleLink.tsx` to omit the 'children' property from `React.HTMLAttributes<HTMLAnchorElement>`, ensuring better type safety and clarity in component usage.

  This change aims to enhance the type definitions for the `LocaleLink` component, improving developer experience and reducing potential errors.

- **next-seed:** Update import paths and enhance server structure ([1a328e4](https://github.com/qlover/fe-base/commit/1a328e407bcbd069de861c50a4e0dd6e32ff9a02)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Changed import paths for `AppErrorApi` and `AppSuccessApi` to use the new `@interfaces` directory, improving consistency across the codebase.
  - Introduced new `BootstrapServer`, `Datetime`, `ServerConfig`, `ServerGlobals`, and `serverIoc` files to enhance server initialization and configuration management.
  - Removed obsolete `AdminLocalesController`, `AdminUserController`, and related interfaces to streamline the codebase.
  - Updated various service and controller files to align with the new structure and interfaces, improving maintainability and clarity.

  These changes aim to strengthen the server architecture and improve code organization within the Next.js application.

- **next-seed:** Simplify layout structure by removing BootstrapsProvider ([a23d8b7](https://github.com/qlover/fe-base/commit/a23d8b7a704b128e12775312b74675e51a881807)) ([#583](https://github.com/qlover/fe-base/pull/583))
  - Removed the `BootstrapsProvider` from the layout component to streamline the component hierarchy.
  - Retained the `ClientRootProvider` for theme configuration, ensuring that child components still receive necessary context.
  - This change aims to enhance code clarity and maintainability by reducing unnecessary nesting in the layout structure.
