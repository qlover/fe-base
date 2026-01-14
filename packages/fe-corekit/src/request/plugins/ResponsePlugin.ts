import {
  ExecutorContextInterface,
  ExecutorError,
  LifecyclePluginInterface
} from '../../executor/interface';
import {
  RequestAdapterConfig,
  RequestAdapterResponse,
  RequestErrorID
} from '../interface';
import { JSON_RESPONSE_TYPE } from './consts';
import { isFunction } from 'lodash-es';
import { isRequestAdapterResponse } from '../utils/isRequestAdapterResponse';

export type ResponsePluginContext = ExecutorContextInterface<
  ResponsePluginConfig & RequestAdapterConfig,
  unknown
>;

/**
 * Response parser function type
 *
 * @param response - The fetch Response object
 * @returns Parsed response data
 */
export type ResponseParser = (
  response: Response
) => Promise<unknown> | unknown;

/**
 * Response parsers mapping
 *
 * Maps responseType to parser functions.
 * Set to `false` to disable parsing for that type.
 *
 * @example
 * ```typescript
 * const parsers: ResponseParsers = {
 *   json: async (response) => await response.json(),
 *   text: async (response) => await response.text(),
 *   blob: false // Disable blob parsing
 * };
 * ```
 */
export interface ResponseParsers {
  json?: ResponseParser | false;
  text?: ResponseParser | false;
  blob?: ResponseParser | false;
  arraybuffer?: ResponseParser | false;
  formdata?: ResponseParser | false;
  stream?: ResponseParser | false;
  document?: ResponseParser | false;
  [key: string]: ResponseParser | false | undefined;
}

export interface ResponsePluginConfig {
  /**
   * Custom response data parser
   *
   * Allows you to provide a custom function to parse response data.
   * If provided, this will be used instead of the default parser.
   *
   * @param response - The fetch Response object
   * @param responseType - The response type from config
   * @returns Parsed response data
   *
   * @example
   * ```typescript
   * const plugin = new ResponsePlugin({
   *   responseDataParser: async (response, responseType) => {
   *     if (responseType === 'custom') {
   *       return await response.text().then(text => JSON.parse(text));
   *     }
   *     return await response.json();
   *   }
   * });
   * ```
   */
  responseDataParser?: (
    response: Response,
    responseType?: string
  ) => Promise<unknown> | unknown;

  /**
   * Response parsers mapping
   *
   * Allows you to provide custom parsers for specific response types,
   * disable certain parsers by setting them to `false`,
   * or disable all parsing by setting the entire object to `false`.
   *
   * @example
   * ```typescript
   * // Custom parsers
   * const plugin = new ResponsePlugin({
   *   responseParsers: {
   *     json: async (response) => {
   *       const text = await response.text();
   *       return JSON.parse(text);
   *     },
   *     blob: false // Disable blob parsing
   *   }
   * });
   *
   * // Disable all parsing
   * const plugin = new ResponsePlugin({
   *   responseParsers: false
   * });
   * ```
   */
  responseParsers?: Partial<ResponseParsers> | false;
}

/**
 * Plugin for processing HTTP responses
 *
 * This plugin is responsible for parsing response data based on the response type.
 * It handles various response formats including JSON, text, blob, arraybuffer, etc.
 *
 * Features:
 * - Automatic response parsing based on responseType
 * - Response status validation
 * - Custom response parser support
 * - Error handling for parsing failures
 * - Extensible design with protected methods for subclass overrides
 *
 * Extensibility:
 * This class is designed to be extended. Subclasses can override protected methods
 * to customize behavior:
 * - `validateResponseStatus()` - Custom response validation
 * - `extractHeaders()` - Custom header extraction
 * - `buildAdapterResponse()` - Custom response structure
 * - `inferParserFromContentType()` - Custom Content-Type detection
 * - `getFallbackParsers()` - Custom fallback strategy
 * - `processAdapterResponse()` - Custom adapter response processing
 * - `defaultParseResponseData()` - Custom default parsing logic
 *
 * @example Basic usage
 * ```typescript
 * const plugin = new ResponsePlugin();
 * ```
 *
 * @example With custom parsers
 * ```typescript
 * const plugin = new ResponsePlugin({
 *   responseParsers: {
 *     json: async (response) => {
 *       const text = await response.text();
 *       return JSON.parse(text);
 *     },
 *     blob: false // Disable blob parsing
 *   }
 * });
 * ```
 *
 * @example Disable all parsing
 * ```typescript
 * const plugin = new ResponsePlugin({
 *   responseParsers: false
 * });
 * // Plugin will be disabled via enabled hook
 * ```
 *
 * @example Extending for custom behavior
 * ```typescript
 * class CustomResponsePlugin extends ResponsePlugin {
 *   protected validateResponseStatus(response: Response): void {
 *     // Custom validation logic
 *     if (response.status >= 400) {
 *       throw new Error('Custom error');
 *     }
 *   }
 *
 *   protected extractHeaders(response: Response): Record<string, string> {
 *     // Custom header extraction
 *     const headers = super.extractHeaders(response);
 *     headers['X-Custom'] = 'value';
 *     return headers;
 *   }
 * }
 * ```
 *
 * @since 3.0.0
 */
export class ResponsePlugin
  implements LifecyclePluginInterface<ResponsePluginContext>
{
  public readonly pluginName = 'ResponsePlugin';

  protected readonly config: ResponsePluginConfig;

  /**
   * Default response parsers mapping
   *
   * Provides default parsers for all standard response types.
   */
  protected readonly defaultParsers: ResponseParsers = {
    json: (response) => response.json(),
    text: (response) => response.text(),
    blob: (response) => response.blob(),
    arraybuffer: (response) => response.arrayBuffer(),
    formdata: (response) => response.formData(),
    stream: (response) => response.body ?? null,
    document: (response) => response.text()
  };

  /**
   * Merged parsers (default + custom)
   * If responseParsers is false, this will be an empty object
   */
  protected readonly parsers: ResponseParsers;

  constructor(config: ResponsePluginConfig = {}) {
    this.config = config;

    // If responseParsers is false, disable all parsing
    if (config.responseParsers === false) {
      this.parsers = {} as ResponseParsers;
    } else {
      // Merge default parsers with custom parsers
      this.parsers = {
        ...this.defaultParsers,
        ...config.responseParsers
      };
    }
  }

  /**
   * Check if plugin should be enabled for a given hook
   *
   * If responseParsers is false, the plugin will be disabled.
   *
   * @override
   * @param _name - Hook name to check
   * @param _context - Optional execution context
   * @returns true if plugin should execute, false otherwise
   */
  public enabled?(
    _name: string,
    _context?: ResponsePluginContext
  ): boolean {
    // If responseParsers is false, disable the plugin
    if (this.config.responseParsers === false) {
      return false;
    }

    return true;
  }

  /**
   * Post-execution hook that processes the response
   *
   * Handles Response objects and RequestAdapterResponse objects.
   * Parses response data based on responseType configuration.
   * Modifies context returnValue with parsed response data.
   *
   * @override
   * @param context - Executor context
   *
   * @example
   * ```typescript
   * const plugin = new ResponsePlugin();
   * await plugin.onSuccess(ctx);
   * // ctx.returnValue now contains parsed response data
   * ```
   */
  public async onSuccess(context: ResponsePluginContext): Promise<void> {
    const returnValue = context.returnValue;
    const config = context.parameters;

    // Handle Response object
    if (returnValue instanceof Response) {
      const processedResponse = await this.processResponse(returnValue, config);
      context.setReturnValue(processedResponse);
      return;
    }

    // Handle RequestAdapterResponse object
    if (isRequestAdapterResponse(returnValue)) {
      const processedResponse = await this.processAdapterResponse(
        returnValue,
        config
      );
      context.setReturnValue(processedResponse);
      return;
    }

    // No processing needed if not a response object
  }

  /**
   * Validate response status
   *
   * Checks if the response is OK. Can be overridden by subclasses
   * to implement custom validation logic.
   *
   * @param response - The fetch Response object
   * @throws {ExecutorError} If response is not OK
   */
  protected validateResponseStatus(response: Response): void {
    if (!response.ok) {
      throw new ExecutorError(RequestErrorID.RESPONSE_NOT_OK, response);
    }
  }

  /**
   * Process a raw Response object
   *
   * Validates response status and parses data based on responseType.
   *
   * @param response - The fetch Response object
   * @param config - Request configuration
   * @returns RequestAdapterResponse with parsed data
   * @throws {ExecutorError} If response is not OK
   */
  protected async processResponse(
    response: Response,
    config: RequestAdapterConfig
  ): Promise<RequestAdapterResponse> {
    // Validate response status
    this.validateResponseStatus(response);

    // Parse response data
    const data = await this.parseResponseData(response, config.responseType);

    // Build adapter response
    return this.buildAdapterResponse(data, response, config);
  }

  /**
   * Process a RequestAdapterResponse object
   *
   * Parses the response data if it's still a Response object.
   * Can be overridden by subclasses for custom processing logic.
   *
   * @param adapterResponse - The RequestAdapterResponse object
   * @param config - Request configuration
   * @returns RequestAdapterResponse with parsed data
   */
  protected async processAdapterResponse(
    adapterResponse: RequestAdapterResponse,
    config: RequestAdapterConfig
  ): Promise<RequestAdapterResponse> {
    // If data is already parsed (not a Response), return as-is
    if (!(adapterResponse.data instanceof Response)) {
      return adapterResponse;
    }

    // Parse the Response data
    const parsedData = await this.parseResponseData(
      adapterResponse.data as Response,
      config.responseType
    );

    // Return updated adapter response
    return {
      ...adapterResponse,
      data: parsedData
    };
  }

  /**
   * Parse response data based on response type
   *
   * Supports multiple response types: json, text, blob, arraybuffer, formdata, stream.
   * Uses custom parser if provided in config.
   *
   * @param response - The fetch Response object
   * @param responseType - The response type from config
   * @returns Parsed response data, or the original response if parser is disabled
   *
   * @example
   * ```typescript
   * const data = await parseResponseData(response, 'json');
   * // Returns: parsed JSON object
   * ```
   */
  protected async parseResponseData(
    response: Response,
    responseType?: string
  ): Promise<unknown> {
    // Use custom parser if provided
    if (isFunction(this.config.responseDataParser)) {
      return await this.config.responseDataParser(response, responseType);
    }

    // Use default parser based on responseType
    return await this.defaultParseResponseData(response, responseType);
  }

  /**
   * Default response data parser
   *
   * Parses response based on responseType using pluggable parser mapping.
   * Uses configured parsers or falls back to Content-Type detection.
   * If parser is disabled (false), returns the original response object.
   *
   * Can be overridden by subclasses for custom parsing logic.
   *
   * @param response - The fetch Response object
   * @param responseType - The response type from config
   * @returns Parsed response data, or the original response if parser is disabled
   */
  protected async defaultParseResponseData(
    response: Response,
    responseType?: string
  ): Promise<unknown> {
    const normalizedType = responseType?.toLowerCase()?.trim() ?? JSON_RESPONSE_TYPE;

    // Get parser for the response type
    const parser = this.parsers[normalizedType];

    // If parser is explicitly disabled (false), skip parsing and return original response
    if (parser === false) {
      return response;
    }

    // If custom parser exists, use it
    if (isFunction(parser)) {
      return await parser(response);
    }

    // If no parser found, try to infer from Content-Type header
    return await this.fallbackParseByContentType(response, normalizedType);
  }

  /**
   * Infer parser from Content-Type header
   *
   * Attempts to determine the appropriate parser based on Content-Type.
   * Can be overridden by subclasses for custom Content-Type detection logic.
   *
   * @param contentType - The Content-Type header value
   * @returns Parser function or undefined if not found
   */
  protected inferParserFromContentType(
    contentType: string
  ): ResponseParser | undefined {
    const lowerContentType = contentType.toLowerCase();

    // Check for JSON content type
    if (lowerContentType.includes('application/json')) {
      const jsonParser = this.parsers.json;
      if (isFunction(jsonParser)) {
        return jsonParser;
      }
    }

    // Check for text content types
    if (
      lowerContentType.includes('text/') ||
      lowerContentType.includes('application/xml') ||
      lowerContentType.includes('application/xhtml')
    ) {
      const textParser = this.parsers.text;
      if (isFunction(textParser)) {
        return textParser;
      }
    }

    return undefined;
  }

  /**
   * Get fallback parsers
   *
   * Returns parsers to try as fallback when responseType is not recognized.
   * Can be overridden by subclasses to customize fallback strategy.
   *
   * @returns Array of parser functions to try in order
   */
  protected getFallbackParsers(): ResponseParser[] {
    const fallbackParsers: ResponseParser[] = [];

    // Try JSON parser first as it's most common
    const jsonParser = this.parsers.json;
    if (isFunction(jsonParser)) {
      fallbackParsers.push(jsonParser);
    }

    // Then try text parser
    const textParser = this.parsers.text;
    if (isFunction(textParser)) {
      fallbackParsers.push(textParser);
    }

    return fallbackParsers;
  }

  /**
   * Fallback parser that uses Content-Type header
   *
   * Used when responseType is not recognized or not configured.
   * Returns the original response if no parser is available.
   *
   * @param response - The fetch Response object
   * @param _responseType - The original response type (unused, kept for compatibility)
   * @returns Parsed response data, or the original response if no parser available
   */
  protected async fallbackParseByContentType(
    response: Response,
    _responseType: string
  ): Promise<unknown> {
    const contentType = response.headers.get('content-type');

    // Try to infer parser from Content-Type
    if (contentType) {
      const inferredParser = this.inferParserFromContentType(contentType);
      if (inferredParser) {
        try {
          return await inferredParser(response);
        } catch {
          // If inferred parser fails, continue to fallback parsers
        }
      }
    }

    // Default fallback: try parsers in order
    // If a parser throws an error, try the next one
    const fallbackParsers = this.getFallbackParsers();
    for (const parser of fallbackParsers) {
      try {
        return await parser(response);
      } catch {
        // If parsing fails, try next parser
        continue;
      }
    }

    // If no parser available or all parsers failed, return original response
    return response;
  }

  /**
   * Extract headers from Response object
   *
   * Converts Response headers to a plain object.
   * Can be overridden by subclasses for custom header extraction logic.
   *
   * @param response - The fetch Response object
   * @returns Headers as a plain object
   */
  protected extractHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }

  /**
   * Build RequestAdapterResponse object
   *
   * Creates a standardized response object with parsed data, status, headers, etc.
   * Can be overridden by subclasses to customize the response structure.
   *
   * @param data - Parsed response data
   * @param response - The original fetch Response object
   * @param config - Request configuration
   * @returns RequestAdapterResponse object
   */
  protected buildAdapterResponse(
    data: unknown,
    response: Response,
    config: RequestAdapterConfig
  ): RequestAdapterResponse {
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: this.extractHeaders(response),
      config,
      response
    };
  }
}
