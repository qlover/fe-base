# @qlover/create-app

## 0.7.14

### Patch Changes

#### ✨ Features

- **next-app:** integrate SupabaseBridge and update database handling ([5d84568](https://github.com/qlover/fe-base/commit/5d84568849170c998c81b663f0eb5f5f144d8da3)) ([#518](https://github.com/qlover/fe-base/pull/518))
  - Added SupabaseBridge for managing database interactions, implementing the DBBridgeInterface for standardized operations.
  - Updated UserRepository to utilize the new DBBridgeInterface for database operations.
  - Enhanced AppConfig to switch OpenAI configuration to Cerebras.
  - Refactored UserSchema validation to improve type safety with Zod.
  - Introduced new pagination handling in DBBridgeInterface for better data management.

  These changes aim to enhance database management capabilities and improve the overall structure of data handling within the application.

- **next-app:** add HomeI18n for localization and enhance layout components ([390a637](https://github.com/qlover/fe-base/commit/390a6375b458c57ca69517d3e4cf1b938f7b4aea)) ([#518](https://github.com/qlover/fe-base/pull/518))
  - Introduced HomeI18n interface and constants for home page localization, improving internationalization support.
  - Updated index.ts to export HomeI18n for easier access across the application.
  - Refactored page.tsx to integrate homeI18n, enhancing metadata handling for the home page.
  - Improved AdminLayout and BaseHeader components by adding right action buttons for language switching, theme toggling, and logout functionality.
  - Enhanced BaseLayout to conditionally render admin navigation elements, improving user experience in the admin section.

  These changes aim to provide better localization support and enhance the overall structure and usability of the application.

- **next-app:** add admin page localization and SEO components ([d8ca688](https://github.com/qlover/fe-base/commit/d8ca68861c5b2dc80763622b2f37de6ea0cfb437)) ([#518](https://github.com/qlover/fe-base/pull/518))
  - Introduced new localization constants for the admin page, enhancing internationalization support.
  - Created admin18n interface for managing admin page metadata and content.
  - Added ClientSeo component for improved SEO handling on the admin page.
  - Updated admin page structure to utilize new localization and SEO features, enhancing user experience.
  - Refactored localization files to include new keys for admin page content in both English and Chinese.

  These changes aim to improve the admin page's usability and visibility through better localization and SEO practices.

#### 🐞 Bug Fixes

- **create-app:** change build to make ([ea48d14](https://github.com/qlover/fe-base/commit/ea48d140e6f7684efc2e3097046bce82b6448d14)) ([#518](https://github.com/qlover/fe-base/pull/518))

#### ♻️ Refactors

- **next-app:** reorganize imports and migrate PageParams to server ([fb6a47b](https://github.com/qlover/fe-base/commit/fb6a47b5b3a293b7d3e8488690e13b1509e9cfde)) ([#518](https://github.com/qlover/fe-base/pull/518))
  - Updated import paths for PageParams and DBBridgeInterface to reflect new server structure.
  - Removed obsolete migration-related interfaces and classes to streamline the codebase.
  - Introduced new PageParams class in the server directory to handle localization and parameter management.

  These changes aim to enhance code organization and improve the clarity of parameter handling within the application.

- **next-app:** update PaginationInterface imports and add new file ([dfd9866](https://github.com/qlover/fe-base/commit/dfd98660ea51989e604cb7d78d935590473bc05b)) ([#518](https://github.com/qlover/fe-base/pull/518))
  - Changed import paths for PaginationInterface across multiple files to reflect its new location in the server directory.
  - Introduced a new PaginationInterface file in the server port directory, defining the structure for pagination handling.

  These changes aim to improve code organization and maintainability by centralizing pagination-related definitions.

- **next-app:** reorganize imports and update dependencies ([a1049f4](https://github.com/qlover/fe-base/commit/a1049f4bd61b012ca1938c803bdc3a4c43ef0c9a)) ([#518](https://github.com/qlover/fe-base/pull/518))
  - Removed duplicate import statements in generateLocales.ts for cleaner code.
  - Updated useEffect dependency array in UsersPage to include adminUserService, ensuring proper initialization.
  - Cleaned up globals.ts by removing unnecessary comments, enhancing readability.

  These changes aim to improve code organization and maintainability across the application.

## 0.7.13

### Patch Changes

#### 🐞 Bug Fixes

- **generator:** update config path handling in Generator class ([63528b5](https://github.com/qlover/fe-base/commit/63528b52cfca15ccc1db2020369c3ea402da3163)) ([#516](https://github.com/qlover/fe-base/pull/516))
  - Modified the sourcePath in the copyPaths method to use a validated configPath, ensuring that the configuration file exists before proceeding with the copy operation. This change improves error handling and logging for missing configuration files.

  These updates aim to enhance the reliability of the Generator class by preventing operations on non-existent paths.

## 0.7.12

### Patch Changes

#### ♻️ Refactors

- **create-app:** structure and update entry points ([ea404c7](https://github.com/qlover/fe-base/commit/ea404c74fdea09a3122a10e0e0c649cfc5510b97)) ([#514](https://github.com/qlover/fe-base/pull/514))
  - Changed the entry point in tsup.config.ts from 'src/index.ts' to 'src/index.mts' for better module support.
  - Introduced a new CLI interface in src/cli.ts to handle command-line arguments and application logic.
  - Created a new entry file src/index.mts that imports and executes the main function from the CLI, enhancing modularity and clarity.
  - Removed the old main function from src/index.ts, streamlining the codebase and improving maintainability.

  These changes aim to improve the application's structure and facilitate better command-line interactions.

## 0.7.11

### Patch Changes

#### ✨ Features

- **next-app:** enhance admin layout and localization support ([35badca](https://github.com/qlover/fe-base/commit/35badcacbe2aec0af4b91641b89ac621456e2ee7)) ([#512](https://github.com/qlover/fe-base/pull/512))
  - Introduced AdminLayout component for improved admin page structure and navigation.
  - Added PAGE_HEAD_ADMIN_TITLE constant for localization of the admin page title in English and Chinese.
  - Updated localization files to include new keys for the admin page title.
  - Refactored AdminPage component to simplify its structure and enhance readability.
  - Created AdminPageManager for managing admin page state, including sidebar collapse functionality.

  These changes aim to improve the user experience in the admin section by providing a structured layout and better localization support.

- **next-app:** enhance user management and API integration ([2123e76](https://github.com/qlover/fe-base/commit/2123e76cc856c145e8f5a3772e3ac150fb617ed7)) ([#512](https://github.com/qlover/fe-base/pull/512))
  - Added new API constants for user-related error messages, including not authorized and page number invalid.
  - Introduced UserRoleType for better role management in the UserSchema.
  - Created UsersPage component for admin user management, integrating AdminUserService for user initialization.
  - Implemented pagination support in UserRepository and ApiUserService for user data retrieval.
  - Developed AdminAuthPlugin for server-side authentication checks before executing requests.

  These changes aim to improve user management functionality, enhance API interactions, and streamline the admin interface for better usability.

- **next-app:** enhance admin user management and layout features ([e9f8a20](https://github.com/qlover/fe-base/commit/e9f8a203ef1078724e9774d3eb32b5daf0a99a79)) ([#512](https://github.com/qlover/fe-base/pull/512))
  - Updated UsersPage component to include loading state and improved user interface with a spinner.
  - Enhanced BaseLayout to conditionally display an admin button for better navigation.
  - Refactored AdminPageManager to initialize navigation items for the admin layout.
  - Introduced AdminApiRequester for streamlined API requests related to admin functionalities.
  - Updated AdminUserService to utilize new API structure for fetching user data.

  These changes aim to improve the user experience in the admin section by providing better loading indicators and navigation options, while also enhancing the underlying API interactions.

- **next-app:** improve admin user service and component structure ([c9c31d8](https://github.com/qlover/fe-base/commit/c9c31d8a96323057ff33b43fa47c433c07dcfa81)) ([#512](https://github.com/qlover/fe-base/pull/512))
  - Refactored UsersPage component to streamline user initialization logic.
  - Enhanced AdminUserService to manage loading states and error handling during user data fetching.
  - Updated AdminUserApi to return a more structured response for user list requests.
  - Introduced safeFields in UserRepository for better data handling during pagination.
  - Added useMountedClient hook to ensure components render only after client initialization.

  These changes aim to enhance the user management experience in the admin section by improving data handling, error management, and component rendering logic.

- **next-app:** enhance ESLint configuration and user schema validation ([c00639f](https://github.com/qlover/fe-base/commit/c00639f470caf6480e34b41bd912faa76c3356c7)) ([#512](https://github.com/qlover/fe-base/pull/512))
  - Added TypeScript resolver settings to ESLint configuration for improved module resolution.
  - Introduced new import patterns for migrations and configuration in ESLint rules.
  - Refactored UserSchema to utilize Zod for validation, enhancing type safety and data integrity.
  - Updated UsersPage component to integrate the new user schema and improve data handling.
  - Enhanced pagination and table components with new CSS variables for better theming support.

  These changes aim to improve code quality, validation processes, and user interface consistency in the admin section.

- **next-app:** enhance Ant Design theme support with menu styles ([1431f73](https://github.com/qlover/fe-base/commit/1431f73ea98ec97254b553b56dde9896623dbc79)) ([#512](https://github.com/qlover/fe-base/pull/512))
  - Added new CSS variables for Ant Design layout components in common theme files.
  - Introduced menu styles for default, dark, and pink themes, enhancing customization options.
  - Updated AdminLayout component to utilize the new menu styles, improving the overall UI consistency.

  These changes aim to provide a more cohesive theming experience across the application, particularly for the menu component.

- **next-app:** refactor imports and enhance component structure ([61539d3](https://github.com/qlover/fe-base/commit/61539d348595e04a8b8cafa5d8ec7cf25d8cdd32)) ([#512](https://github.com/qlover/fe-base/pull/512))
  - Reorganized imports across various components to improve clarity and maintainability.
  - Updated layout and page components to include necessary configurations for internationalization and theming.
  - Enhanced AdminPage structure by introducing a client component for better separation of concerns.
  - Improved CSS variable formatting in theme files for better readability and consistency.

  These changes aim to streamline the codebase, enhance component organization, and improve the overall theming experience in the application.

#### ♻️ Refactors

- **create-app:** update context imports and enhance type definitions ([be587b4](https://github.com/qlover/fe-base/commit/be587b40d04785309bc34fe41ffb5054c6698818)) ([#512](https://github.com/qlover/fe-base/pull/512))
  - Replaced FeScriptContext with ScriptContext in Generator class for consistency with updated context structure.
  - Modified GeneratorOptions to extend ScriptSharedInterface, improving type safety and integration with the scripts context.

  These changes aim to streamline the codebase and ensure better alignment with the latest context definitions.

## 0.7.10

### Patch Changes

#### ✨ Features

- **next-app:** integrate Supabase for database interactions and enhance configuration ([bd3a557](https://github.com/qlover/fe-base/commit/bd3a557998ae1d77db5a5ff5ea145c067eba0cc8)) ([#510](https://github.com/qlover/fe-base/pull/510))
  - Added Supabase dependencies to package.json for authentication and database management.
  - Introduced DBBridgeInterface for defining database operations and implemented SupabaseBridge for handling database interactions.
  - Updated AppConfig to include Supabase URL and anon key for configuration.
  - Created AdminPage component to demonstrate database bridge usage within the application.

  These changes aim to enhance the application's data management capabilities and streamline interactions with the Supabase backend.

- **next-app:** implement migration system and integrate Supabase for database management ([5732fbf](https://github.com/qlover/fe-base/commit/5732fbfb97960162cddd8d35602d09141e8a805a)) ([#510](https://github.com/qlover/fe-base/pull/510))
  - Added Supabase dependency to package.json for enhanced database interactions.
  - Created migration logs table in a new SQL migration file to track migration history.
  - Developed AdminLayout and AdminMigrationsPage components for managing database migrations.
  - Introduced MigrationExecutor and SupabaseMigration classes to handle migration operations.
  - Updated DBBridgeInterface and added DBMigrationInterface for improved database operation definitions.

  These changes aim to streamline database management and provide a robust migration system within the application.

- **next-app:** enhance user management and database schema ([d2457a8](https://github.com/qlover/fe-base/commit/d2457a82e1c028be3d2da4dd5c163adde19ee778)) ([#510](https://github.com/qlover/fe-base/pull/510))
  - Updated tsconfig.json to include new path mappings for migrations.
  - Added UserSchema interface for defining user attributes in migrations.
  - Created UserRepository and UserService for handling user-related operations, including registration and login.
  - Implemented PasswordEncrypt class for password hashing.
  - Developed API constants for user-related error messages.
  - Refactored SupabaseBridge to support dynamic where conditions in database operations.
  - Introduced new SQL migration for user table creation.

  These changes aim to improve user management functionality and streamline interactions with the database.

- **next-app:** enhance user management and localization support ([f182328](https://github.com/qlover/fe-base/commit/f182328779cf5db569d3d5d43562ca990c59f2de)) ([#510](https://github.com/qlover/fe-base/pull/510))
  - Added `credential_token` field to the `fe_users` table in the SQL migration for improved user authentication.
  - Updated English and Chinese localization files to include new error messages for user-related operations: "User not found" and "User already exists".
  - Refactored the user login API to utilize a new error handling structure, improving response consistency and clarity.
  - Introduced `AppApiResponse` interface for standardized API response handling across the application.

  These changes aim to strengthen user management features and enhance localization for better user experience.

- **next-app:** enhance user service and error handling ([a7627d7](https://github.com/qlover/fe-base/commit/a7627d7c9a73f584b6940f4cd406b4ba55168474)) ([#510](https://github.com/qlover/fe-base/pull/510))
  - Refactored user service to utilize new `UserServiceApi` for improved API interactions.
  - Introduced `AppErrorApi` and `AppSuccessApi` classes for standardized API response handling.
  - Added `DialogErrorPlugin` for enhanced error dialog management in the application.
  - Updated localization files to include new error messages and response handling keys.
  - Improved logging in the `LoginForm` component by integrating a logger service.

  These changes aim to strengthen user management features, improve error handling, and enhance localization support across the application.

- **next-app:** enhance login validation and localization support ([506c42c](https://github.com/qlover/fe-base/commit/506c42c0bc3b4b75b4af168524bfece09eaddfd9)) ([#510](https://github.com/qlover/fe-base/pull/510))
  - Added `zod` for improved validation handling in the login process.
  - Introduced `LoginValidator` class to validate email and password inputs with detailed error messages.
  - Updated localization files to reflect changes in validation messages for both English and Chinese.
  - Enhanced `LoginForm` component to utilize the new validation logic, ensuring better user feedback on input errors.

  These changes aim to strengthen the login functionality by providing robust validation and clearer user guidance through localization.

- **next-app:** implement registration page and enhance localization support ([bc67534](https://github.com/qlover/fe-base/commit/bc67534dd7864172fa0d7b3d447e62d8bef62dae)) ([#510](https://github.com/qlover/fe-base/pull/510))
  - Created a new registration page with a corresponding RegisterForm component for user sign-up.
  - Added localization keys for registration page content, keywords, and features in both English and Chinese.
  - Introduced a new i18n interface for the registration page to manage translations effectively.
  - Updated API routes to handle user registration with improved error handling and response structure.
  - Enhanced the RouterService to support navigation to the login page from the registration form.

  These changes aim to provide a seamless user experience for account creation and improve localization for better accessibility.

- **next-app:** implement password encryption and enhance API error handling ([afb9bdb](https://github.com/qlover/fe-base/commit/afb9bdbc7da975bf10e63a2ac8da3308d74456d4)) ([#510](https://github.com/qlover/fe-base/pull/510))
  - Introduced StringEncryptor for encrypting and decrypting passwords in user login and registration processes.
  - Updated API routes for user login and registration to handle encrypted passwords, improving security.
  - Enhanced error handling in the DialogErrorPlugin to prioritize runtime errors.
  - Added RequestEncryptPlugin to automatically encrypt specified properties in API requests.
  - Updated AppConfig to include a key for the StringEncryptor, ensuring secure configuration.

  These changes aim to strengthen user authentication security and improve error management across the application.

- **next-app:** enhance authentication and user management features ([e67dc6d](https://github.com/qlover/fe-base/commit/e67dc6d05f41c329bbebf26653ea5374529c009c)) ([#510](https://github.com/qlover/fe-base/pull/510))
  - Updated .env.template to include JWT_SECRET for token management.
  - Refactored UserSchema to rename reauthentication_token to credential_token for clarity.
  - Introduced ServerAuth class for managing user authentication and token handling.
  - Enhanced UserService to generate and manage user credential tokens during login and registration.
  - Updated API routes for user login and registration to return user data with credential tokens.
  - Improved error handling and response structure in user-related API interactions.

  These changes aim to strengthen user authentication processes and improve overall user management within the application.

- **next-app:** implement logout functionality and enhance user interface ([7765694](https://github.com/qlover/fe-base/commit/776569462d5488c07dfe13cca6f825cf610bd200)) ([#510](https://github.com/qlover/fe-base/pull/510))
  - Added a new API route for user logout, handling session termination and response management.
  - Refactored UserService to implement the logout method, clearing user credentials and updating the repository.
  - Updated AppUserApi to include a logout method for API interaction.
  - Enhanced the LogoutButton component to trigger the logout process with a confirmation dialog.
  - Modified BaseHeader to conditionally display the logout button based on user authentication state.

  These changes aim to improve user experience by providing a seamless logout process and enhancing the overall user interface.

- **next-app:** enhance server authentication with user credential token integration ([bcb8bdc](https://github.com/qlover/fe-base/commit/bcb8bdc846ffa7c1c6f89f1395f9756241b031b4)) ([#510](https://github.com/qlover/fe-base/pull/510))
  - Updated ServerAuth class to include UserCredentialToken for improved token parsing and validation.
  - Refactored hasAuth method to utilize the new user credential token for authentication checks.
  - Minor adjustments in UserCredentialToken file for consistency and clarity.

  These changes aim to strengthen the authentication process by ensuring more reliable token management and validation.

#### ♻️ Refactors

- **bootstraps:** remove unused StringEncryptor import from BootstrapsRegistry.ts ([d7000ea](https://github.com/qlover/fe-base/commit/d7000ea93a5c7cc53a2ccb244424b41ba3ce6fb5)) ([#510](https://github.com/qlover/fe-base/pull/510))
  - Eliminated the import of StringEncryptor as it is no longer utilized in the BootstrapsRegistry file.

  This change aims to clean up the code by removing unnecessary dependencies, improving maintainability.

## 0.7.9

### Patch Changes

#### ✨ Features

- **next-app:** enhance home page internationalization and SEO support ([54d7714](https://github.com/qlover/fe-base/commit/54d77146f26ce132ddd20edace52a1a10eb03149)) ([#508](https://github.com/qlover/fe-base/pull/508))
  - Added PAGE_HOME_KEYWORDS constant to improve SEO with relevant keywords for the home page.
  - Created HomeI18nInterface to manage internationalization for the home page, incorporating keywords and welcome messages.
  - Updated English and Chinese localization files to include new keywords for the home page, enhancing multilingual support.
  - Refactored Home component to utilize the new i18n structure for better localization handling.

  These changes aim to improve the user experience by providing comprehensive localization and SEO enhancements for the home page.

- **next-app:** enhance login components and improve styling consistency ([59b8b85](https://github.com/qlover/fe-base/commit/59b8b85179e78f29f1eca5b8e7e375b6b8c660eb)) ([#508](https://github.com/qlover/fe-base/pull/508))
  - Updated LoginForm component to use new border color variable for improved styling consistency.
  - Simplified LocaleLink components in LoginForm for cleaner code and better readability.
  - Refactored LoginPage to remove unnecessary elements, streamlining the layout.
  - Enhanced CSS variables in page.css for better color management across the application.

  These changes aim to improve the user interface and maintain a consistent design across the login components.

- **next-app:** update scripts, enhance theme support, and improve styling ([aebcdfa](https://github.com/qlover/fe-base/commit/aebcdfaeb5bae706ac96dc410056f3064eb1e8e9)) ([#508](https://github.com/qlover/fe-base/pull/508))
  - Updated package.json scripts to specify ports for development and production environments.
  - Added new CSS variables for hover states and improved theme management in various CSS files.
  - Enhanced the LanguageSwitcher and ThemeSwitcher components to utilize dropdowns for better user experience.
  - Refactored BaseLayout to include a background color for the main content area.

  These changes aim to improve the application's usability and maintainability by enhancing the theme management and user interface components.

## 0.7.8

### Patch Changes

#### ✨ Features

- **next-app:** enhance internationalization support with new localization files and refactor layout structure ([9d73643](https://github.com/qlover/fe-base/commit/9d7364337c18bac196a554b50e2342a51e15154d)) ([#506](https://github.com/qlover/fe-base/pull/506))
  - Added English and Chinese localization files for common application messages to improve internationalization.
  - Refactored layout.tsx to streamline locale handling and message retrieval using the new PageParams class.
  - Removed the obsolete getServerI18n function to simplify the localization setup.
  - Updated LoginPage and related components to utilize the new i18n structure for better translation handling.

  These changes aim to enhance the user experience by providing comprehensive localization support and improving the overall structure of the application.

- **next-app:** enhance IOC integration and introduce new service interfaces ([688ec8e](https://github.com/qlover/fe-base/commit/688ec8e11f94fd92a13257dbdd7ba6359f4a2efc)) ([#506](https://github.com/qlover/fe-base/pull/506))
  - Added UserService interface to IOCIdentifier for improved dependency management.
  - Updated IOCIdentifierMap to include UserService, facilitating better service registration.
  - Refactored LoginForm to utilize the useIOC hook for accessing UserService, enhancing component modularity.
  - Introduced new IOCInterface for defining IOC registration options and container interactions.
  - Created ClientIOC and ServerIOC classes for managing client and server-side IOC functionalities, improving overall architecture.

  These changes aim to streamline dependency injection and enhance the modularity of the application, providing a clearer structure for service interactions.

- **next-app:** refactor layout and enhance parameter handling with BootstrapServer ([3bf30c4](https://github.com/qlover/fe-base/commit/3bf30c4aee2b44a717a67ab26f1a7f36b8dc19e9)) ([#506](https://github.com/qlover/fe-base/pull/506))
  - Updated RootLayout to utilize BootstrapServer for locale and message retrieval, improving internationalization support.
  - Refactored PageParams to implement ParamsHandlerInterface, streamlining parameter management.
  - Introduced BootstrapServer class for better server-side parameter handling and integration with IOC.
  - Created ParamsHandlerInterface to standardize parameter handling across the application.

  These changes aim to enhance the modularity and maintainability of the application while improving the internationalization experience.

- **next-app:** enhance localization and error handling in application ([1b1c7ab](https://github.com/qlover/fe-base/commit/1b1c7ab534657a88d14524ce25432bc4042ec26c)) ([#506](https://github.com/qlover/fe-base/pull/506))
  - Updated generateLocales function to output locale files in a simplified format.
  - Refactored IOCIdentifier to replace Logger type with LoggerInterface for better type safety.
  - Added SERVER_AUTH_ERROR identifier to common error messages for improved error handling.
  - Integrated new error messages into English and Chinese localization files.
  - Removed obsolete common.json files to streamline localization structure.
  - Introduced ServerAuthPlugin and ServerErrorHandler for enhanced server-side authentication and error management.

  These changes aim to improve the application's internationalization capabilities and error handling processes, providing a more robust user experience.

- **next-app:** refactor authentication handling and streamline server integration ([c17bc24](https://github.com/qlover/fe-base/commit/c17bc242067e4a01a50c89832c9060e130ca5291)) ([#506](https://github.com/qlover/fe-base/pull/506))
  - Replaced ServerAuthPlugin with a new ServerAuth class for improved authentication management.
  - Updated Home page to utilize the new ServerAuth class for checking user authentication and redirecting to the login page if necessary.
  - Removed obsolete ServerAuthPlugin file to clean up the codebase.
  - Introduced ServerInterface and ServerAuthInterface for better abstraction and type safety in server interactions.

  These changes aim to enhance the authentication flow and improve the overall structure of the server-side logic in the application.

- **next-app:** enhance routing and dialog handling with new services and components ([944ded9](https://github.com/qlover/fe-base/commit/944ded9c93223d4230d1911552ba17e90a23fd57)) ([#506](https://github.com/qlover/fe-base/pull/506))
  - Introduced RouterService and NavigateBridge for improved navigation management within the application.
  - Added DialogHandler for standardized dialog and notification handling using Ant Design components.
  - Updated IOCIdentifier to include new services and interfaces for better dependency management.
  - Refactored LoginForm to utilize the new RouterService for navigation after login.
  - Enhanced BaseHeader to conditionally display a logout button, improving user experience.
  - Integrated new components and services into the application structure for better modularity and maintainability.

  These changes aim to streamline navigation and dialog interactions, enhancing the overall user experience and application architecture.

- **next-app:** refactor page properties and enhance server integration ([ce49da5](https://github.com/qlover/fe-base/commit/ce49da573ccd621559d3d5cbcea448db93998e66)) ([#506](https://github.com/qlover/fe-base/pull/506))
  - Renamed PageProps to PageParamsProps for clarity in parameter handling.
  - Updated Home and LoginPage components to utilize the new PageParamsProps interface for improved type safety.
  - Enhanced BootstrapServer to include a method for retrieving internationalization interfaces, streamlining localization support.
  - Added error handling in LoginPage to manage missing parameters effectively.

  These changes aim to improve the structure and clarity of page properties while enhancing server-side integration for better localization management.

- **next-app:** refactor server integration and enhance parameter handling ([bd3cd12](https://github.com/qlover/fe-base/commit/bd3cd12cec6f0dc1b2b660e977f5e81cb18951ab)) ([#506](https://github.com/qlover/fe-base/pull/506))
  - Updated layout and page components to utilize the new PageParams class for improved locale and message retrieval.
  - Refactored BootstrapServer to streamline server initialization and removed obsolete methods for better clarity.
  - Enhanced LoginPage to utilize PageParams for internationalization interface retrieval, improving localization support.

  These changes aim to improve the structure and maintainability of server interactions while enhancing the internationalization experience across the application.

#### 🐞 Bug Fixes

- **next-app:** update eslint-plugin dependency to latest version ([2fea1ab](https://github.com/qlover/fe-base/commit/2fea1ab9c94cc52ffe34e82d2980baf99de55aae)) ([#506](https://github.com/qlover/fe-base/pull/506))
  - Changed the @qlover/eslint-plugin dependency in package.json from a local file reference to the latest version. This update ensures that the project uses the most recent features and fixes available in the eslint-plugin package.

  This change aims to improve code quality and maintainability by leveraging the latest enhancements in the eslint-plugin.

#### ♻️ Refactors

- **next-app:** remove obsolete ESLint plugin and streamline localization setup ([d1c81b4](https://github.com/qlover/fe-base/commit/d1c81b4185131bad25f497e0004ebc48001ac9fe)) ([#506](https://github.com/qlover/fe-base/pull/506))
  - Deleted the custom eslint-plugin-testid as it has been replaced by @qlover/eslint-plugin for better testability.
  - Removed the generateLocalesPlugin as its functionality is now integrated into the build process.
  - Added English and Chinese localization files for common application messages to enhance internationalization support.
  - Updated the i18n request configuration to dynamically load the appropriate locale files based on the selected language.

  These changes aim to simplify the localization setup and improve the overall structure of the internationalization implementation.

## 0.7.7

### Patch Changes

#### ✨ Features

- **next-app:** initialize Next.js application template with essential configurations and files ([a6c37ed](https://github.com/qlover/fe-base/commit/a6c37edee416989a72c04a0c3ef77fe296308399)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Added ESLint configuration for Next.js with TypeScript support.
  - Created Next.js configuration file for application settings.
  - Included package.json with scripts and dependencies for React, Next.js, TypeScript, and Tailwind CSS.
  - Set up PostCSS configuration for Tailwind CSS integration.
  - Added README.md for project setup instructions and resources.
  - Configured TypeScript settings in tsconfig.json.
  - Included global CSS styles and layout structure for the application.
  - Created initial page component with example content and links to documentation.
  - Added SVG assets for branding and icons.

  This commit establishes a foundational structure for a new Next.js application, enabling developers to quickly start building their projects.

- **next-app:** enhance Next.js application template with new features and configurations ([1b65acf](https://github.com/qlover/fe-base/commit/1b65acf89cd88c34ac61480435196fe427d760ba)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Added .env.template for environment variable management.
  - Updated package.json scripts to support different environments (development, test, production).
  - Introduced common configuration files for better organization and maintainability.
  - Created new components for login functionality and base header structure.
  - Implemented Inversify container for dependency injection and service management.
  - Enhanced TypeScript configuration with additional path mappings.
  - Added documentation for environment configuration and usage.

  These changes aim to improve the overall structure and functionality of the Next.js application template, facilitating easier development and deployment.

- **next-app:** integrate theme management and enhance styling capabilities ([081e736](https://github.com/qlover/fe-base/commit/081e736c7e126b8e4fb6a38f29a68cd4a28929ac)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Added `next-themes` package for theme management.
  - Introduced `theme.ts` configuration for theme settings.
  - Updated `layout.tsx` to include `ThemeProvider` for theme context.
  - Created multiple CSS files for theme styles, including default, dark, and pink themes.
  - Implemented `ThemeSwitcher` component for user theme selection.
  - Enhanced global styles with new CSS imports for better organization.

  These changes aim to improve the user experience by allowing dynamic theme switching and providing a more organized styling structure.

- **next-app:** add Tailwind CSS configuration and enhance theme management ([22320fd](https://github.com/qlover/fe-base/commit/22320fd81a1565339762fe9d60efe0279caaf7b9)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Introduced `tailwind.config.ts` for Tailwind CSS setup.
  - Updated `theme.ts` to include JSDoc type annotations for better clarity.
  - Removed obsolete `globals.css` in favor of a more modular CSS structure.
  - Modified `layout.tsx` to integrate new theme configurations and CSS imports.
  - Enhanced `LoginPage` with improved styling and layout adjustments.
  - Added `useMountedClient` hook for better theme management in `ThemeSwitcher`.

  These changes aim to streamline the styling process and improve the overall user experience with dynamic theming capabilities.

- **next-app:** enhance application configuration and bootstrap process ([8fc5264](https://github.com/qlover/fe-base/commit/8fc5264d6b4ebe21fe7b8fca1dee075264c43755)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Updated package.json scripts to support localhost and staging environments.
  - Introduced AppConfig class for managing application configuration and environment settings.
  - Enhanced IOC registration with new IocRegisterImpl for improved dependency management.
  - Added BootstrapsApp component to initialize the bootstrap process in the application.
  - Implemented BootstrapsRegistry for managing bootstrap plugins and configurations.
  - Updated BaseHeader to dynamically display the application name from AppConfig.

  These changes aim to improve the application's configuration management and streamline the bootstrap process for better maintainability and flexibility.

- **next-app:** enhance configuration and update dependencies ([76024eb](https://github.com/qlover/fe-base/commit/76024eb9d40122864e6727d46a0e94d2ca4c88d6)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Added environment variable support in next.config.ts for better configuration management.
  - Updated package.json to include new dependencies: @ant-design/nextjs-registry and @ant-design/v5-patch-for-react-19 for improved UI components.
  - Enhanced TypeScript configuration in tsconfig.json with experimental decorators and metadata emission.
  - Modified common.ts to disable localized routes for a more straightforward routing approach.
  - Refactored layout.tsx to integrate AntdRegistry for better theme management and component structure.
  - Updated LoginForm.tsx to utilize IOC for user service instantiation and improved login handling.

  These changes aim to streamline application configuration, enhance UI capabilities, and improve overall code organization.

- **next-app:** implement internationalization support and update routing ([9554899](https://github.com/qlover/fe-base/commit/9554899b1b0da7ae064494f870eb7019be6fc9b8)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Added i18n configuration in a new i18n.ts file to manage localization settings.
  - Updated next.config.ts to include internationalization settings for default locale and supported languages.
  - Modified common.ts to enable localized routes for improved routing experience.
  - Introduced LanguageSwitcher component for dynamic language selection in the UI.
  - Enhanced I18nService to manage language detection and translation functionalities.
  - Updated BaseHeader to include the LanguageSwitcher for user accessibility.

  These changes aim to enhance the application's internationalization capabilities, providing a better user experience for multilingual support.

- **next-app:** refactor theme management and enhance IOC integration ([3006a26](https://github.com/qlover/fe-base/commit/3006a2625870458285e2193c0b7c43c0730059d2)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Updated tsconfig.json to include source files from the src directory for better TypeScript support.
  - Enhanced theme configuration in theme.ts by adding antdTheme settings for improved theme management.
  - Refactored layout.tsx to utilize ComboProvider for streamlined theme and bootstrap context integration.
  - Removed obsolete BootstrapsApp component and replaced it with BootstrapsProvider for better structure.
  - Introduced ComboProvider to encapsulate multiple providers, including AntdThemeProvider and ThemeProvider.
  - Added IOCContext for better dependency injection management across components.
  - Created useIOC hook for easier access to the IOC context in functional components.

  These changes aim to improve the modularity and maintainability of the application by enhancing theme management and dependency injection practices.

- **next-app:** enhance TypeScript configuration and improve IOC integration ([f721e1b](https://github.com/qlover/fe-base/commit/f721e1b9cbfcccc84660d0d7c6973513c26805ac)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Updated tsconfig.json to include .next/types/\*_/_.ts for better type support.
  - Refactored IOC.ts to streamline dependency injection and introduced a new createIOC function for improved IOC management.
  - Modified BootstrapClient to integrate IOC into the bootstrap process.
  - Updated BootstrapsProvider to utilize the createIOC function for better dependency handling.

  These changes aim to enhance TypeScript support and improve the modularity of the IOC system within the application.

- **next-app:** enhance internationalization support and improve IOC integration ([d706df8](https://github.com/qlover/fe-base/commit/d706df89b16a3cc75741ae4baa478f7ed4a3b5f8)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Added I18nService and I18nServiceInterface for better language management.
  - Updated IOCIdentifier to include I18nServiceInterface for dependency injection.
  - Refactored I18nService methods to return promises for asynchronous operations.
  - Modified BootstrapsRegistry and BootstrapClient to support pathname handling.
  - Enhanced LanguageSwitcher component for dynamic language selection.

  These changes aim to improve the application's internationalization capabilities and streamline the integration of the IOC system.

- **next-app:** enhance localization support and streamline locale generation ([4ba5934](https://github.com/qlover/fe-base/commit/4ba5934f02c46dc64edf485c41a4f6d67d0e3d3c)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Integrated locale generation into the build process by adding a generateLocales function.
  - Updated next.config.ts to automatically generate localization files at build start.
  - Created a new plugin to handle locale generation during development and production builds.
  - Added English and Chinese localization files for common application messages.

  These changes aim to improve the application's internationalization capabilities by automating locale management and providing essential translations for better user experience.

- **next-app:** refactor internationalization implementation and enhance localization features ([d95a8bf](https://github.com/qlover/fe-base/commit/d95a8bf52cc70d2b5d0d0bcee894c6455bbe54b7)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Replaced i18next with next-intl for improved localization support.
  - Updated next.config.ts to integrate next-intl plugin for locale management.
  - Refactored i18n configuration to streamline language detection and fallback settings.
  - Enhanced LoginForm and LoginPage components to utilize next-intl for translations.
  - Introduced NextIntlProvider component for better context management of translations.

  These changes aim to simplify the internationalization process and improve the user experience with more efficient localization handling.

- **next-app:** implement middleware and enhance internationalization routing ([08e6d0b](https://github.com/qlover/fe-base/commit/08e6d0be99c508df5242a389211937cc16173026)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Added middleware for locale detection and internationalized routing using next-intl.
  - Refactored layout.tsx to streamline message retrieval and improve locale handling.
  - Updated LoginForm and LoginPage components to utilize lodash for translation functions.
  - Introduced new i18n request configuration for dynamic message loading based on request locale.
  - Created routing.ts to define supported locales and localized pathnames for improved navigation.

  These changes aim to enhance the application's internationalization capabilities and provide a more robust routing experience.

- **next-app:** enhance layout structure and improve localization in login components ([1bfa104](https://github.com/qlover/fe-base/commit/1bfa1045dbe224a2e45b510d3b41d21f3a38c0be)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Integrated BaseHeader into the RootLayout for consistent header display across the application.
  - Updated LoginForm and LoginPage components to utilize next-intl for translation handling, replacing lodash.
  - Refactored layout structure to ensure proper rendering of children components within a flex container.

  These changes aim to improve the user interface and enhance the internationalization support in the login flow.

- **next-app:** add login internationalization interface and refactor login components ([e2fe74a](https://github.com/qlover/fe-base/commit/e2fe74a9639809749df985ca3dc9e97334c43a29)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Introduced `LoginI18nInterface` for managing localization keys specific to the login page.
  - Created `PageI18nInterface` to standardize SEO meta properties across pages.
  - Refactored `LoginForm` and `LoginPage` components to utilize the new i18n structure, enhancing translation handling.
  - Updated `FeatureItem` component to include a data-testid for improved testing capabilities.
  - Implemented `useI18nInterface` hook for streamlined access to localized strings.

  These changes aim to improve the internationalization support for the login flow and enhance the overall structure of the components.

- **next-app:** add initial locale support and layout structure for next-app ([32f60e6](https://github.com/qlover/fe-base/commit/32f60e6d529584bf542a04029a06102393bb3874)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Introduced new layout structure in `layout.tsx` to support internationalization with `NextIntlClientProvider`.
  - Added `favicon.ico` for branding consistency across locales.
  - Created `not-found.tsx` for handling 404 errors with localized messages.
  - Developed `page.tsx` for the home page, featuring a welcoming layout and links to documentation and deployment.
  - Implemented login components including `LoginForm`, `FeatureItem`, and `LoginPage` to facilitate user authentication with localization support.
  - Added `useServerI18n.ts` for server-side translation handling.

  These changes lay the groundwork for a multilingual application experience, enhancing user engagement through localized content.

- **next-app:** enhance internationalization support with new i18n configuration and components ([3706b88](https://github.com/qlover/fe-base/commit/3706b880d6245dd51c4bfdef8e37ba52779d196d)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Added `i18nConfig` for managing locale settings and fallback languages.
  - Introduced `PageI18nInterface` and `LoginI18nInterface` to standardize localization keys for SEO and login components.
  - Created new files for login internationalization, including `loginI18n.ts` and `i18nConfig.ts`.
  - Implemented middleware for locale detection and routing in `middleware.ts`.
  - Updated TypeScript configuration to include new source paths for better type support.

  These changes aim to improve the application's internationalization capabilities and provide a more structured approach to localization.

- **next-app:** enhance ESLint configuration with new plugins and rules ([87775e4](https://github.com/qlover/fe-base/commit/87775e4c1d31788fe83457399c876415af27fe54)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Added eslint-plugin-import and eslint-plugin-unused-imports to improve import management and unused variable detection.
  - Updated ESLint configuration to include recommended settings for import ordering and unused imports.
  - Introduced a new lint:fix script for automatic code formatting and cleanup.

  These changes aim to improve code quality and maintainability by enforcing stricter linting rules.

- **next-app:** add Prettier and ESLint configurations for improved code formatting ([e7f1e72](https://github.com/qlover/fe-base/commit/e7f1e72983759cd18f0cc16c49d5a0f3f95994ea)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Introduced .prettierignore and .prettierrc.js files to define formatting rules and ignore patterns for Prettier.
  - Updated ESLint configuration to include prettier integration, enhancing code quality and consistency.
  - Added new scripts for formatting and linting in package.json to streamline development processes.

  These changes aim to enforce consistent code style and improve maintainability across the project.

- **next-app:** integrate custom ESLint plugin for data-testid enforcement and enhance component testing ([51ebeea](https://github.com/qlover/fe-base/commit/51ebeea8b875179fde6dbe49d64960e8902534fb)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Added a new ESLint plugin to enforce the presence of data-testid attributes on root elements of TSX components, improving testability.
  - Updated ESLint configuration to include the new plugin and enforce its rules.
  - Modified several components to include data-testid attributes, enhancing their compatibility with testing frameworks.
  - Adjusted the order of linting and formatting scripts in package.json for better workflow efficiency.

  These changes aim to improve the testing capabilities of the application by ensuring that components are easily identifiable in tests.

- **next-app:** integrate @qlover/eslint-plugin and update ESLint rules for improved testing ([9bda32f](https://github.com/qlover/fe-base/commit/9bda32fc610753b863557f4f90fa90fe001fb928)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Replaced the custom eslint-plugin-testid with @qlover/eslint-plugin to enhance testability of components.
  - Updated ESLint configuration to include new rules for enforcing data-testid attributes on root elements.
  - Refactored I18nService and BootstrapClient to specify return types for better type safety.

  These changes aim to improve the testing capabilities and maintainability of the application by ensuring consistent ESLint rules and enhancing type definitions.

#### ♻️ Refactors

- **next-app:** update error identifiers and localization keys for consistency ([5ce5894](https://github.com/qlover/fe-base/commit/5ce5894abe73e10b4a42ac6c6b89c5a2d7dcb45e)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Refactored error identifiers and localization keys across various components to use a consistent naming convention with double underscores.
  - Updated keys in common.error.ts, common.ts, and various page identifier files to enhance readability and maintainability.
  - Adjusted localization files to reflect the new key structure, ensuring alignment with the updated identifiers.

  These changes aim to improve the clarity and consistency of localization keys throughout the application.

- **next-app:** streamline IOC integration and enhance I18nService usage ([ee888ce](https://github.com/qlover/fe-base/commit/ee888ceee1f94e4ad6f38cb0c816dc9888011290)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Removed the @injectable() decorator from I18nService for simplified instantiation.
  - Updated IOC creation logic in BootstrapClient to use a singleton pattern for better resource management.
  - Refactored IocRegisterImpl to directly instantiate I18nService, improving clarity in service registration.
  - Adjusted BootstrapsProvider to utilize the new IOC creation method, ensuring consistent IOC management across components.

  These changes aim to enhance the modularity and efficiency of the IOC system while improving the integration of the I18nService.

- **next-app:** reorganize imports and enhance i18n integration ([7f57af0](https://github.com/qlover/fe-base/commit/7f57af00627b3838ab19d3f1b5683b738fc2f12c)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Cleaned up import statements across various components for better readability and consistency.
  - Introduced a new `getServerI18n` function to streamline server-side translation handling.
  - Updated layout and component files to utilize the new i18n structure, improving localization support.
  - Adjusted type imports and ensured proper usage of the `next-intl` library for internationalization.

  These changes aim to enhance the modularity and clarity of the codebase while improving the internationalization capabilities of the application.

- **next-app:** update component exports and ESLint rules for improved consistency ([e7836e5](https://github.com/qlover/fe-base/commit/e7836e5f8c4119fdc52f362c9c18e66e24d3a97f)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Changed default exports to named exports for several components, enhancing import clarity and consistency.
  - Updated ESLint configuration to enforce no default exports, with exceptions for specific files to maintain flexibility.
  - Cleaned up import statements across various files for better readability and adherence to coding standards.

  These changes aim to improve code maintainability and enforce a more consistent coding style across the project.

- **eslint-plugin:** improve rule exports and update ESLint configurations ([c142834](https://github.com/qlover/fe-base/commit/c142834bbabbeec3e5e3f92c6646bc0dc960379a)) ([#504](https://github.com/qlover/fe-base/pull/504))
  - Refactored the export statements for ESLint rules to use named exports for better clarity and consistency.
  - Enhanced the ESLint configuration to improve the handling of unused variables and enforce stricter linting rules.
  - Updated the `require-root-testid` rule to ensure proper formatting and documentation.

  These changes aim to enhance the maintainability and readability of the ESLint plugin while ensuring consistent rule enforcement across the codebase.

## 0.7.6

### Patch Changes

#### ✨ Features

- **ui:** introduce UI bridge interfaces and notification system ([6969561](https://github.com/qlover/fe-base/commit/6969561b3f4603bb51ae7ad5fdca9e539d75209b)) ([#499](https://github.com/qlover/fe-base/pull/499))
  - Added UIBridgeInterface for decoupling business logic from UI components.
  - Implemented UINotificationInterface and UIDialogInterface for standardized notification handling.
  - Created NavigateBridge to facilitate navigation integration with React Router.
  - Updated RouteService to utilize the new UIBridgeInterface for improved dependency management.
  - Introduced useNavigateBridge hook for setting up navigation in React components.
  - Removed obsolete UIDependenciesInterface to streamline the codebase.

- **dialog:** enhance UIDialogInterface and integrate into DialogHandler ([d9d2cdd](https://github.com/qlover/fe-base/commit/d9d2cdd68ff2a68675a2abdd7339c7be0c706724)) ([#499](https://github.com/qlover/fe-base/pull/499))
  - Updated UIDialogInterface to use generic types for notification options, improving flexibility.
  - Integrated UIDialogInterface into DialogHandler for better type safety and consistency in dialog handling.
  - Adjusted RouteService to streamline navigation handling and improve code clarity.
  - Updated package.json to reference local paths for corekit-bridge and fe-corekit for development.

## 0.7.5

### Patch Changes

#### ♻️ Refactors

- **docs:** update references from @qlover/eslint-plugin-fe-dev to @qlover/eslint-plugin ([3c682cd](https://github.com/qlover/fe-base/commit/3c682cdbac17cc0e96166a45934899bad7c565cc)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Replaced all instances of @qlover/eslint-plugin-fe-dev with @qlover/eslint-plugin in documentation and configuration files to reflect the new plugin structure.
  - Ensured consistency across README and documentation files in both English and Chinese.
  - Updated ESLint configuration files to use the new plugin name, enhancing clarity and maintainability.

## 0.7.3

### Patch Changes

#### ♻️ Refactors

- **docs:** update references from @qlover/eslint-plugin-fe-dev to @qlover/eslint-plugin ([3c682cd](https://github.com/qlover/fe-base/commit/3c682cdbac17cc0e96166a45934899bad7c565cc)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Replaced all instances of @qlover/eslint-plugin-fe-dev with @qlover/eslint-plugin in documentation and configuration files to reflect the new plugin structure.
  - Ensured consistency across README and documentation files in both English and Chinese.
  - Updated ESLint configuration files to use the new plugin name, enhancing clarity and maintainability.

## 0.7.1

### Patch Changes

#### ♻️ Refactors

- **docs:** update references from @qlover/eslint-plugin-fe-dev to @qlover/eslint-plugin ([3c682cd](https://github.com/qlover/fe-base/commit/3c682cdbac17cc0e96166a45934899bad7c565cc)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Replaced all instances of @qlover/eslint-plugin-fe-dev with @qlover/eslint-plugin in documentation and configuration files to reflect the new plugin structure.
  - Ensured consistency across README and documentation files in both English and Chinese.
  - Updated ESLint configuration files to use the new plugin name, enhancing clarity and maintainability.

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
