[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / FetchRequestErrorID

# Enumeration: FetchRequestErrorID

[executor](../modules/executor.md).FetchRequestErrorID

Error IDs for different fetch request failure scenarios
Used to identify specific error types in error handling

## Table of contents

### Enumeration Members

- [ABORT\_ERROR](executor.FetchRequestErrorID.md#abort_error)
- [ENV\_FETCH\_NOT\_SUPPORT](executor.FetchRequestErrorID.md#env_fetch_not_support)
- [FETCHER\_NONE](executor.FetchRequestErrorID.md#fetcher_none)
- [FETCH\_REQUEST\_ERROR](executor.FetchRequestErrorID.md#fetch_request_error)
- [RESPONSE\_NOT\_OK](executor.FetchRequestErrorID.md#response_not_ok)

## Enumeration Members

### ABORT\_ERROR

• **ABORT\_ERROR** = ``"ABORT_ERROR"``

Request was aborted

#### Defined in

[packages/fe-utils/common/request/FetchRequest.ts:20](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequest.ts#L20)

___

### ENV\_FETCH\_NOT\_SUPPORT

• **ENV\_FETCH\_NOT\_SUPPORT** = ``"ENV_FETCH_NOT_SUPPORT"``

Environment doesn't support fetch API

#### Defined in

[packages/fe-utils/common/request/FetchRequest.ts:14](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequest.ts#L14)

___

### FETCHER\_NONE

• **FETCHER\_NONE** = ``"FETCHER_NONE"``

No fetcher function provided

#### Defined in

[packages/fe-utils/common/request/FetchRequest.ts:16](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequest.ts#L16)

___

### FETCH\_REQUEST\_ERROR

• **FETCH\_REQUEST\_ERROR** = ``"FETCH_REQUEST_ERROR"``

Generic fetch request error

#### Defined in

[packages/fe-utils/common/request/FetchRequest.ts:12](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequest.ts#L12)

___

### RESPONSE\_NOT\_OK

• **RESPONSE\_NOT\_OK** = ``"RESPONSE_NOT_OK"``

Response status is not OK (not in 200-299 range)

#### Defined in

[packages/fe-utils/common/request/FetchRequest.ts:18](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequest.ts#L18)
