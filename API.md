# API

## **createLoader(pattern:string|object|function, loaderDescriptor: object, options: object)**

This function create a new data loader from loaderDescriptor.

```javascript
const exampleLoader = createLoader('ACTION_TYPE_REQUEST',{
  shouldFetch: (context) => {
    // ...
  },
  local: (context) => {
    // ...
  },
  remote: (context) => {
    // ...
  },
  loading: (context) => {
    // ...
  },
  success: (context, result) => {
  },
  error: (context, err) => {
    // ...
  }
}, {
  ttl: 10000
})
```

When an action that matches pattern is dispatched, the created loader will start loading data.

### **`pattern:string|object|function`**

(**required**)

`pattern` uses the following rules:

1. If the pattern is an `object`, `action` is matched by `_.isEqual(action, pattern`) with `lodash`.
2. If the pattern is a `function`, `action` is matched by `pattern(action) === true`.
3. Otherwise, `action` is matched by `action.type === pattern`.

### **`loaderDescriptor: object`**

(**required**)

`loaderDescriptor` is an object contains several functions. It **MAY** contains the following keys:

- `shouldFetch`:function _optional_
- `loading`: function _optional_
- `local`: function _optional_
- `remote`: function **required**
- `success`: function **required**
- `error`: function **required**

##### **`shouldFetch(context:object)`**

(_optional_)

This function is called first. If it returns `true`, this data loader will do nothing.

##### **`local(context: object)`**

(_optional_)

This function is called before `remote()`. When it returns `undefined` or `null`, data loader will fetch data by `remote()`.
Otherwise, `success()` or `error()` will receive the return value.

Notice that when it causes an exception, `error()` will receive this error. You may deal with the exception in `local()` if you want to use `remote()` as a fallback method when an exception is occured locally.

##### **`remote(context: object)`**

(**required**)

This function is used to fetch data remotely. It is **only** called if `local()` returns `undefined` or `null`.

##### **`success(context:object, result:any)`**

(**required**)

Must returns an action. Called whenever a value resolves.

##### **`error(context:object, err:any)`**

(**required**)

Must returns an action. Called whenever a value rejects.

##### **`loading(context:object)`**

(_optional_)

Must returns an action. Called before fetching data locally.

`functions` will be called in this order:

```
##### shouldFetch -> loading -> local -> remote -> success or error
```

#### About **`context:object`**

`context` usually contains

- `dispatch`,
- `getState`
- `action`
- (other variables provided by middleware)

 `dispatch` and `getState` are functions of redux store.

 `action` is original dispatched action. It usually contains parameters for fetching data.

You can use `createDataLoaderMiddleware(loaders, args)` to add extra objects to context.

#### **`options:object`**

(_optional_)

`options` provides following optional values:

1. `ttl`: Provides a value in millisecond to cache the loader in order to prevent duplicated requests. (_default: 10000_)   

---

## **createDataLoaderMiddleware(loaders: Array, args: object)**

Returns a redux middleware.

#### **`loaders:Array`**

(**required**)

An array of created data loaders.

#### **`args:object`**

(_optional)

All the args(key-value) will be added to context.

---

## **load(action: object)**

Returns a `Promise`.

Wrap an action and returns a `Promise` that can be processed by dataLoaderMiddleware.
