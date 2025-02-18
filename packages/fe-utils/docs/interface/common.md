## TypeAlias `Intersection`

`{ [P in keyof T1 & keyof T2]: T1[P] \| T2[P] }`

Get the intersection type of two types

@since 

1.0.14

@example 

```ts
type T1 = { a: number; b: string };
type T2 = { a: number; c: boolean };
type I = Intersection<T1, T2>; // I is { a: number }
```



## TypeAlias `ValueOf`

`T[keyof T]`

Get the value type of an object

@since 

1.0.14

@example 

```ts
type T = { a: number; b: string };
type V = ValueOf<T>; // V is number | string
```


