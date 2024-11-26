## ExampleClass



### example 1
```typescript
// Cancel all requests when component unmounts
useEffect(() => {
  return () => abortPlugin.abortAll();
}, []);
```

### example 2
```typescript
// Cancel all requests when component unmounts
useEffect(() => {
  return () => abortPlugin.abortAll();
}, []);
```
