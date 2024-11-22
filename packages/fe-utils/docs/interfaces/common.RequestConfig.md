[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / RequestConfig

# Interface: RequestConfig

[common](../modules/common.md).RequestConfig

## Hierarchy

- `RequestInit`

  ↳ **`RequestConfig`**

  ↳↳ [`FetchRequestConfig`](common.FetchRequestConfig.md)

## Indexable

▪ [key: `string`]: `unknown`

extra attributes, other plugin config

## Table of contents

### Properties

- [baseURL](common.RequestConfig.md#baseurl)
- [executor](common.RequestConfig.md#executor)
- [params](common.RequestConfig.md#params)
- [timeout](common.RequestConfig.md#timeout)
- [url](common.RequestConfig.md#url)

## Properties

### baseURL

• `Optional` **baseURL**: `string`

Base URL

**`Example`**

```ts
https://api.example.com
```

**`Access`**

FetchURLPlugin

- url = /users/1 => https://api.example.com/users/1
- url = users/1 => https://api.example.com/users/1

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:25](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequestConfig.ts#L25)

___

### executor

• `Optional` **executor**: [`AsyncExecutor`](../classes/common.AsyncExecutor.md)

Base executor config, it's only AsyncExecutor

can override by FetchRequest

**`Access`**

FetchRequest

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:10](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequestConfig.ts#L10)

___

### params

• `Optional` **params**: `Record`\<`string`, `string`\>

**`Access`**

FetchURLPlugin

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:36](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequestConfig.ts#L36)

___

### timeout

• `Optional` **timeout**: `number`

**`Access`**

FetchRequest

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:15](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequestConfig.ts#L15)

___

### url

• **url**: `string`

**`Access`**

FetchURLPlugin
FIXME: change to URL | Request, add attribute `input`

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:31](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequestConfig.ts#L31)
