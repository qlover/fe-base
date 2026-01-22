/**
 * @module Request
 * @description HTTP request management system with adapter pattern and plugin support
 *
 * This module provides a comprehensive HTTP request management system that abstracts
 * different HTTP clients (fetch, axios) through an adapter pattern. It supports
 * request/response interceptors, URL building, header management, and plugin-based
 * request customization.
 *
 * Core functionality:
 * - Request execution: Unified API for HTTP requests
 *   - Adapter pattern for fetch/axios integration
 *   - Type-safe request configuration
 *   - Automatic URL building and parameter encoding
 *   - Header injection and management
 *
 * - Adapter system: Support for multiple HTTP clients
 *   - Fetch API adapter for modern browsers
 *   - Axios adapter for Node.js and legacy browsers
 *   - Custom adapter support
 *   - Consistent response format across adapters
 *
 * - Plugin system: Request/response interceptors
 *   - Request transformation before sending
 *   - Response transformation after receiving
 *   - Error handling and retry logic
 *   - URL and header manipulation
 *
 * - URL management: Flexible URL construction
 *   - Base URL configuration
 *   - Path parameter substitution
 *   - Query parameter encoding
 *   - Absolute/relative URL handling
 *
 * ### Exported Members
 *
 * **Implementations:**
 * - `RequestExecutor`: Main request executor class
 * - `RequestHeaderInjector`: Header injection utility
 * - `RequestPlugin`: Base request plugin
 * - `ResponsePlugin`: Base response plugin
 *
 * **Adapters:**
 * - `RequestAdapterFetch`: Fetch API adapter
 * - `RequestAdapterAxios`: Axios adapter
 *
 * **Interfaces:**
 * - `RequestExecutorInterface`: Request executor interface
 * - `RequestAdapterInterface`: Adapter interface
 * - `HeaderInjectorInterface`: Header injection interface
 * - `UrlBuilderInterface`: URL builder interface
 *
 * **Utilities:**
 * - `SimpleUrlBuilder`: URL construction utility
 * - `appendHeaders`: Header merging utility
 * - `httpMethods`: HTTP method constants
 * - `isAbsoluteUrl`: URL validation utility
 * - `isAsString`: Type checking utility
 * - `isRequestAdapterResponse`: Response type guard
 *
 * ### Basic Usage
 *
 * ```typescript
 * import {
 *   RequestExecutor,
 *   RequestAdapterFetch
 * } from '@qlover/fe-corekit';
 *
 * // Create request executor with fetch adapter
 * const request = new RequestExecutor({
 *   baseURL: 'https://api.example.com',
 *   adapter: new RequestAdapterFetch(),
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * });
 *
 * // GET request
 * const users = await request.get('/users');
 *
 * // POST request
 * const newUser = await request.post('/users', {
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 *
 * // Request with query parameters
 * const filtered = await request.get('/users', {
 *   params: { role: 'admin', active: true }
 * });
 * ```
 *
 * ### Adapter Configuration
 *
 * ```typescript
 * import {
 *   RequestExecutor,
 *   RequestAdapterFetch,
 *   RequestAdapterAxios
 * } from '@qlover/fe-corekit';
 *
 * // Fetch adapter (browser)
 * const fetchRequest = new RequestExecutor({
 *   baseURL: 'https://api.example.com',
 *   adapter: new RequestAdapterFetch({
 *     credentials: 'include',
 *     mode: 'cors'
 *   })
 * });
 *
 * // Axios adapter (Node.js)
 * const axiosRequest = new RequestExecutor({
 *   baseURL: 'https://api.example.com',
 *   adapter: new RequestAdapterAxios({
 *     timeout: 5000,
 *     withCredentials: true
 *   })
 * });
 * ```
 *
 * ### Plugin System
 *
 * ```typescript
 * import {
 *   RequestExecutor,
 *   RequestPlugin,
 *   ResponsePlugin
 * } from '@qlover/fe-corekit';
 *
 * // Request interceptor
 * class AuthPlugin extends RequestPlugin {
 *   async transform(config) {
 *     const token = await getAuthToken();
 *     return {
 *       ...config,
 *       headers: {
 *         ...config.headers,
 *         'Authorization': `Bearer ${token}`
 *       }
 *     };
 *   }
 * }
 *
 * // Response interceptor
 * class LoggerPlugin extends ResponsePlugin {
 *   async transform(response) {
 *     console.log('Response:', response.status, response.data);
 *     return response;
 *   }
 * }
 *
 * const request = new RequestExecutor({
 *   baseURL: 'https://api.example.com',
 *   adapter: new RequestAdapterFetch()
 * });
 *
 * request.use(new AuthPlugin());
 * request.use(new LoggerPlugin());
 * ```
 *
 * ### Header Management
 *
 * ```typescript
 * import {
 *   RequestExecutor,
 *   RequestHeaderInjector
 * } from '@qlover/fe-corekit';
 *
 * // Global headers
 * const request = new RequestExecutor({
 *   baseURL: 'https://api.example.com',
 *   adapter: new RequestAdapterFetch(),
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'Accept': 'application/json'
 *   }
 * });
 *
 * // Per-request headers
 * const data = await request.get('/users', {
 *   headers: {
 *     'X-Custom-Header': 'value'
 *   }
 * });
 *
 * // Header injection
 * const injector = new RequestHeaderInjector({
 *   'Authorization': () => `Bearer ${getToken()}`
 * });
 * ```
 *
 * ### URL Building
 *
 * ```typescript
 * import { SimpleUrlBuilder } from '@qlover/fe-corekit';
 *
 * const builder = new SimpleUrlBuilder('https://api.example.com');
 *
 * // Build URL with path
 * const url1 = builder.build('/users/123');
 * // Result: 'https://api.example.com/users/123'
 *
 * // Build URL with query parameters
 * const url2 = builder.build('/users', {
 *   role: 'admin',
 *   active: true
 * });
 * // Result: 'https://api.example.com/users?role=admin&active=true'
 *
 * // Build URL with path parameters
 * const url3 = builder.build('/users/:id/posts/:postId', {
 *   id: '123',
 *   postId: '456'
 * });
 * // Result: 'https://api.example.com/users/123/posts/456'
 * ```
 *
 * ### Error Handling
 *
 * ```typescript
 * import { RequestExecutor, RequestError } from '@qlover/fe-corekit';
 *
 * const request = new RequestExecutor({
 *   baseURL: 'https://api.example.com',
 *   adapter: new RequestAdapterFetch()
 * });
 *
 * try {
 *   const data = await request.get('/users');
 * } catch (error) {
 *   if (error instanceof RequestError) {
 *     console.error('Request failed:', error.status, error.message);
 *   }
 * }
 * ```
 *
 * ### Advanced Configuration
 *
 * ```typescript
 * import {
 *   RequestExecutor,
 *   RequestAdapterFetch,
 *   SimpleUrlBuilder
 * } from '@qlover/fe-corekit';
 *
 * const request = new RequestExecutor({
 *   baseURL: 'https://api.example.com',
 *   adapter: new RequestAdapterFetch(),
 *   urlBuilder: new SimpleUrlBuilder('https://api.example.com'),
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   timeout: 10000,
 *   retry: {
 *     maxRetries: 3,
 *     delay: 1000
 *   }
 * });
 * ```
 *
 * @see {@link RequestExecutor} for the main request executor
 * @see {@link RequestAdapterFetch} for fetch adapter
 * @see {@link RequestAdapterAxios} for axios adapter
 * @see {@link SimpleUrlBuilder} for URL construction
 */
export * from './adapter';
export * from './impl';
export * from './interface';
export * from './utils/appendHeaders';
export * from './utils/httpMethods';
export * from './utils/isAbsoluteUrl';
export * from './utils/isAsString';
export * from './utils/isRequestAdapterResponse';
export * from './utils/SimpleUrlBuilder';
