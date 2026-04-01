# @qlover/corekit-bridge

## 3.0.0

### Major Changes

#### ✨ Features

- **store:** integrate Zustand for state management and add SliceStoreAdapter ([025ffce](https://github.com/qlover/fe-base/commit/025ffcef9d9e1eeec427cc2fc2742d142545417e)) ([#604](https://github.com/qlover/fe-base/pull/604))
  - Added Zustand as a dependency for state management, allowing for a more flexible and efficient store implementation.
  - Introduced `SliceStoreAdapter` and `ZustandStoreAdapter` to provide a unified interface for managing state across different store implementations.
  - Updated `StoreInterface` to support new update and reset functionalities, enhancing the overall state management capabilities.
  - Refactored `core/store-state` to accommodate the new adapters and improve code organization.

  These changes aim to enhance the state management architecture, providing better integration and usability for developers.

- **store:** enhance AsyncStore with store interface integration ([129c4d4](https://github.com/qlover/fe-base/commit/129c4d4c4a7fe1aa64711765263c21f6851d1f32)) ([#604](https://github.com/qlover/fe-base/pull/604))
  - Refactored AsyncStore to utilize a new store interface for state updates, improving flexibility and compatibility with existing code.
  - Introduced createAsyncStoreInterface to facilitate the creation of store instances, allowing for better state management.
  - Updated AsyncStoreOptions to include a store property, providing an option to use an existing store instance or create a new one.
  - Adjusted methods in AsyncStore to leverage the new store interface for state retrieval and updates, enhancing overall functionality.

  These changes aim to streamline state management and improve the integration of store interfaces within the AsyncStore implementation.

#### ♻️ Refactors

- **tests:** update MessageSender tests for improved type safety and context handling ([f594dbc](https://github.com/qlover/fe-base/commit/f594dbc0bcb8159b04dbab47bb7e1788edb28718)) ([#604](https://github.com/qlover/fe-base/pull/604))
  - Refactored MessageSender tests to replace generic MessageStoreMsg with specific TestMessage type, enhancing type safety and clarity.
  - Adjusted context handling in tests to ensure plugins can access and modify the correct context structure.
  - Updated assertions and plugin implementations to align with the new type definitions, improving overall test reliability.

  These changes aim to strengthen the test suite for MessageSender by ensuring better type adherence and context integrity.

- **store:** replace updateState with emit in UserService and UserStore tests ([0f62078](https://github.com/qlover/fe-base/commit/0f620789d3851a3b1952063036128c813195c030)) ([#604](https://github.com/qlover/fe-base/pull/604))
  - Updated UserService and UserStore tests to replace the updateState method with emit for state updates, enhancing clarity and consistency in state management.
  - Adjusted related test assertions to reflect the new emit method, ensuring accurate state handling during tests.
  - Refactored AsyncStoreInterface tests to align with the new emit method, improving overall test reliability and maintainability.

  These changes aim to streamline state update processes and improve the robustness of the test suite.

- **docs:** update GatewayService and UserService documentation for state management ([fa40421](https://github.com/qlover/fe-base/commit/fa4042174df006f315e31448edf0738d166570b3)) ([#604](https://github.com/qlover/fe-base/pull/604))
  - Revised GatewayService documentation to clarify the use of AsyncStoreInterface and updated examples to reflect changes in state subscription methods.
  - Modified UserService documentation to replace `updateState` with `emit` for state updates, enhancing consistency in state management practices.
  - Improved clarity in UserStore and ChatMessageStore documentation regarding state handling and subscription patterns.

  These changes aim to enhance the documentation's accuracy and usability for developers working with state management in the gateway and user services.

## 2.2.2

### Patch Changes

## 2.2.1

### Patch Changes

#### ✨ Features

- **tests:** enhance test configurations and logging ([15baa77](https://github.com/qlover/fe-base/commit/15baa77d26ae38a2306e4f212e8501c281fdcedd)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Updated `vite.config.ts` to set the environment to 'development', ensuring React's `act()` is exposed during testing.
  - Modified `index.ts` in the tests directory to enforce the development environment for better compatibility with testing tools.
  - Introduced a mock logger in the `reader.test.ts` to improve logging during tests, enhancing clarity and debugging capabilities.
  - Added console warning suppression in multiple test files to reduce noise in test outputs.

  These changes aim to improve the testing environment and enhance the clarity of test outputs.

#### 📝 Documentation

- **docs:** add BootstrapInterface and SeedConfigInterface documentation ([b488569](https://github.com/qlover/fe-base/commit/b4885693ecb4aa784ac73e2c856ddcdf7f0f1e9b)) ([#592](https://github.com/qlover/fe-base/pull/592))
  - Introduced new documentation files for `BootstrapInterface` and `SeedConfigInterface`, detailing their structure, methods, and parameters.
  - Updated existing documentation for `InjectEnv` and `UserService` to reflect changes in method signatures and types, ensuring consistency and clarity.
  - Enhanced the `UserStore` and `AsyncStore` documentation to include new properties and methods, improving usability for developers.
  - Added new IOC container documentation for `ReflectionIOCContainer` and `SimpleIOCContainer`, outlining their functionalities and usage examples.
  - Introduced `URLParamsStorage` documentation, providing insights into its read-only storage capabilities and examples of usage.

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

## 2.2.0

### Minor Changes

#### ✨ Features

- **react-seed:** Enhance authentication flow with login and register redirects ([3857431](https://github.com/qlover/fe-base/commit/3857431b8991742764857907d7ec94ad84ebddf5)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Added `RedirectToHome` component to redirect users from login and register paths to the home page if they are already logged in.
  - Updated routing configuration to include new routes for login and register, ensuring proper navigation within the application.
  - Improved i18n identifiers for login and register pages, enhancing localization support.
  - Refactored `UserService` to utilize a user credential key stored in cookies for better user session management.

  These changes aim to streamline the authentication process and improve user experience by providing clear navigation paths and enhanced localization.

#### ♻️ Refactors

- **vite:** Consolidate test configuration and enhance user service error handling ([c7fd224](https://github.com/qlover/fe-base/commit/c7fd2248398e627e05b802404bb6c1b8d63f2c99)) ([#581](https://github.com/qlover/fe-base/pull/581))
  - Replaced the `vitest.root.config.ts` with a more structured configuration directly in `vite.config.ts`, improving clarity and organization.
  - Updated the `UserService` class to throw specific `ExecutorError` instances for invalid credentials and users, enhancing error handling.
  - Adjusted return types in the `UserServiceInterface` to ensure consistency and clarity in method signatures.
  - Added workspace dependencies in the `react-seed` example to streamline local development.

  These changes aim to improve the testing framework and error management within the user service, enhancing overall maintainability and developer experience.

## 2.1.1

### Patch Changes

#### 📝 Documentation

- **corekit-bridge:** Enhance UserService and UserServiceInterface with new validation methods ([2a0217e](https://github.com/qlover/fe-base/commit/2a0217e23f9acf06e087fb9552141b84b45766f9)) ([#577](https://github.com/qlover/fe-base/pull/577))
  - Introduced `isCredential` and `isUser` methods in both `UserService` and `UserServiceInterface` to validate credential and user objects, improving type safety and usability.
  - Updated documentation to include examples for the new validation methods, ensuring clarity for developers.
  - Enhanced the `UserService` constructor to require a gateway parameter, streamlining service initialization.
  - Improved type definitions and overall structure of the UserService documentation for better readability.

  These changes aim to strengthen user management capabilities and enhance the developer experience within the corekit-bridge package.

#### ♻️ Refactors

- **corekit-bridge:** Update UserService to enhance configuration and type safety ([7643cf4](https://github.com/qlover/fe-base/commit/7643cf4d1565c91ede6ad80844960fb3e3251273)) ([#577](https://github.com/qlover/fe-base/pull/577))
  - Refactored UserService to accept a gateway and options in the constructor, improving flexibility in service initialization.
  - Introduced a new `pullUserWithLogin` option to control user info retrieval after login.
  - Enhanced type safety by implementing type guards for credential and user validation.
  - Updated tests to reflect changes in UserService initialization and behavior, ensuring comprehensive coverage for new configurations.
  - Improved documentation for UserService methods to clarify usage and expected parameters.

  These changes aim to streamline user management and enhance the overall developer experience within the corekit-bridge package.

- **fe-corekit:** Update RequestPlugin and ResponsePlugin for improved configuration and error handling ([6b8db08](https://github.com/qlover/fe-base/commit/6b8db08ef02a45ede4047dae80dc09ceaca0795a)) ([#577](https://github.com/qlover/fe-base/pull/577))
  - Refactored `RequestPlugin` to replace `mergeConfig` with `createConfig`, enhancing clarity and consistency in configuration handling.
  - Updated tests in `RequestPlugin` to reflect the new `createConfig` method and improved error messages for empty URLs.
  - Enhanced `ResponsePlugin` with a new test for parsing stream responses, ensuring robust handling of different response types.
  - Improved documentation and type safety across the `RequestPlugin` and `ResponsePlugin` implementations.

  These changes aim to streamline request and response handling, enhancing overall developer experience and maintainability within the `fe-corekit` package.

## 2.1.0

### Minor Changes

#### ✨ Features

- **corekit-bridge:** Enhance GatewayService and UserService with config parameter support ([adbcc00](https://github.com/qlover/fe-base/commit/adbcc00438eac7281c715c3a6b66ff5cd777b5a3)) ([#575](https://github.com/qlover/fe-base/pull/575))
  - Introduced a new `config` parameter in `GatewayService` and `UserService` methods to allow passing custom configurations for API operations.
  - Added validation for service names in `GatewayService` constructor to ensure proper error handling.
  - Enhanced tests for `GatewayService` to cover service name retrieval and error handling for invalid names.
  - Expanded `UserService` tests to verify that configuration parameters are correctly passed to login, logout, register, and user info methods.
  - Updated type definitions across interfaces to support the new configuration capabilities, improving type safety and usability.

  These changes aim to provide greater flexibility and control over service operations, enhancing the overall developer experience.

#### 📝 Documentation

- **corekit-bridge:** Add support for configuration parameters in UserService and enhance documentation ([e47f900](https://github.com/qlover/fe-base/commit/e47f9001ebee3a7ad5fc5bf4301228012ceda745)) ([#575](https://github.com/qlover/fe-base/pull/575))
  - Introduced a `config` parameter in `UserService` methods to allow passing custom configurations for login, logout, registration, and user info retrieval.
  - Updated type definitions across `UserService` and related interfaces to reflect the new configuration capabilities, improving type safety.
  - Enhanced documentation with examples demonstrating the usage of the new `config` parameter, ensuring clarity for developers.
  - Added a new script in `package.json` for building documentation, streamlining the documentation generation process.

  These changes aim to provide greater flexibility and control over user service operations, enhancing the overall developer experience.

#### ♻️ Refactors

- **corekit-bridge, fe-corekit:** Update build configurations to target ES5 IIFE module ([4c8a3e8](https://github.com/qlover/fe-base/commit/4c8a3e83c44bff3c26c107040a3690e4dfd9cd58)) ([#575](https://github.com/qlover/fe-base/pull/575))
  - Modified `tsup.config.ts` files in both `corekit-bridge` and `fe-corekit` to include `target: 'es5'`, ensuring compatibility with older JavaScript environments.
  - Updated `tsconfig.json` in `fe-corekit` to remove the obsolete `target` setting, streamlining TypeScript configuration.
  - Enhanced output directory settings in build configurations for consistency across packages.

  These changes aim to improve compatibility and maintainability of the build process across the project.

## 2.0.0

### Major Changes

#### ♻️ Refactors

- **scetipts-context:** scripts context with ExecutorInterface ([86a1232](https://github.com/qlover/fe-base/commit/86a1232c1afaa5604c4571f894b02c0c7cc55b98)) ([#565](https://github.com/qlover/fe-base/pull/565))
  - refactor(fe-corekit): Enhance type safety and context management in executor interfaces
  * Updated `ExecutorContextInterface` and related classes to support generic return types, improving type safety across executor plugins.
  * Refactored `LifecycleExecutor` and `LifecycleSyncExecutor` to utilize enhanced context management, allowing for better handling of task execution and plugin interactions.
  * Introduced new utility functions for plugin hook execution, ensuring consistent behavior and improved maintainability.
  * Enhanced test coverage for executor functionality, ensuring robust type checks and error handling.

  These changes aim to provide a more flexible and type-safe execution framework for plugins, enhancing overall developer experience and code quality.
  - feat(scripts-context): Update dependencies and enhance ColorFormatter tests
  * Replaced `@types/lodash` with `@types/lodash-es` and added `lodash-es` as a dependency for better ES module support.
  * Updated `@qlover/fe-corekit` dependency to use workspace reference for improved package management.
  * Expanded test coverage for `ColorFormatter` to handle various argument types, including empty arrays, objects, null, undefined, booleans, numbers, and mixed types.
  * Added tests for handling long messages, special characters, and unicode characters in logging.
  * Enhanced `ConfigSearch` tests to cover edge cases and configuration merging scenarios.
  * Introduced new utility functions for initializing options and managing script context defaults, improving overall maintainability and type safety.

  These changes aim to improve the robustness of the logging and configuration management features within the scripts context.
  - feat(dependencies): Replace lodash with lodash-es and update related types
  * Replaced `lodash` with `lodash-es` in multiple packages to enhance ES module support.
  * Updated `@types/lodash` to `@types/lodash-es` for improved type definitions.
  * Refactored code to utilize named imports from `lodash-es` for better tree-shaking and performance.
  * Adjusted executor implementations in `Code2MDTask` and `ReleaseTask` to use `LifecycleExecutor` for improved context management.

  These changes aim to modernize the codebase and improve compatibility with ES module standards.

  ***

  Co-authored-by: QRJ <github-actions[bot]@users.noreply.github.com>

## 1.10.1

### Patch Changes

#### ♻️ Refactors

- **corekit-bridge:** Add sideEffects flag to package.json and update tsup.config.ts for better tree-shaking ([b821865](https://github.com/qlover/fe-base/commit/b82186597e28444beba818adee1aa5332d1e59f5)) ([#562](https://github.com/qlover/fe-base/pull/562))
  - Added "sideEffects": false to package.json to optimize tree-shaking.
  - Updated tsup.config.ts to set bundle: false for the main entry, allowing only re-exports and improving tree-shaking efficiency.
  - Enhanced comments in tsup.config.ts for clarity on bundling behavior and external dependencies.

## 1.10.0

### Minor Changes

#### 📝 Documentation

- Introduce new modules and enhance CLI functionality ([b27fba0](https://github.com/qlover/fe-base/commit/b27fba01d2227d7b3bde9951f5c7005b5572c657)) ([#560](https://github.com/qlover/fe-base/pull/560))
  - Added `FeReleaseCLI`, `FeReleaseDefaults`, and `FeRelease` modules to automate frontend package release processes, including version management and changelog generation.
  - Implemented command-line interface options for `fe-release`, allowing users to customize release behavior with advanced options.
  - Introduced type definitions in `FeReleaseTypes` for better TypeScript support across the framework.
  - Enhanced documentation with examples for new features, ensuring clarity and usability for developers.

  These changes aim to streamline the release process and improve developer experience when managing frontend packages.

#### ♻️ Refactors

- Add @override annotations to methods across multiple classes ([7271c80](https://github.com/qlover/fe-base/commit/7271c80bb7c5e4daeeed5af35c01300479d11717)) ([#560](https://github.com/qlover/fe-base/pull/560))
  - Introduced `@override` JSDoc comments in the `InjectEnv`, `InjectGlobal`, `InjectIOC`, `UserService`, `ChatMessageStore`, and `AsyncStore` classes to enhance clarity and enforce best practices for method overrides.
  - Updated ESLint rules to ensure proper detection of these annotations, improving code quality and maintainability.

  These changes aim to standardize method override documentation and improve TypeScript support in the codebase.

## 1.9.0

### Minor Changes

#### ✨ Features

- **tests:** add type safety tests for UserService ([e7104fa](https://github.com/qlover/fe-base/commit/e7104faf826d57175c296eada7a33f587169be8c)) ([#558](https://github.com/qlover/fe-base/pull/558))
  - Introduced comprehensive type safety tests for the UserService, verifying generic type constraints, method return types, and TypeScript type inference.
  - Enhanced the UserService implementation by refining the UserServiceConfig interface to improve type safety with UserStoreInterface.
  - Updated test cases to ensure both runtime behavior and type correctness across various service methods, enhancing overall code reliability.

- **tests:** enhance type safety and configuration for ColorFormatter and RequestAdapter ([3651c6f](https://github.com/qlover/fe-base/commit/3651c6fc1a6ad4ceaca8c97d6ffbb1e8961d707f)) ([#558](https://github.com/qlover/fe-base/pull/558))
  - Updated `ColorFormatter` to utilize generic types for improved type safety in logging events.
  - Modified `tsconfig.test.json` to include additional paths for test files, enhancing test coverage.
  - Added new tests for `RequestAdapterFetch` and `RequestAdapterAxios` to verify the functionality of the `setConfig` method, ensuring it correctly updates and merges configuration properties.
  - Removed outdated test file for `RequestAdapterSetConfig`, streamlining the test suite.

  These changes aim to improve type safety and ensure robust testing for logging and request adapter configurations.

## 1.8.4

### Patch Changes

#### ♻️ Refactors

- **eslint:** Update ESLint configuration and refactor imports across multiple files ([3498985](https://github.com/qlover/fe-base/commit/34989859443b2df9357869ac0d5720783b90d1b8)) ([#556](https://github.com/qlover/fe-base/pull/556))
  - Modified `eslint.config.js` to add a rule for detecting duplicate imports.
  - Refactored import statements in various TypeScript files for improved clarity and organization.
  - Updated `Copyer.ts` to streamline file system operations by consolidating `fs` imports.
  - Enhanced type imports in several files to improve type safety and maintainability.

  These changes aim to enhance code quality and maintainability across the project.

## 1.8.3

### Patch Changes

#### ♻️ Refactors

- **logger:** Enhance logging system with generic context support ([f5af499](https://github.com/qlover/fe-base/commit/f5af499c5c4a9955f36861978448ec497dc6fcae)) ([#553](https://github.com/qlover/fe-base/pull/553))
  - Updated `ColorFormatter`, `Logger`, and `HandlerInterface` to utilize generic types for improved type safety and flexibility.
  - Modified `LogEvent` and related interfaces to support context-specific logging, allowing for better handling of diverse log data.
  - Refactored test implementations to align with the new generic structure, ensuring consistency and clarity in logging tests.

## 1.8.1

### Patch Changes

#### ♻️ Refactors

- Update TypeScript class accessibility and improve code clarity ([62f6203](https://github.com/qlover/fe-base/commit/62f620399d79530273fb33e45cb7469e2f241461)) ([#551](https://github.com/qlover/fe-base/pull/551))
  - Explicitly defined 'public' accessibility for class properties and methods across multiple TypeScript files to enhance clarity and maintainability.
  - Refactored tests to ensure consistent accessibility modifiers, improving overall code readability.
  - Updated ESLint configuration to enforce best practices in TypeScript coding standards.

  These changes aim to streamline code quality and maintainability in the project.

## 1.8.0

### Minor Changes

#### ✨ Features

- **store-state:** Add AsyncStore and PersistentStore test suites ([ceee5d9](https://github.com/qlover/fe-base/commit/ceee5d97d5dd602b264650028a9c1f0a39dcf8f7)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Introduced comprehensive test suites for AsyncStore and PersistentStore, covering state management, error handling, and integration scenarios.
  - Implemented MockStorage for simulating storage operations during tests, ensuring robust validation of store functionalities.
  - Enhanced AsyncStore with status tracking and lifecycle management, providing a complete interface for asynchronous operations.
  - Updated index exports to include new interfaces and implementations, improving module organization and accessibility.
  - Removed obsolete AsyncStateInterface to streamline the codebase and improve clarity in state management.

- **URLStorage:** Implement URLStorage class and test suite ([80c8518](https://github.com/qlover/fe-base/commit/80c85186f722904f3f90458461fae539dc94c6a2)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Introduced URLStorage class for managing URL query parameters with flexible key matching and caching capabilities.
  - Added comprehensive test suite for URLStorage, covering constructor behavior, key retrieval, value retrieval, and error handling.
  - Updated core storage index to export URLStorage, enhancing module accessibility.

- **gateway-auth:** Introduce gateway authentication module with services and utilities ([19977c6](https://github.com/qlover/fe-base/commit/19977c6db340f76de46068e3b2a7b317d6faba6e)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Added a new gateway authentication module, including BaseService, GatewayService, UserService, and GatewayExecutor for managing user authentication and related operations.
  - Implemented comprehensive test suites for each service, covering various scenarios such as login, registration, and user information retrieval.
  - Enhanced AsyncStore to support user authentication state management, including credential persistence and error handling.
  - Updated package.json to include new entry points for the gateway-auth module, improving accessibility and organization.
  - Introduced utility functions for creating user stores and managing action hooks, enhancing modularity and reusability.

- **persistent-store:** Implement PersistentStore and associated test suite ([257404e](https://github.com/qlover/fe-base/commit/257404e143b3a0e099e02ad805e59fa84681975f)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Introduced PersistentStore class for managing state persistence with flexible storage backends, enhancing state management capabilities.
  - Added comprehensive test suite for PersistentStore, covering state restoration, persistence, and error handling scenarios.
  - Updated AsyncStore to extend from PersistentStore, ensuring consistent behavior across synchronous and asynchronous storage operations.
  - Refactored existing interfaces and implementations to improve clarity and maintainability, including updates to the PersistentStoreInterface.
  - Enhanced documentation to reflect the new structure and functionality of the persistent storage system.

- **gateway-auth:** Add UserStore test suite and enhance UserService with credential management ([d9cac86](https://github.com/qlover/fe-base/commit/d9cac86eb741907842c773423517f7f1a21eaaa1)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Introduced a comprehensive test suite for UserStore, covering various scenarios including persistence, restoration, and error handling.
  - Enhanced UserService to include a method for retrieving the current credential, improving accessibility to authentication data.
  - Updated UserStore and UserService interfaces to reflect changes in credential management and persistence behavior.
  - Improved documentation for UserStore and UserService, clarifying persistence options and usage examples.

- **api-mock-plugin:** Add comprehensive test suite for ApiMockPlugin ([03abe4f](https://github.com/qlover/fe-base/commit/03abe4fc4de9ab6956a64b3ba175d3a7c5def8c9)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Introduced a new test suite for ApiMockPlugin, covering various scenarios including plugin initialization, mock data matching, and response structure.
  - Enhanced ApiMockPlugin to support dynamic mock data generation through functions, improving flexibility in testing.
  - Updated documentation within the code to clarify the usage of mock data configurations and the plugin's behavior.
  - Implemented logging for mock requests to aid in debugging and validation of mock responses.

#### 📝 Documentation

- **corekit-bridge:** Update default values in multiple documentation files ([c205143](https://github.com/qlover/fe-base/commit/c20514312ed562d370932e195c9f7486c73ce2e5)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Changed default values from `...` to `{}` in various documentation files, including ColorFormatter, ChatMessage, and AsyncStore, for clarity and accuracy.
  - Added new documentation for several gateway-auth and store-state modules, enhancing user understanding of their functionalities and configurations.
  - Updated examples and descriptions to reflect the latest changes in default configurations and improve overall documentation quality.

- Update type annotations and module descriptions across multiple documentation files ([d0a5535](https://github.com/qlover/fe-base/commit/d0a5535aceffeb9b03b2fc8d578116fe55ab85b5)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Added type annotations for various modules and interfaces in the documentation, enhancing clarity and understanding of their functionalities.
  - Updated descriptions for modules such as `FeCode2Markdown`, `corekit-bridge`, and `user-auth`, ensuring accurate representation of their purposes.
  - Improved overall documentation quality by standardizing type definitions and enhancing the user experience with clearer explanations.

#### ♻️ Refactors

- **message-sender:** Rename MessageSenderContext to MessageSenderContextOptions ([95a60dd](https://github.com/qlover/fe-base/commit/95a60ddf333c1990326a22d9aaa27156c4a91602)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Updated all instances of MessageSenderContext to MessageSenderContextOptions across test files and implementation files for consistency.
  - Adjusted type definitions in MessageSender and related plugins to reflect the new naming convention, enhancing clarity and maintainability.
  - Ensured that all tests are updated accordingly to prevent any breaking changes.

- **message-sender:** Enhance ChatSenderStrategy with generic type support ([738adcc](https://github.com/qlover/fe-base/commit/738adccc035bbd4c2e36f995829218be4fbdb2cf)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Updated ChatSenderStrategy to extend SenderStrategyPlugin with a generic type parameter for ChatMessage, improving type safety and flexibility in message handling.
  - Adjusted related documentation to reflect the changes in the class definition.

- **tests:** Update import paths and refactor mock classes for consistency ([168a431](https://github.com/qlover/fe-base/commit/168a43162f09caddebe9e9e895f56eec681dbe40)) ([#545](https://github.com/qlover/fe-base/pull/545))
  - Changed import paths for PersistentStore and RequestState to align with new structure.
  - Refactored mock classes in UserAuthStore tests to use KeyStorage instead of KeyStorageInterface, enhancing clarity and consistency across test files.

## 1.7.0

### Minor Changes

#### ✨ Features

- **corekit-bridge:** implement chat message handling and store management ([18e9466](https://github.com/qlover/fe-base/commit/18e9466e80c8600eda7c174962f0d99ea992d80c)) ([#537](https://github.com/qlover/fe-base/pull/537))
  - Added new classes and interfaces for chat message handling, including ChatMessage, ChatMessageStore, and ChatSenderStrategy, enhancing the messaging capabilities within the application.
  - Introduced comprehensive test suites for message sending, storage, and strategy management, ensuring robust functionality and reliability.
  - Updated pnpm-lock.yaml to include '@qlover/logger' as a dependency for improved logging capabilities in message operations.
  - Enhanced documentation for new modules and interfaces, providing clear guidance on usage and integration.

  These changes aim to improve the chat messaging framework, enabling better message management and user interaction within the application.

#### ♻️ Refactors

- **corekit-bridge:** add message-sender export to core index ([126bcab](https://github.com/qlover/fe-base/commit/126bcab04c59f5479731b5e770bfd7c5976e86b5)) ([#537](https://github.com/qlover/fe-base/pull/537))
  - Included the message-sender module in the core index.ts file, enhancing the messaging capabilities within the corekit-bridge package.
  - This addition aims to streamline access to message-sending functionalities, supporting better integration across the application.

- **corekit-bridge:** update sendMessage return type in MessageGetwayInterface ([63a7ba6](https://github.com/qlover/fe-base/commit/63a7ba616426a1d01d063a5e1864816ec49d7627)) ([#537](https://github.com/qlover/fe-base/pull/537))
  - Changed the return type of the sendMessage method from Promise<M> to Promise<unknown | M>, enhancing type flexibility and accommodating various message types.
  - This modification aims to improve type safety and usability within the messaging framework.

## 1.6.6

### Patch Changes

## 1.6.5

### Patch Changes

#### ✨ Features

- **corekit-bridge:** add RequestState class and related interfaces for async state management ([0785af0](https://github.com/qlover/fe-base/commit/0785af0f3d81437817cfaf452b3642a32a73ecc9)) ([#525](https://github.com/qlover/fe-base/pull/525))
  - Introduced RequestState class implementing AsyncStateInterface to track the lifecycle of asynchronous requests, including loading states, results, errors, and timing.
  - Added LifecycleInterface, ResourceInterface, ResourceServiceInterface, and ResourcesStore to manage resource operations and lifecycle events.
  - Created AsyncStateInterface for tracking the state of async operations, enhancing error handling and performance monitoring.
  - Implemented comprehensive resource query and state management capabilities, improving overall resource handling in the application.

  These changes aim to provide a robust framework for managing asynchronous operations and resource states, facilitating better performance and error handling.

#### 📝 Documentation

- **corekit-bridge:** enhance documentation for resource and stream management ([0adc2d4](https://github.com/qlover/fe-base/commit/0adc2d4abc63aebdad8ff485579780082815f608)) ([#525](https://github.com/qlover/fe-base/pull/525))
  - Added comprehensive documentation for new interfaces and classes including LifecycleInterface, ResourceInterface, ResourceServiceInterface, and ResourcesStore to improve resource management and lifecycle event handling.
  - Introduced detailed documentation for stream processing with LineStreamProcessor, SSEStreamProcessor, and ResponseStream, outlining their functionalities and usage examples.
  - Created AsyncStateInterface and RequestState documentation to facilitate better understanding of asynchronous state management.
  - Enhanced UIBridgeInterface and notification interfaces to support better integration between business logic and UI components.

  These updates aim to provide clear guidance and examples for developers, improving the usability and maintainability of the corekit-bridge module.

## 1.6.4

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

#### 🐞 Bug Fixes

- **tests:** update ESLint rule reference in storeInterface.test.ts ([da53d7b](https://github.com/qlover/fe-base/commit/da53d7b1ce9c697a4727869a22b51e225581c4c4)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Changed the ESLint rule reference from `fe-dev/ts-class-method-return` to `@qlover-eslint/ts-class-method-return` to align with the recent ESLint configuration updates. This ensures consistent linting behavior across the codebase.

## 1.6.3

### Patch Changes

#### 🐞 Bug Fixes

- **tests:** update ESLint rule reference in storeInterface.test.ts ([da53d7b](https://github.com/qlover/fe-base/commit/da53d7b1ce9c697a4727869a22b51e225581c4c4)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Changed the ESLint rule reference from `fe-dev/ts-class-method-return` to `@qlover-eslint/ts-class-method-return` to align with the recent ESLint configuration updates. This ensures consistent linting behavior across the codebase.

## 1.6.1

### Patch Changes

#### 🐞 Bug Fixes

- **tests:** update ESLint rule reference in storeInterface.test.ts ([da53d7b](https://github.com/qlover/fe-base/commit/da53d7b1ce9c697a4727869a22b51e225581c4c4)) ([#489](https://github.com/qlover/fe-base/pull/489))
  - Changed the ESLint rule reference from `fe-dev/ts-class-method-return` to `@qlover-eslint/ts-class-method-return` to align with the recent ESLint configuration updates. This ensures consistent linting behavior across the codebase.

## 1.6.0

### Minor Changes

#### ✨ Features

- **corekit-bridge:** add documentation generation script and enhance module documentation ([d413857](https://github.com/qlover/fe-base/commit/d413857cbfc87a887c6b90329e053fbf57ab2830)) ([#483](https://github.com/qlover/fe-base/pull/483))
  - Introduced a new build script `build:docs` in package.json to generate documentation from source files using `fe-code2md`.
  - Updated project.json to include a new build target for documentation generation, improving the build process.
  - Expanded the documentation in `index.ts` to provide comprehensive details about the corekit-bridge module, including installation instructions, main features, and usage examples.

  These changes aim to improve the usability and clarity of the corekit-bridge library for developers.

## 1.5.0

### Minor Changes

#### ✨ Features

- **response-stream:** add comprehensive test suites for stream processing components ([76cbd7e](https://github.com/qlover/fe-base/commit/76cbd7ee7185cfe74bb21e8bedc0b77332314433)) ([#484](https://github.com/qlover/fe-base/pull/484))
  - Introduced test files for LineStreamProcessor, ResponseStream, SSEStreamProcessor, StreamEvent, and their respective functionalities.
  - Implemented tests covering constructor behavior, chunk processing, final data handling, edge cases, and integration scenarios.
  - Enhanced overall test coverage to ensure robust validation of stream processing logic and error handling.

  These changes aim to improve the reliability and maintainability of the response-stream module.

## 1.4.0

### Minor Changes

#### ✨ Features

- **corekit-bridge:** enhance user authentication state management ([1db2fba](https://github.com/qlover/fe-base/commit/1db2fba323e80b5f8750bb6282fe3be1a428b6ab)) ([#476](https://github.com/qlover/fe-base/pull/476))
  - Added a new test case to verify that the login status is set to SUCCESS when both user info and credential are present.
  - Updated the UserAuthState constructor to automatically set the login status to SUCCESS if user info and credential are provided.
  - Improved documentation in UserAuthStore to clarify the behavior regarding login status.

  These changes aim to improve the reliability of user authentication state handling and enhance test coverage.

  Co-authored-by: QRJ <renjie.qin@brain.im>

## 1.3.4

### Patch Changes

#### 🐞 Bug Fixes

- **corekit-bridge:** streamline environment variable injection in Vite plugin ([bb6e7f1](https://github.com/qlover/fe-base/commit/bb6e7f1f1e608c652265963b50b85cd727cddf8b)) ([#472](https://github.com/qlover/fe-base/pull/472))
  - Removed the injectPkgConfig function and integrated its functionality directly into the plugin's config method for better clarity and maintainability.
  - Enhanced the config method to define environment variables for import.meta.env, improving the injection process.
  - Updated the overall structure of the ViteEnvConfigOptions to simplify the configuration process.

  These changes aim to improve the efficiency and readability of the environment variable management within the corekit-bridge package.

## 1.3.3

### Patch Changes

#### ✨ Features

- **corekit-bridge:** enhance testing and documentation for user authentication ([b557082](https://github.com/qlover/fe-base/commit/b557082f2d8a0989c7a793614fe2f320d7811c95)) ([#466](https://github.com/qlover/fe-base/pull/466))
  - Updated the testing guide to include a comprehensive test strategy and examples for organizing test files and grouping tests effectively.
  - Modified the TypeScript rules to exclude test files from documentation generation, allowing for cleaner documentation output.
  - Introduced a new mock storage implementation for testing user authentication, improving the flexibility and reliability of tests.
  - Enhanced the createStore function to support various store configurations, ensuring better handling of user and credential storage options.

  These changes improve the clarity and usability of the user authentication system within the corekit-bridge package, while also enhancing test coverage and documentation.

#### ♻️ Refactors

- **corekit-bridge:** update UserAuthStore and createState for improved state management ([6ab3aa9](https://github.com/qlover/fe-base/commit/6ab3aa9f2ae48af9bd3f9a469e310351dfc27cec)) ([#466](https://github.com/qlover/fe-base/pull/466))
  - Refactored UserAuthStore to utilize a defaultState option instead of createState, enhancing clarity and flexibility in state initialization.
  - Updated createState function to support both direct state instances and factory functions for state creation, improving usability.
  - Adjusted UserAuthStoreOptions interface to reflect changes in state management options, ensuring type safety and consistency.
  - Enhanced test coverage for UserAuthStore and createState, validating various initialization scenarios and error handling.

  These changes improve the overall architecture and maintainability of the user authentication system within the corekit-bridge package.

## 1.3.2

### Patch Changes

#### ♻️ Refactors

- **corekit-bridge:** state emission in store interfaces to utilize cloneState method for immutability ([4f886c0](https://github.com/qlover/fe-base/commit/4f886c0d7520a95d3381de6d45fbd6ee476b33ae)) ([#464](https://github.com/qlover/fe-base/pull/464))
  - Updated CounterStore, ThemeService, and UserAuthStore to emit state changes using the cloneState method, enhancing immutability and ensuring consistent state management.
  - Adjusted method parameters in UserAuthStore for clarity, changing 'params' to 'userInfo' in the setUserInfo method.

  These changes improve the reliability of state management across the corekit-bridge package.

## 1.3.1

### Patch Changes

#### ✨ Features

- **corekit-bridge:** implement shallow clone utility and add tests for store state management ([fc596f3](https://github.com/qlover/fe-base/commit/fc596f33b91b3f457ab9d4c1e066b897c70c7f25)) ([#462](https://github.com/qlover/fe-base/pull/462))
  - Introduced a `clone` utility for shallow cloning objects, arrays, and special instances (Date, RegExp, Set, Map).
  - Added comprehensive tests for the `clone` function, ensuring correct behavior with various data types and structures.
  - Implemented a `StoreInterface` with state management capabilities, including `resetState` and `cloneState` methods.
  - Developed tests for `StoreInterface` to validate state initialization, cloning, and resetting functionality, ensuring robust state management.

  These changes enhance the corekit-bridge package by providing essential cloning utilities and improving state management through comprehensive testing.

- **corekit-bridge:** enhance UserAuthStore with comprehensive state change tests ([efb673f](https://github.com/qlover/fe-base/commit/efb673f1a05335af6183981cab77d168c63c70c9)) ([#462](https://github.com/qlover/fe-base/pull/462))
  - Added a new test suite for verifying state changes in UserAuthStore, focusing on immutability and consistency during credential and authentication state transitions.
  - Implemented tests for various scenarios including setting credentials, starting authentication, handling success and failure states, and ensuring state consistency across multiple changes.
  - Updated UserAuthStore methods to utilize cloneState for state management, ensuring immutability and proper state transitions.
  - Enhanced StoreInterface with optional source parameter in cloneState method for improved flexibility.

  These changes improve the reliability and robustness of the user authentication state management within the corekit-bridge package.

## 1.3.0

### Minor Changes

#### ✨ Features

- **corekit-bridge:** add comprehensive tests for user authentication state and store ([34f3556](https://github.com/qlover/fe-base/commit/34f35569feae01b8137bb48b9a9ab78478bdc9af)) ([#460](https://github.com/qlover/fe-base/pull/460))
  - Introduced new test files for `createState` and `createStore`, covering various scenarios for user authentication state management.
  - Implemented tests for default state creation, state initialization from storage, and edge cases handling in `createState`.
  - Added tests for user authentication store functionality, including user and credential storage management, error handling, and type safety.
  - Removed outdated `UserAuth.test.ts` to streamline the test suite and improve clarity.

  These changes enhance the testing coverage and reliability of the user authentication system within the corekit-bridge package.

## 1.2.0

### Minor Changes

#### ♻️ Refactors

- **corekit-bridge:** restructure storage and authentication modules ([f03c3fd](https://github.com/qlover/fe-base/commit/f03c3fd6147771689087d37904069d58d3e3704f)) ([#458](https://github.com/qlover/fe-base/pull/458))
  - Removed outdated UserToken and StorageTokenInterface implementations to streamline the storage system.
  - Introduced new CookieStorage and TokenStorage classes, enhancing storage capabilities and flexibility.
  - Added comprehensive test suites for CookieStorage, TokenStorage, and QuickerTime utilities to ensure robust functionality.
  - Updated UserAuthService and UserAuthStore to utilize the new storage implementations, improving authentication flow and state management.
  - Enhanced InjectEnv plugin to prevent overwriting existing configuration values, ensuring better environment variable handling.

  These changes aim to improve the overall architecture and maintainability of the corekit-bridge package.

## 1.1.3

### Patch Changes

#### ✨ Features

- **corekit-bridge:** enhance package configuration and build process ([b4a388c](https://github.com/qlover/fe-base/commit/b4a388c09e914d37daf99e2848c6569d45f98bad)) ([#451](https://github.com/qlover/fe-base/pull/451))
  - Added a "browser" field to `package.json` for improved compatibility in browser environments.
  - Introduced a new `project.json` file to define the build target and streamline the build process using NX.
  - Updated the Rollup configuration to dynamically set the UMD name based on the package name and marked `tailwindcss` and `vite` as external dependencies.

  These changes improve the overall configuration and build orchestration for the corekit-bridge package.

#### ♻️ Refactors

- **theme:** update ThemeService to extend StoreInterface and enhance type definitions ([7e647f6](https://github.com/qlover/fe-base/commit/7e647f6e5979aa6e37e239fcd9039fb3bd52ee2b)) ([#455](https://github.com/qlover/fe-base/pull/455))
  - Refactored ThemeService to extend StoreInterface instead of SliceStore, improving consistency across the codebase.
  - Updated ThemeServiceState to implement StoreStateInterface, enhancing type safety and maintainability.
  - Removed the obsolete StoreInterface file to streamline the project structure.
  - Adjusted import paths in various components and services to reflect the new StoreInterface location, ensuring proper integration.

  These changes aim to improve the overall architecture and type management within the theme service implementation.

## 1.1.2

### Patch Changes

#### ✨ Features

- **corekit-bridge:** refactor user authentication interfaces and enhance token management ([12770ce](https://github.com/qlover/fe-base/commit/12770cec8eee16740823dee0deead528aea1ec3a)) ([#449](https://github.com/qlover/fe-base/pull/449))
  - Updated UserAuthService to use `api` instead of `service` for improved clarity in the authentication flow.
  - Introduced `setUserAuthStore` method in UserAuthApiInterface to manage user authentication storage.
  - Enhanced UserAuthStore with methods to set and get user tokens, improving token management capabilities.
  - Made storage options in UserToken interface optional, allowing for more flexible configurations.
  - Added comprehensive unit tests to validate the new implementations and ensure robust functionality.

  These changes improve the overall structure and maintainability of the user authentication system within the corekit-bridge.

## 1.1.1

### Patch Changes

#### ✨ Features

- **corekit-bridge:** add unit tests for RequestCommonPlugin ([7703647](https://github.com/qlover/fe-base/commit/7703647730153726bbc190132dc2fb4167a46fea)) ([#447](https://github.com/qlover/fe-base/pull/447))
  - Introduced comprehensive unit tests for the RequestCommonPlugin, covering initialization, token handling, header management, request data merging, and response processing.
  - Enhanced test coverage for various scenarios, including edge cases and integration flows, ensuring robust functionality and reliability of the plugin.

  These additions improve the overall test suite for the corekit-bridge, facilitating better maintenance and confidence in the plugin's behavior.

## 1.1.0

### Minor Changes

#### ✨ Features

- **corekit-bridge:** implement CookieStorage and QuickerTime for enhanced storage management ([21051d7](https://github.com/qlover/fe-base/commit/21051d79233af26e4bf0180cd318cfbe02d28d65)) ([#442](https://github.com/qlover/fe-base/pull/442))
  - Introduced CookieStorage class to provide a synchronous API for managing cookies, facilitating token persistence.
  - Added QuickerTime class for simplified time calculations, aiding in token expiration management.
  - Refactored storage-related imports to utilize the new CookieStorage and updated interfaces for better modularity.
  - Updated package dependencies to include js-cookie and its type definitions.

  These enhancements improve the overall storage capabilities and user authentication management within the corekit-bridge.

## 1.0.4

### Patch Changes

#### ✨ Features

- **corekit-bridge:** enhance user authentication and state management ([ebff39c](https://github.com/qlover/fe-base/commit/ebff39c73a4d09fea751f456007ecf88bd97f54b)) ([#438](https://github.com/qlover/fe-base/pull/438))
  - Introduced a comprehensive user authentication system with UserAuth and UserAuthStore implementations.
  - Added interfaces for UserAuth and UserAuthService to standardize authentication operations.
  - Implemented token management and user information retrieval, improving session handling.
  - Created unit tests for UserAuth and UserAuthStore to ensure functionality and reliability.
  - Refactored request handling to remove lodash dependencies, enhancing performance and reducing bundle size.

  This update significantly improves the authentication capabilities and state management within the corekit-bridge, providing a robust foundation for user interactions.

- **corekit-bridge:** refactor user authentication interfaces and enhance state management ([1eb98ee](https://github.com/qlover/fe-base/commit/1eb98eed7f7de9740db237f36bf101855eb20bee)) ([#438](https://github.com/qlover/fe-base/pull/438))
  - Replaced UserAuthServiceInterface with UserAuthApiInterface for improved clarity and consistency in authentication operations.
  - Updated UserAuth and UserAuthStore implementations to utilize the new interfaces, enhancing modularity.
  - Introduced comprehensive state management methods in UserAuthStore for better handling of authentication states.
  - Added unit tests to validate the new UserAuthService and its interactions with the updated interfaces.
  - Enhanced error handling and user feedback mechanisms during authentication processes.

  This update strengthens the user authentication framework, providing a more robust and maintainable solution for managing user sessions and states.

## 1.0.3

### Patch Changes

#### ♻️ Refactors

- **Bootstrap:** enhance configuration and plugin integration ([4256c19](https://github.com/qlover/fe-base/commit/4256c19a044d208d73bafcab173083b727fe0fe4)) ([#409](https://github.com/qlover/fe-base/pull/409))
  - Introduced BootstrapConfig interface to streamline configuration options for IOC, environment, and global plugins.
  - Refactored Bootstrap class to utilize the new configuration structure, improving clarity and maintainability.
  - Updated plugin initialization logic in the initialize method to support dynamic plugin loading based on provided options.
  - Enhanced InjectEnv, InjectIOC, and InjectGlobal plugins to accept configuration objects, improving flexibility and usability.
  - Adjusted method signatures and return types for better type safety and consistency across the Bootstrap class and its plugins.

## 1.0.2

### Patch Changes

#### ♻️ Refactors

- **theme-service:** enhance theme configuration and remove unused tw-generator ([1f11c20](https://github.com/qlover/fe-base/commit/1f11c20b8fda9e4208cd568e544b264b42f1b0c0)) ([#406](https://github.com/qlover/fe-base/pull/406))
  - Introduced a default theme configuration with properties for DOM attribute, default theme, target element, supported themes, storage key, initialization, and store prioritization.
  - Updated ThemeService to utilize the new configuration and improved theme binding logic.
  - Enhanced ThemeStateGetter to conditionally access storage based on the new prioritizeStore property.
  - Removed the unused tw-generator file to streamline the theme service module.

- **theme-service:** add cacheTarget option and improve target element handling ([3a290dc](https://github.com/qlover/fe-base/commit/3a290dc022878858bfc7a9ef0a47c49d05c74702)) ([#406](https://github.com/qlover/fe-base/pull/406))
  - Introduced a new cacheTarget property in the theme configuration to optimize target element retrieval.
  - Enhanced ThemeService to cache the target element for improved performance.
  - Updated bindToTheme method to utilize the new getTarget method for better clarity and efficiency.
  - Removed redundant storage handling from changeTheme method to streamline theme updates.

## 1.0.1

### Patch Changes

#### 🐞 Bug Fixes

- restore types entry and enhance exports in package.json (#392)

  ***

## 1.0.0

### Major Changes

#### ✨ Features

- enhance build configuration and export structure (#390)
  - Updated Rollup configuration to utilize createBaseRollup for streamlined builds.
  - Added new TypeScript configuration files for building and ESM support.
  - Modified package.json to include main and module entries for better module resolution.
  - Expanded exports in core index file to include additional dependencies.
  - Refactored ColorFormatter to improve method visibility and added override annotation.

#### 🐞 Bug Fixes

- remove unnecessary console.info call from test (#389)

#### 📝 Documentation

- update import paths and refactor logger usage in documentation (#390)
  - Changed import paths in README files to remove 'build' directory references for Tailwind, Vite, and TypeScript tools.
  - Refactored logger example to use new Logger and ColorFormatter classes, improving clarity in usage.

## 0.2.1

## 0.2.0

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

## 0.1.0

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

## 0.0.10

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

## 0.0.9

### Patch Changes

#### 🐞 Bug Fixes

- add dry run script for release PRs and update changelog template formatting (#358)

#### ♻️ Refactors

- enhance commit flattening logic and improve tag existence check; clean up Changelog plugin (#358)

- update default log format and add logCommand option for enhanced flexibility in changelog generation (#358)
- Updated dependencies

## 0.0.8

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

## 0.0.4 (2025-04-17)

### Features

- corekit-bridge ([#294](https://github.com/qlover/fe-base/issues/294)) ([e5e2237](https://github.com/qlover/fe-base/commit/e5e2237f8f5cd2294fd4667e08a1714999c52fa1))
- feature yarn to pnpm ([#297](https://github.com/qlover/fe-base/issues/297)) ([c3e13d5](https://github.com/qlover/fe-base/commit/c3e13d509a752267d9be29e7a5ed609d24c309ce))

## 0.0.3 (2025-04-17)

## 0.0.1 (2025-03-25)

### Features

- corekit-bridge ([#294](https://github.com/qlover/fe-base/issues/294)) ([e5e2237](https://github.com/qlover/fe-base/commit/e5e2237f8f5cd2294fd4667e08a1714999c52fa1))
