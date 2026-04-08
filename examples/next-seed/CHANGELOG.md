# examples/next-seed

## 1.1.0

### Minor Changes

#### ✨ Features

- **i18n:** add internationalization documentation in English and Chinese ([4e3f9ac](https://github.com/qlover/fe-base/commit/4e3f9acb90e544c8db56b1974c2d2504174e148c)) ([#606](https://github.com/qlover/fe-base/pull/606))
  - Introduced comprehensive i18n documentation for the `next-seed` project, detailing the internationalization architecture, core concepts, and usage examples for both App Router and Pages Router.
  - Created separate markdown files for English and Chinese versions to enhance accessibility for a broader audience.
  - Updated relevant components to utilize the new `PageI18nProvider` for improved context management in internationalization.

  These changes aim to facilitate better understanding and implementation of internationalization within the project.

- **request-logs:** add request_id column for enhanced API request tracking ([1b25767](https://github.com/qlover/fe-base/commit/1b25767fcaf7ba42b32070b8c5bc55baf199e2d4)) ([#606](https://github.com/qlover/fe-base/pull/606))
  - Introduced an optional `request_id` column in the `request_logs` table to facilitate correlation of API requests.
  - Updated relevant SQL scripts to ensure idempotent addition of the `request_id` column and its associated index.
  - Modified the `NextApiServer` to log the `request_id` when available, improving traceability of requests.
  - Adjusted the `RequestLogInsert` interface and related components to accommodate the new `request_id` field.
  - Enhanced the `RequestLogsTable` component to display the `request_id`, providing better visibility in the admin interface.

  These changes aim to improve the tracking and management of API requests within the application.

- **request-logs:** implement paged search functionality for user request logs ([1508127](https://github.com/qlover/fe-base/commit/1508127a2c2efd273148abfed06b5d2d849803db)) ([#606](https://github.com/qlover/fe-base/pull/606))
  - Added `searchRequestLogsForCurrentUser` method in `UserController` to support paged retrieval of request logs based on search parameters.
  - Updated `RequestLogsRepositoryInterface` and `RequestLogsRepository` to include a new search method that handles pagination and sorting.
  - Introduced `SearchParamsValidator` for validating search criteria from URL parameters.
  - Enhanced the `RequestLogsTable` component to support server-driven pagination.
  - Updated API documentation to reflect changes in request log retrieval, including new query parameters for pagination and sorting.

  These changes aim to improve the user experience by providing a more flexible and efficient way to access request logs.

- **pagination:** refactor pagination interfaces and implementations across repositories ([08f812c](https://github.com/qlover/fe-base/commit/08f812c9240089426ba68d24d54e3d92396ecb1d)) ([#606](https://github.com/qlover/fe-base/pull/606))
  - Updated `DBBridgeInterface` to utilize `PaginationParams` for consistent pagination handling.
  - Refactored `DBTableInterface` to define `DBTablePaginationParams`, enhancing type safety in pagination methods.
  - Modified `LocalesRepository` and `ApiLocaleService` to adopt the new pagination structure, improving clarity and maintainability.
  - Removed deprecated `PaginationInterface` and `PaginationSchema`, streamlining the pagination logic.
  - Introduced `PaginationResult` type for better alignment with search result structures.

  These changes aim to unify pagination handling across the application, enhancing type safety and code clarity.

- **request-logs:** implement user request logging and management ([e68f3e9](https://github.com/qlover/fe-base/commit/e68f3e9193014df88d3fdd17bfbe02c4ce4c60cc)) ([#603](https://github.com/qlover/fe-base/pull/603))
  - Introduced a new `request_logs` table with user-scoped row-level security for tracking API calls and authentication events.
  - Enhanced `UserService` and `UserController` to log login and logout events, capturing user agent and IP address.
  - Added API endpoint for users to retrieve their recent request logs, ensuring RLS compliance.
  - Created a new `RequestLogsTable` component for displaying logs in the admin interface.
  - Updated navigation and routing to include a dedicated request logs page for admin users.

  These changes aim to improve audit capabilities and enhance user activity tracking within the application.

#### 🐞 Bug Fixes

- **logging:** update appConfig logging to stringify object for better readability ([0338c12](https://github.com/qlover/fe-base/commit/0338c1256e9a67f24747952a27886f82c9e8af67)) ([#606](https://github.com/qlover/fe-base/pull/606))
  - Modified the logging of `appConfig` in `nextApiServerBackstop` to use `JSON.stringify`, enhancing the clarity of logged output.
  - This change improves the visibility of the configuration details during server initialization, aiding in debugging and monitoring.

  These updates aim to provide clearer logging information for developers.

#### ♻️ Refactors

- **appApi:** reorganize AppApi imports and enhance ClientIOCRegister ([0ab88a0](https://github.com/qlover/fe-base/commit/0ab88a08191aa43761362e87ed3595f764b52d07)) ([#606](https://github.com/qlover/fe-base/pull/606))
  - Updated import paths for AppApiRequester and related components to reflect new directory structure under `appApi`.
  - Introduced LocalStorage class for managing local storage operations, enhancing data handling capabilities.
  - Enhanced ClientIOCRegister to bind new LocalStorage and LocalStorageEncrypt instances, improving dependency management.
  - Added AppApiRegister class to streamline API request handling and registration within the IOC container.

  These changes aim to improve code organization and facilitate better management of API interactions and local storage.

## 1.0.0

### Major Changes

#### ✨ Features

- **docs:** add English README for browser-plugin-seed ([f93e3d4](https://github.com/qlover/fe-base/commit/f93e3d48fdee677bae56e01c00cd64a180b95ee4)) ([#604](https://github.com/qlover/fe-base/pull/604))
  - Introduced a new English README file for the browser-plugin-seed example, providing installation instructions, project layout, and core concepts.
  - Updated the existing Chinese README to include a link to the new English version.
  - Enhanced clarity on setup steps, including prerequisites, installation, running the development server, and building for production.

  These changes aim to improve accessibility and usability for English-speaking developers using the browser-plugin-seed template.

- **counter:** integrate Zustand for state management in the Next.js example ([a549c28](https://github.com/qlover/fe-base/commit/a549c28a8b85708ec1bec9826346508b13b595d7)) ([#604](https://github.com/qlover/fe-base/pull/604))
  - Added Zustand as a dependency to manage state more effectively.
  - Implemented ZustandCounterService to handle counter logic, including increment, decrement, and reset functionalities.
  - Created ZustandCounterServiceInterface to define the service contract.
  - Introduced ZustandCounterCard component to display and interact with the counter.
  - Updated IOCIdentifier and ClientIOCRegister to include the new ZustandCounterService.
  - Enhanced the Home page to incorporate the ZustandCounterCard for user interaction.

  These changes aim to improve state management and user experience in the Next.js example.

#### ♻️ Refactors

- **i18n:** convert I18nServiceInterface from abstract class to interface ([982c036](https://github.com/qlover/fe-base/commit/982c036290b005c87fa682c5afe4f847ab4d7574)) ([#604](https://github.com/qlover/fe-base/pull/604))
  - Changed I18nServiceInterface from an abstract class to an interface, simplifying its structure and enhancing type safety.
  - Updated I18nService to implement the new interface, ensuring compatibility with the updated design.
  - Refactored UserService to utilize the new getUIStore method for improved store access.
  - Enhanced useStore and useSliceStoreAdapter hooks for better integration with SliceStoreAdapter.

  These changes aim to streamline the internationalization service architecture and improve overall code maintainability.

- **ZustandCounterService:** format imports and clean up interface file ([ed7a5b4](https://github.com/qlover/fe-base/commit/ed7a5b49bb7c5c8640c5b661edf5c7feccb8ef18)) ([#604](https://github.com/qlover/fe-base/pull/604))
  - Reformatted import statements in ZustandCounterServiceInterface.ts for improved readability.
  - Removed unnecessary blank lines to enhance code cleanliness.

  These changes aim to improve the overall structure and maintainability of the ZustandCounterService interface file.

## 0.0.4

### Patch Changes

#### ✨ Features

- **next-seed:** update dependencies and enhance .env.template ([eeac3ca](https://github.com/qlover/fe-base/commit/eeac3ca951e4b62dcde307bdb41608378d0cf4da)) ([#601](https://github.com/qlover/fe-base/pull/601))
  - Added new dependencies: `https-proxy-agent` and `node-fetch` to support proxy functionality in server requests.
  - Updated `.env.template` to include additional configuration options for API keys and logging settings, enhancing flexibility for environment setup.
  - Updated `.gitignore` to exclude `.env` and `.cache` files for better security and cleanliness.
  - Introduced a new SQL script for creating base tables in Supabase, including login audit logs with user-scoped row-level security.

  These changes aim to improve the server's capability to handle API requests through proxies and streamline the environment configuration process.

- **api:** add API route generation and localization enhancements ([b3bdf51](https://github.com/qlover/fe-base/commit/b3bdf5184db9fd543ac5137de916a4f67e457c4d)) ([#600](https://github.com/qlover/fe-base/pull/600))
  - Introduced a new tool for generating API routes, `generateApiRoutes`, which scans the `src/app/api` directory and creates a TypeScript file with constants for each route.
  - Updated `generateLocales` to accept an optional `identifierDir` parameter, allowing for more flexible localization file generation.
  - Enhanced error handling in both `generateApiRoutes` and `generateLocales` to improve robustness during the build process.

  These changes aim to streamline API route management and localization, improving the overall development experience.

- **server:** enhance logging and server initialization in BootstrapServer ([c55c34a](https://github.com/qlover/fe-base/commit/c55c34aeafceafa83c785212c24660a2833cc8a3)) ([#600](https://github.com/qlover/fe-base/pull/600))
  - Introduced a new `createLogger` function to configure logging with a timestamp formatter and console handler.
  - Updated the `BootstrapServer` constructor to utilize the new logger and server configuration, improving logging capabilities.
  - Removed the `ServerGlobals` file, consolidating logger and configuration management within `BootstrapServer`.
  - Adjusted the `createServerIoc` function to accept logger and configuration parameters, enhancing dependency injection.
  - Updated various API routes to utilize the new server initialization process, ensuring consistent logging and configuration usage.

  These changes aim to improve the maintainability and clarity of server initialization and logging within the application.

- **server:** enhance server configuration and logging capabilities ([e93dba9](https://github.com/qlover/fe-base/commit/e93dba9f9fa3e57d1495d6fb90f7ac04389e02ef)) ([#600](https://github.com/qlover/fe-base/pull/600))
  - Added `uuid` package to manage unique identifiers across the server.
  - Updated `.env.template` to include new logging configuration options: `LOG_LEVEL` and `LOG_PREFIX_TEMPLATE`.
  - Enhanced `AppErrorApi` and `AppSuccessApi` classes to include `requestId` for better error tracking.
  - Introduced `printRequestIdPlugin` to log request IDs during server operations.
  - Refactored `BootstrapServer` to utilize the new logging setup and manage server initialization more effectively.

  These changes aim to improve the server's logging and error handling, enhancing overall maintainability and clarity.

#### 🐞 Bug Fixes

- **UserService:** update email redirect URL to include '/api' path ([e70e0bc](https://github.com/qlover/fe-base/commit/e70e0bc294ff8ac32ddcfe081f28a5eb972242c7)) ([#600](https://github.com/qlover/fe-base/pull/600))
  - Changed the email redirect URL in the UserService from `${this.appConfig.appHost}/callback` to `${this.appConfig.appHost}/api/callback` to ensure correct routing for email callbacks.

  This update aims to improve the functionality of the user service by aligning the redirect path with the API structure.

#### ♻️ Refactors

- **validators:** enhance validation result structure and error handling ([c930dc9](https://github.com/qlover/fe-base/commit/c930dc9a7cb6b5d934af0c71c649561d69e973d2)) ([#601](https://github.com/qlover/fe-base/pull/601))
  - Updated the LoginValidator and RegisterValidator to return a structured validation result, including success status, error path, and message for failed validations.
  - Refactored the ValidatorInterface to support the new ValidationResult type, improving type safety and clarity in validation outcomes.
  - Adjusted the LoginForm and RegisterForm components to handle the new validation result format, ensuring proper error display based on validation feedback.

  These changes aim to improve the robustness and maintainability of the validation logic across the application.

- **server:** remove AppErrorApi and AppSuccessApi, enhance BootstrapServer error handling ([ee4e678](https://github.com/qlover/fe-base/commit/ee4e67863e590fe32a5aa5a4693eca62bd5eb387)) ([#601](https://github.com/qlover/fe-base/pull/601))
  - Deleted the AppErrorApi and AppSuccessApi classes to streamline error handling.
  - Updated BootstrapServer to improve the typing of execNoError and startup methods, enhancing type safety and clarity.
  - Introduced a new taskHandler method for better handling of task results.
  - Removed unused printRequestIdPlugin and adjusted plugin management in BootstrapServer.
  - Added new ApiResultFactory utility for consistent API result creation and error handling.

  These changes aim to simplify the error management structure and improve the overall robustness of the server's API response handling.

- **theme:** update theme variable prefixes from 'fe' to 'fantd' across styles ([8b6f804](https://github.com/qlover/fe-base/commit/8b6f804ab97d9f01744b8cbafca10027570de842)) ([#600](https://github.com/qlover/fe-base/pull/600))
  - Changed the prefix for theme variables in `theme.ts` and various CSS files to 'fantd' for consistency.
  - Updated color variables in `color-scheme-default.css` and `default.css` to include new brand colors and semantic tokens.
  - Adjusted styles in `common.css`, `menu.css`, `pagination.css`, `table.css` to reflect the new variable names, ensuring proper theming across components.

  These changes aim to enhance the clarity and maintainability of the theme configuration.

- **validators:** remove unused validators and clean up UserController ([c7f0bfa](https://github.com/qlover/fe-base/commit/c7f0bfa8b7acd7fc6dc7e087c921ac90c7418b16)) ([#600](https://github.com/qlover/fe-base/pull/600))
  - Deleted the LocalesValidator, PaginationValidator, and SignupVerifyValidator classes as they are no longer needed.
  - Removed the SignupVerifyValidator injection from UserController to streamline the codebase.

  These changes aim to enhance maintainability by eliminating redundant code and improving the clarity of the UserController.

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
