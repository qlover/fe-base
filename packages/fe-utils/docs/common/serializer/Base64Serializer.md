## Class `Base64Serializer`
Base64 serialization implementation
Provides string-to-base64 encoding/decoding with optional compression

Features:
- Base64 encoding/decoding
- UTF-8 support
- URL-safe encoding option

@implements 


@since 

1.0.10

@example 

```typescript
const serializer = new Base64Serializer({ urlSafe: true });

// Encode string to base64
const encoded = serializer.stringify("Hello World!");

// Decode base64 back to string
const decoded = serializer.parse(encoded);
```


## Members

### constructor


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  options.urlSafe  | Use URL-safe base64 encoding | `boolean` |  | 1.0.10 |


### deserialize
Deserializes base64 string back to original

**@since** 

1.0.10


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  data  | Base64 string to decode | `string` |  |  |
|  defaultValue  | Optional default value if decoding fails | `string` |  |  |


### makeUrlSafe
Converts standard base64 to URL-safe base64

**@since** 

1.0.10


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  base64  | Standard base64 string | `string` |  |  |


### makeUrlUnsafe
Converts URL-safe base64 back to standard base64

**@since** 

1.0.10


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  safe  | URL-safe base64 string | `string` |  |  |


### serialize
Serializes string to base64

**@since** 

1.0.10


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  data  | String to encode | `string` |  |  |

