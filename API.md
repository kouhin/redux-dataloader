# API

## **createLoader(pattern:string|object|function, loaderDescriptor: object, options: object)**

This function create a new data loader from loaderDescriptor.

```javascript
const exampleLoader = createLoader('ACTION_TYPE_REQUEST',{
  shouldFetch: (context) => {
    // ...
  },
  fetch: (context) => {
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
  ttl: 10000,
  retryTimes: 3,
  retryWait: fixedWait(500),
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
- `fetch`: function **required**
- `success`: function **required**
- `error`: function **required**

##### **`shouldFetch(context:object)`**

(_optional_)

This function is called first. If it returns `true`, this data loader will do nothing.

##### **`fetch(context: object)`**

(**required**)

This function is used to fetch data. It is **only** called if `shouldFetch()` returns `true`.

##### **`success(context:object, result:any)`**

(**required**)

Must returns an action. Called whenever a value resolves.

##### **`error(context:object, err:any)`**

(**required**)

Must returns an action. Called whenever a value rejects.

##### **`loading(context:object)`**

(_optional_)

Must returns an action. Called before fetching data.

`functions` will be called in this order:

```
##### shouldFetch -> loading -> fetch -> success or error
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

1. `ttl`: Provides a value in millisecond to cache the loader in order to prevent duplicated requests. (_default: 10000_, n/a to server side applications)
2. `retryTimes`: Total try times when fetching failed. (_default: 1_)
3. `retryWait`: Wait stategy that sleeps before retrying: (_default: fixedWait(0)_), see [wait-strategies.js](/src/wait-strategies.js) for detail.

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
