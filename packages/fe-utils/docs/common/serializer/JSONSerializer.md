## Class `JSONSerializer`
Enhanced JSON serialization implementation that combines standard JSON API with additional features

Why implement both Serializer and JSON interfaces:
1. Serializer interface provides a consistent API across different serialization formats
2. JSON interface maintains compatibility with native JSON methods
3. Allows seamless integration with both existing JSON code and new serialization patterns

Enhanced capabilities beyond standard JSON:
1. Cross-platform line ending normalization (\r\n -> \n)
2. Built-in pretty printing configuration
3. Default value support for failed deserialization
4. Circular reference detection with clear error messages
5. Type-safe interface with better TypeScript support

Usage scenarios:
1. Direct replacement for JSON global object
2. Part of a pluggable serialization system
3. Configuration file parsing with error handling
4. Cross-platform data exchange

@implements 

- Generic serialization interface

@implements 

- Standard JSON interface compatibility

@todo 

- If circular reference is detected, the error message is not very friendly, can use [flatted](https://www.npmjs.com/package/flatted) to improve it

@since 

1.0.10

@example 

```typescript
const serializer = new JSONSerializer({ pretty: true });

// Using Serializer interface (with enhanced features)
const serialized = serializer.serialize({ name: "test" });
const deserialized = serializer.deserialize('invalid json', { fallback: true });

// Using standard JSON API (maintains compatibility)
const json = serializer.stringify({ name: "test" });
const obj = serializer.parse(json);
```

@example 

`JSON.parse`
 may encounter errors, so we use 
`deserialize`
 method to handle them, set default value if needed


```typescript
const serializer = new JSONSerializer();
serializer.deserialize('invalid json', { fallback: true }); // returns { fallback: true }
```

@example 

Or, use 
`JSONSerializer`
 replace native 
`JSON`
 methods


```typescript
const JSON = new JSONSerializer();

JSON.stringify({ name: 'test' }); // same as JSON.stringify({ name: 'test' })
JSON.parse('{ "name": "test" }'); // same as JSON.parse('{ "name": "test" }')
```


## Members

### constructor


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options.indent  | `number` |  | 1.0.10 | Number of spaces to use for indentation when pretty printing<br>Only used when pretty is true |
|  options.pretty  | `boolean` |  | 1.0.10 | Enable pretty printing of JSON output<br>Adds automatic indentation and line breaks for better readability |
|  options.replacer  | `Function` |  | 1.0.10 | Custom replacer function for JSON.stringify<br>Allows custom transformation during serialization<br>Note: Will be wrapped to handle line endings |


### createReplacer
Creates a replacer function that handles line endings normalization

Why normalize line endings:
1. Ensures consistent output across different platforms (Windows, Unix)
2. Prevents issues with source control systems
3. Makes string comparisons reliable

Handles three cases:
1. Array replacer - Used for property filtering
2. Function replacer - Wrapped to handle line endings
3. Null/undefined - Creates default line ending handler

**@since** 

1.0.10


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  replacer  | `null \| Function \| (string \| number)[]` |  |  | Custom replacer function or array of properties to include |


### deserialize
Implements Serializer.deserialize with enhanced error handling

Benefits:
1. Safe parsing with default value fallback
2. No try-catch needed in calling code
3. Predictable error handling

**@since** 

1.0.10


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  data  | `string` |  |  |  |
|  defaultValue  | `unknown` |  |  |  |


### parse
Standard JSON.parse implementation
Note: Error handling is done in deserialize method

**@since** 

1.0.10


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  text  | `string` |  |  |  |
|  reviver  | `Function` |  |  |  |


### serialize
Implements Serializer.serialize
Provides a simplified interface with configured options

Benefits:
1. Uses configured pretty printing
2. Applies custom replacer if specified
3. Maintains consistent line endings

**@since** 

1.0.10


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  data  | `unknown` |  |  |  |


### serializeArray
Optimized serialization for arrays of primitive values
Avoids object property enumeration

**@since** 

1.0.10


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  arr  | `(string \| number \| boolean)[]` |  |  | Array of primitive values to serialize |


### stringify
Enhanced JSON.stringify with additional features

Enhancements:
1. Line ending normalization
2. Configurable pretty printing
3. Better error messages for circular references
4. Type-safe replacer handling

**If circular reference is detected, the error message is not very friendly, can use [flatted](https://www.npmjs.com/package/flatted) to improve it**

**@since** 

1.0.10


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  value  | `any` |  |  |  |
|  replacer  | `null \| (string \| number)[] \| Function` |  |  |  |
|  space  | `string \| number` |  |  |  |

