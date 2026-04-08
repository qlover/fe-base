## `src/request/impl/ResponsePlugin` (Module)

**Type:** `module src/request/impl/ResponsePlugin`

---

### `ResponsePlugin` (Class)

**Type:** `class ResponsePlugin`

**Since:** `3.0.0`

Plugin for processing HTTP responses

This plugin is responsible for parsing response data based on the response type.
It handles various response formats including JSON, text, blob, arraybuffer, etc.

Features:

- Automatic response parsing based on responseType
- Response status validation
- Custom response parser support
- Error handling for parsing failures
- Extensible design with protected methods for subclass overrides

Extensibility:
This class is designed to be extended. Subclasses can override protected methods
to customize behavior:

- `validateResponseStatus()` - Custom response validation
- `extractHeaders()` - Custom header extraction
- `buildAdapterResponse()` - Custom response structure
- `inferParserFromContentType()` - Custom Content-Type detection
- `getFallbackParsers()` - Custom fallback strategy
- `processAdapterResponse()` - Custom adapter response processing
- `defaultParseResponseData()` - Custom default parsing logic

**Example:** Basic usage

```typescript
const plugin = new ResponsePlugin();
```

**Example:** With custom parsers

```typescript
const plugin = new ResponsePlugin({
  responseParsers: {
    json: async (response) => {
      const text = await response.text();
      return JSON.parse(text);
    },
    blob: false // Disable blob parsing
  }
});
```

**Example:** Disable all parsing

```typescript
const plugin = new ResponsePlugin({
  responseParsers: false
});
// Plugin will be disabled via enabled hook
```

**Example:** Extending for custom behavior

```typescript
class CustomResponsePlugin extends ResponsePlugin {
  protected validateResponseStatus(response: Response): void {
    // Custom validation logic
    if (response.status >= 400) {
      throw new Error('Custom error');
    }
  }

  protected extractHeaders(response: Response): Record<string, string> {
    // Custom header extraction
    const headers = super.extractHeaders(response);
    headers['X-Custom'] = 'value';
    return headers;
  }
}
```

---

#### `new ResponsePlugin` (Constructor)

**Type:** `(config: ResponsePluginConfig) => ResponsePlugin`

#### Parameters

| Name     | Type                   | Optional | Default | Since | Deprecated | Description |
| -------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `ResponsePluginConfig` | ✅       | `{}`    | -     | -          |             |

---

#### `config` (Property)

**Type:** `ResponsePluginConfig`

---

#### `defaultParsers` (Property)

**Type:** `ResponseParsers`

**Default:** `{}`

Default response parsers mapping

Provides default parsers for all standard response types.

---

#### `parsers` (Property)

**Type:** `ResponseParsers`

Merged parsers (default + custom)
If responseParsers is false, this will be an empty object

---

#### `pluginName` (Property)

**Type:** `"ResponsePlugin"`

**Default:** `'ResponsePlugin'`

Optional plugin name for identification

---

#### `buildAdapterResponse` (Method)

**Type:** `(data: unknown, response: Response, config: RequestAdapterConfig<unknown>) => RequestAdapterResponse<unknown, unknown>`

#### Parameters

| Name       | Type                            | Optional | Default | Since | Deprecated | Description                        |
| ---------- | ------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `data`     | `unknown`                       | ❌       | -       | -     | -          | Parsed response data               |
| `response` | `Response`                      | ❌       | -       | -     | -          | The original fetch Response object |
| `config`   | `RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          | Request configuration              |

---

##### `buildAdapterResponse` (CallSignature)

**Type:** `RequestAdapterResponse<unknown, unknown>`

Build RequestAdapterResponse object

Creates a standardized response object with parsed data, status, headers, etc.
Can be overridden by subclasses to customize the response structure.

**Returns:**

RequestAdapterResponse object

#### Parameters

| Name       | Type                            | Optional | Default | Since | Deprecated | Description                        |
| ---------- | ------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `data`     | `unknown`                       | ❌       | -       | -     | -          | Parsed response data               |
| `response` | `Response`                      | ❌       | -       | -     | -          | The original fetch Response object |
| `config`   | `RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          | Request configuration              |

---

#### `defaultParseResponseData` (Method)

**Type:** `(response: Response, responseType: string) => Promise<unknown>`

#### Parameters

| Name           | Type       | Optional | Default | Since | Deprecated | Description                   |
| -------------- | ---------- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `response`     | `Response` | ❌       | -       | -     | -          | The fetch Response object     |
| `responseType` | `string`   | ✅       | -       | -     | -          | The response type from config |

---

##### `defaultParseResponseData` (CallSignature)

**Type:** `Promise<unknown>`

Default response data parser

Parses response based on responseType using pluggable parser mapping.
Uses configured parsers or falls back to Content-Type detection.
If parser is disabled (false), returns the original response object.

Can be overridden by subclasses for custom parsing logic.

**Returns:**

Parsed response data, or the original response if parser is disabled

#### Parameters

| Name           | Type       | Optional | Default | Since | Deprecated | Description                   |
| -------------- | ---------- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `response`     | `Response` | ❌       | -       | -     | -          | The fetch Response object     |
| `responseType` | `string`   | ✅       | -       | -     | -          | The response type from config |

---

#### `enabled` (Method)

**Type:** `(_name: string, _context: ResponsePluginContext) => boolean`

#### Parameters

| Name       | Type                    | Optional | Default | Since | Deprecated | Description                |
| ---------- | ----------------------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `_name`    | `string`                | ❌       | -       | -     | -          | Hook name to check         |
| `_context` | `ResponsePluginContext` | ✅       | -       | -     | -          | Optional execution context |

---

##### `enabled` (CallSignature)

**Type:** `boolean`

Check if plugin should be enabled for a given hook

If responseParsers is false, the plugin will be disabled.

**Returns:**

true if plugin should execute, false otherwise

#### Parameters

| Name       | Type                    | Optional | Default | Since | Deprecated | Description                |
| ---------- | ----------------------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `_name`    | `string`                | ❌       | -       | -     | -          | Hook name to check         |
| `_context` | `ResponsePluginContext` | ✅       | -       | -     | -          | Optional execution context |

---

#### `extractHeaders` (Method)

**Type:** `(response: Response) => Record<string, string>`

#### Parameters

| Name       | Type       | Optional | Default | Since | Deprecated | Description               |
| ---------- | ---------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `response` | `Response` | ❌       | -       | -     | -          | The fetch Response object |

---

##### `extractHeaders` (CallSignature)

**Type:** `Record<string, string>`

Extract headers from Response object

Converts Response headers to a plain object.
Can be overridden by subclasses for custom header extraction logic.

**Returns:**

Headers as a plain object

#### Parameters

| Name       | Type       | Optional | Default | Since | Deprecated | Description               |
| ---------- | ---------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `response` | `Response` | ❌       | -       | -     | -          | The fetch Response object |

---

#### `fallbackParseByContentType` (Method)

**Type:** `(response: Response, _responseType: string) => Promise<unknown>`

#### Parameters

| Name            | Type       | Optional | Default | Since | Deprecated | Description                                                 |
| --------------- | ---------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `response`      | `Response` | ❌       | -       | -     | -          | The fetch Response object                                   |
| `_responseType` | `string`   | ❌       | -       | -     | -          | The original response type (unused, kept for compatibility) |

---

##### `fallbackParseByContentType` (CallSignature)

**Type:** `Promise<unknown>`

Fallback parser that uses Content-Type header

Used when responseType is not recognized or not configured.
Returns the original response if no parser is available.

**Returns:**

Parsed response data, or the original response if no parser available

#### Parameters

| Name            | Type       | Optional | Default | Since | Deprecated | Description                                                 |
| --------------- | ---------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `response`      | `Response` | ❌       | -       | -     | -          | The fetch Response object                                   |
| `_responseType` | `string`   | ❌       | -       | -     | -          | The original response type (unused, kept for compatibility) |

---

#### `getFallbackParsers` (Method)

**Type:** `() => ResponseParser[]`

---

##### `getFallbackParsers` (CallSignature)

**Type:** `ResponseParser[]`

Get fallback parsers

Returns parsers to try as fallback when responseType is not recognized.
Can be overridden by subclasses to customize fallback strategy.

**Returns:**

Array of parser functions to try in order

---

#### `handleResponse` (Method)

**Type:** `(returnValue: unknown, config: ResponsePluginConfig & RequestAdapterConfig<unknown>) => undefined \| Promise<RequestAdapterResponse<unknown, unknown>>`

#### Parameters

| Name          | Type                                                   | Optional | Default | Since | Deprecated | Description |
| ------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `returnValue` | `unknown`                                              | ❌       | -       | -     | -          |             |
| `config`      | `ResponsePluginConfig & RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          |             |

---

##### `handleResponse` (CallSignature)

**Type:** `undefined \| Promise<RequestAdapterResponse<unknown, unknown>>`

#### Parameters

| Name          | Type                                                   | Optional | Default | Since | Deprecated | Description |
| ------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `returnValue` | `unknown`                                              | ❌       | -       | -     | -          |             |
| `config`      | `ResponsePluginConfig & RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          |             |

---

#### `inferParserFromContentType` (Method)

**Type:** `(contentType: string) => undefined \| ResponseParser`

#### Parameters

| Name          | Type     | Optional | Default | Since | Deprecated | Description                   |
| ------------- | -------- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `contentType` | `string` | ❌       | -       | -     | -          | The Content-Type header value |

---

##### `inferParserFromContentType` (CallSignature)

**Type:** `undefined \| ResponseParser`

Infer parser from Content-Type header

Attempts to determine the appropriate parser based on Content-Type.
Can be overridden by subclasses for custom Content-Type detection logic.

**Returns:**

Parser function or undefined if not found

#### Parameters

| Name          | Type     | Optional | Default | Since | Deprecated | Description                   |
| ------------- | -------- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `contentType` | `string` | ❌       | -       | -     | -          | The Content-Type header value |

---

#### `onSuccess` (Method)

**Type:** `(context: ResponsePluginContext) => Promise<void>`

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description      |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ---------------- |
| `context` | `ResponsePluginContext` | ❌       | -       | -     | -          | Executor context |

---

##### `onSuccess` (CallSignature)

**Type:** `Promise<void>`

Post-execution hook that processes the response

Handles Response objects and RequestAdapterResponse objects.
Parses response data based on responseType configuration.
Modifies context returnValue with parsed response data.

**Example:**

```typescript
const plugin = new ResponsePlugin();
await plugin.onSuccess(ctx);
// ctx.returnValue now contains parsed response data
```

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description      |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | ---------------- |
| `context` | `ResponsePluginContext` | ❌       | -       | -     | -          | Executor context |

---

#### `parseResponseData` (Method)

**Type:** `(response: Response, responseType: string) => Promise<unknown>`

#### Parameters

| Name           | Type       | Optional | Default | Since | Deprecated | Description                   |
| -------------- | ---------- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `response`     | `Response` | ❌       | -       | -     | -          | The fetch Response object     |
| `responseType` | `string`   | ✅       | -       | -     | -          | The response type from config |

---

##### `parseResponseData` (CallSignature)

**Type:** `Promise<unknown>`

Parse response data based on response type

Supports multiple response types: json, text, blob, arraybuffer, formdata, stream.
Uses custom parser if provided in config.

**Returns:**

Parsed response data, or the original response if parser is disabled

**Example:**

```typescript
const data = await parseResponseData(response, 'json');
// Returns: parsed JSON object
```

#### Parameters

| Name           | Type       | Optional | Default | Since | Deprecated | Description                   |
| -------------- | ---------- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `response`     | `Response` | ❌       | -       | -     | -          | The fetch Response object     |
| `responseType` | `string`   | ✅       | -       | -     | -          | The response type from config |

---

#### `processAdapterResponse` (Method)

**Type:** `(adapterResponse: RequestAdapterResponse<unknown, unknown>, config: RequestAdapterConfig<unknown>) => Promise<RequestAdapterResponse<unknown, unknown>>`

#### Parameters

| Name              | Type                                       | Optional | Default | Since | Deprecated | Description                       |
| ----------------- | ------------------------------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `adapterResponse` | `RequestAdapterResponse<unknown, unknown>` | ❌       | -       | -     | -          | The RequestAdapterResponse object |
| `config`          | `RequestAdapterConfig<unknown>`            | ❌       | -       | -     | -          | Request configuration             |

---

##### `processAdapterResponse` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<unknown, unknown>>`

Process a RequestAdapterResponse object

Parses the response data if it's still a Response object.
Can be overridden by subclasses for custom processing logic.

**Returns:**

RequestAdapterResponse with parsed data

#### Parameters

| Name              | Type                                       | Optional | Default | Since | Deprecated | Description                       |
| ----------------- | ------------------------------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `adapterResponse` | `RequestAdapterResponse<unknown, unknown>` | ❌       | -       | -     | -          | The RequestAdapterResponse object |
| `config`          | `RequestAdapterConfig<unknown>`            | ❌       | -       | -     | -          | Request configuration             |

---

#### `processResponse` (Method)

**Type:** `(response: Response, config: RequestAdapterConfig<unknown>) => Promise<RequestAdapterResponse<unknown, unknown>>`

#### Parameters

| Name       | Type                            | Optional | Default | Since | Deprecated | Description               |
| ---------- | ------------------------------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `response` | `Response`                      | ❌       | -       | -     | -          | The fetch Response object |
| `config`   | `RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          | Request configuration     |

---

##### `processResponse` (CallSignature)

**Type:** `Promise<RequestAdapterResponse<unknown, unknown>>`

Process a raw Response object

Validates response status and parses data based on responseType.

**Returns:**

RequestAdapterResponse with parsed data

**Throws:**

If response is not OK

#### Parameters

| Name       | Type                            | Optional | Default | Since | Deprecated | Description               |
| ---------- | ------------------------------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `response` | `Response`                      | ❌       | -       | -     | -          | The fetch Response object |
| `config`   | `RequestAdapterConfig<unknown>` | ❌       | -       | -     | -          | Request configuration     |

---

#### `validateResponseStatus` (Method)

**Type:** `(response: Response) => void`

#### Parameters

| Name       | Type       | Optional | Default | Since | Deprecated | Description               |
| ---------- | ---------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `response` | `Response` | ❌       | -       | -     | -          | The fetch Response object |

---

##### `validateResponseStatus` (CallSignature)

**Type:** `void`

Validate response status

Checks if the response is OK. Can be overridden by subclasses
to implement custom validation logic.

**Throws:**

If response is not OK

#### Parameters

| Name       | Type       | Optional | Default | Since | Deprecated | Description               |
| ---------- | ---------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `response` | `Response` | ❌       | -       | -     | -          | The fetch Response object |

---

### `ResponseParsers` (Interface)

**Type:** `interface ResponseParsers`

Response parsers mapping

Maps responseType to parser functions.
Set to `false` to disable parsing for that type.

**Example:**

```typescript
const parsers: ResponseParsers = {
  json: async (response) => await response.json(),
  text: async (response) => await response.text(),
  blob: false // Disable blob parsing
};
```

---

#### `arraybuffer` (Property)

**Type:** `false \| ResponseParser`

---

#### `blob` (Property)

**Type:** `false \| ResponseParser`

---

#### `document` (Property)

**Type:** `false \| ResponseParser`

---

#### `formdata` (Property)

**Type:** `false \| ResponseParser`

---

#### `json` (Property)

**Type:** `false \| ResponseParser`

---

#### `stream` (Property)

**Type:** `false \| ResponseParser`

---

#### `text` (Property)

**Type:** `false \| ResponseParser`

---

### `ResponsePluginConfig` (Interface)

**Type:** `interface ResponsePluginConfig`

---

#### `responseDataParser` (Property)

**Type:** `Object`

Custom response data parser

Allows you to provide a custom function to parse response data.
If provided, this will be used instead of the default parser.

**Returns:**

Parsed response data

**Example:**

```typescript
const plugin = new ResponsePlugin({
  responseDataParser: async (response, responseType) => {
    if (responseType === 'custom') {
      return await response.text().then((text) => JSON.parse(text));
    }
    return await response.json();
  }
});
```

---

#### `responseParsers` (Property)

**Type:** `false \| Partial<ResponseParsers>`

Response parsers mapping

Allows you to provide custom parsers for specific response types,
disable certain parsers by setting them to `false`,
or disable all parsing by setting the entire object to `false`.

**Example:**

```typescript
// Custom parsers
const plugin = new ResponsePlugin({
  responseParsers: {
    json: async (response) => {
      const text = await response.text();
      return JSON.parse(text);
    },
    blob: false // Disable blob parsing
  }
});

// Disable all parsing
const plugin = new ResponsePlugin({
  responseParsers: false
});
```

---

### `ResponseParser` (TypeAlias)

**Type:** `Object`

Response parser function type

**Returns:**

Parsed response data

---

### `ResponsePluginContext` (TypeAlias)

**Type:** `ExecutorContextInterface<ResponsePluginConfig & RequestAdapterConfig, unknown>`

---
