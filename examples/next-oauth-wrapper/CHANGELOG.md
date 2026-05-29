# examples/next-oauth-wrapper

## 0.0.3

### Patch Changes

#### ✨ Features

- **next-oauth-wrapper:** initialize Next.js OAuth wrapper example ([b634777](https://github.com/qlover/fe-base/commit/b634777fb85e5dc530d24fd77337cf2c91601cf4)) ([#613](https://github.com/qlover/fe-base/pull/613))
  - Added a new example project for a Next.js OAuth wrapper, including essential configuration files and templates.
  - Introduced `.env.template` for environment variable setup, `.gitignore` to exclude sensitive files, and `.prettierignore` for formatting rules.
  - Created ESLint and TypeScript configurations to ensure code quality and consistency.
  - Implemented initial README documentation in both English and Chinese to guide users through setup and usage.
  - Set up Tailwind CSS and PostCSS for styling, along with a basic sitemap configuration.

  These changes provide a foundational structure for developing an OAuth wrapper using Next.js, enhancing the overall developer experience.

- **next-oauth-wrapper:** update dependencies and refactor code structure ([a54cc8d](https://github.com/qlover/fe-base/commit/a54cc8d67609570b6ab5329c1bc08312f9b6769a)) ([#613](https://github.com/qlover/fe-base/pull/613))
  - Updated the version of several dependencies in the `examples/next-oauth-wrapper` project, including `@brain-toolkit/brain-user`, `antd`, and others to ensure compatibility and access to the latest features.
  - Refactored import statements across various files for improved organization and clarity.
  - Adjusted the `package.json` version to `0.0.1` to reflect the initial release of the example project.
  - Enhanced code readability by formatting and restructuring several classes and interfaces.

  These changes aim to improve the maintainability and functionality of the Next.js OAuth wrapper example.

- **next-oauth-wrapper:** replace demo-oauth with OAuthWrapperProvider architecture ([c8feaa4](https://github.com/qlover/fe-base/commit/c8feaa478c29a980d222113fb405ccdc6765e756)) ([#613](https://github.com/qlover/fe-base/pull/613))

  Remove the demo-oauth module and introduce OAuthWrapperProviderInterface with
  BrainUserOAuthProvider as the default implementation. Consolidate OAuth
  adapter, session, repository, and wrapper service wiring; rename demo
  services to OAuthControllerService, OAuthSessionService, and
  OAuthWrapperRepository; delegate OAuth controllers through the provider;
  merge client consent into OAuthWrapperGateway; and refresh proxy session,
  docs, and i18n.

- **next-oauth-wrapper:** enhance documentation and refactor repository structure ([8d83fbb](https://github.com/qlover/fe-base/commit/8d83fbb9c6ef9a67e026a04688168627159d3e3a)) ([#613](https://github.com/qlover/fe-base/pull/613))
  - Updated the `.env.template` to clarify the optional nature of the Supabase service role key and its usage with RLS.
  - Revised the README files in both English and Chinese to improve clarity on setup instructions, including the execution of SQL scripts in Supabase.
  - Refactored the `OAuthWrapperRepository` to extend from `BaseRepo`, streamlining the Supabase client initialization process.
  - Introduced `SupabaseServiceRoleBridge` to encapsulate the Supabase service role client creation, enhancing code organization and maintainability.

  These changes aim to improve the developer experience and provide clearer guidance for using the Next.js OAuth wrapper example.

- **next-oauth-wrapper:** implement CORS support for OAuth endpoints ([7e641a6](https://github.com/qlover/fe-base/commit/7e641a6d66fbb491ed4e0a5300567f7930a617c7)) ([#613](https://github.com/qlover/fe-base/pull/613))
  - Added CORS configuration options in the `.env.template` for allowed origins and methods.
  - Refactored `ServerConfig` to utilize a new `parseCsvEnv` function for parsing CORS-related environment variables.
  - Introduced `apiCors.ts` utility functions to handle CORS preflight requests and response headers.
  - Updated `route.ts` for both the OAuth token and userinfo endpoints to include CORS preflight handling and response headers.

  These changes enhance the security and flexibility of the OAuth wrapper by allowing cross-origin requests.

#### 🐞 Bug Fixes

- **next-oauth-wrapper, next-seed:** update local server ports in configuration files ([9192149](https://github.com/qlover/fe-base/commit/91921496c5dc6c61256a0d67cab500eeec45f6ae)) ([#613](https://github.com/qlover/fe-base/pull/613))
  - Changed default local server ports from 3100 to 3120 in `next-sitemap.config.js`, `package.json`, and `robots.txt` for the next-oauth-wrapper example.
  - Updated local server ports from 3100 to 3110 in `next-sitemap.config.js` and `robots.txt` for the next-seed example.
  - Adjusted API documentation URLs in `route.ts` to reflect the new local server port for the next-seed example.

  These changes ensure consistency in local development environments across examples.

#### ♻️ Refactors

- **next-oauth-wrapper:** update repository structure and dependency injection ([f09049d](https://github.com/qlover/fe-base/commit/f09049d1e17859417e303980d26c6327019f0c54)) ([#613](https://github.com/qlover/fe-base/pull/613))
  - Removed the direct injection of `SupabaseBridge` in `BaseRepo` and transitioned to constructor-based injection for better dependency management.
  - Updated `OAuthWrapperRepository` and `RequestLogsRepository` to utilize the new constructor injection pattern for `SupabaseBridge`.
  - Refactored `SupabaseServiceRoleBridge` to extend from `SupabaseBridge`, enhancing code organization and maintainability.

  These changes aim to improve the clarity and flexibility of the repository structure in the Next.js OAuth wrapper example.

- **next-oauth-wrapper:** clean up and organize OAuth-related code ([c363be5](https://github.com/qlover/fe-base/commit/c363be56850fe6aa97d3e68ac02d9049727c3684)) ([#613](https://github.com/qlover/fe-base/pull/613))
  - Refactored import statements in various files for improved clarity and organization.
  - Updated ESLint configuration to include additional OAuth-related files.
  - Made minor formatting adjustments in several files for consistency.
  - Removed unnecessary trailing whitespace in localization files.

  These changes enhance the maintainability and readability of the OAuth wrapper codebase.
