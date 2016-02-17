# Redux Data Loader

[![Build Status](https://travis-ci.org/kouhin/redux-dataloader.svg)](https://travis-ci.org/kouhin/redux-dataloader)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm](https://img.shields.io/npm/v/redux-dataloader.svg)](https://npmjs.org/package/redux-dataloader)

Loads async data for Redux apps focusing on preventing duplicated requests and dealing with async dependencies.

Deeply inspired by [alt Data Souces API](http://alt.js.org/docs/async), also inspired by [redux-saga](https://github.com/yelouafi/redux-saga).

Instead of using redux-thunk, it handles wrapped actions and sideload async data from local or remote data sources. 
It also caches data requests for a while in order to prevent duplicated requests.

## TODOs

- [ ] complete test
- [ ] add real-world example with redux, redux-router, async data loading, async dependencies

## Installation

```
npm install redux-dataloader --save
```

## Usage

### 3. Define actions and update the request action with load()

#### `userActions.js`
```javascript
import { load } from 'redux-dataloader'

export const FETCH_USER_REQUEST = 'myapp/user/FETCH_USER/REQUEST'
export const FETCH_USER_SUCCESS = 'myapp/user/FETCH_USER/SUCCESS'
export const FETCH_USER_FAILURE = 'myapp/user/FETCH_USER/SUCCESS'

export function fetchUserRequest (userId) {
  // use `load` to wrap a request action, load() returns a Promise
  return load({
    type: FETCH_USER_REQUEST,
    payload: {
      userId,
    }
  })
}

export function fetchUserSuccess (userId, data) {
  // ...
}

export function fetchUserFailure (userId, error) {
  // ...
}

```

### 1. Create a data loader

#### `dataloaders.js`

```javascript
import { createLoader } from 'redux-dataloader'

import * as userActions from './userActions'

const userLoader = createLoader (userActions.FETCH_USER_REQUEST, {
  /*
   * (required) Handle fetched data, return a success action
   */
  success: (context, result) => {
    // you can get original request action from context
    const action = context.action
    const userId = action.payload.userId
    return userActions.fetchUserSuccess(userId, result)
  },
  /*
   * (required) Handle error, return a failure action
   */
  error: (context, error) => {
    const action = context.action
    const userId = action.payload.userId
    return userActions.fetchUserFailure(userId, error);
  },
  /*
   * (optional) By default, original request action will be dispatched. But you can still modify this process.
   */
  // loading: ({ action }) => {}
  /*
   * (optional) Checks in local cache (e.g. localstoreage) first.
   * if the value is present it'll use that instead.
   */
  local: (context) => {
    // Load data
  },
  /*
   * (required) Fetch data remotely.
   * We use yahoo/fetchr as an example.
   */
  remote: (context) => {
    const action = context.action
    const userId = action.payload.userId

    const fetchr = context.fetchr
    return fetchr.read('userService')
      .params({
        userId
      }).end()
  },
  /*
   * (optional) !!! Different from alt API.
   * When shouldFetch returns false, it will prevent both local and remote request.
   */
  shouldFetch: (context) => {
    const action = context.action
    const userId = action.payload.userId
    const getState = context.getState
    return !getState().user.users[userId]
  }
})

export default [userLoader];
```

### 2. Register middleware

#### `configureStore.js`

```javascript
import { createStore, applyMiddleware } from 'redux'
import { createDataLoaderMiddleware } from `redux-dataloader`
import { Fetchr } from 'fetchr'
import reducer from './reducers'
import loaders from './dataloaders'

const fetcher = new Fetcher({
  xhrPath: '/api',
});

// create middleware, you can add extra arguments to data loader context
const dataLoaderMiddleware = createDataLoaderMiddleware(loaders, { fetchr })

const store = createStore(
  reducer,
  applyMiddleware(dataLoaderMiddleware)
)

// ...
```

## API

### **createLoader(pattern:string|object|function, loaderDescriptor: object, options: object)**

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

#### **`pattern:string|object|function`**

`pattern` uses the following rules:

1. If the pattern is an `object`, `action` is matched by `_.isEqual(action, pattern`) with `lodash`.
2. If the pattern is a `function`, `action` is matched by `pattern(action) === true`.
3. Otherwise, `action` is matched by `action.type === pattern`.

#### **`loaderDescriptor: object`**

(**required**)

`loaderDescriptor` is an object contains several functions. It **MAY** optionally implements `shouldFetch`, `local`, `loading`, but **MUST** implements `remote`, `success`, `error`.

**`shouldFetch(context:object)`**

(_optional_)

This function is called first. If it returns `true`, this data loader will do nothing.

**`local(context:object)`**

(_optional_)

This function is called before `remote()`. When it returns `undefined` or `null`, data loader will fetch data by `remote()`. 
Otherwise, `success()` or `error()` will receive the return value.

Notice that when it causes an exception, `error()` will receive this error. You may deal with the exception in `local()` if you want to use `remote()` as a fallback method when an exception is occured locally.

**`remote(context:object)`**

(**required**)

This function is used to fetch data remotely. It is **only** called if `local()` returns `undefined` or `null`.

**`success(context:object, result:any)`**

(**required**)

Must returns an action. Called whenever a value resolves.

**`error(context:object, err:any)`**

(**required**)

Must returns an action. Called whenever a value rejects.

**`loading(context:object)`**

(_optional_)

Must returns an action. Called before fetching data locally.

`functions` will be called in this order:

```
shouldFetch -> loading -> local -> remote -> success or error
```

#### **`context:object`**

`context` contains `dispatch`, `getState` and `action` at least.

 `dispatch` and `getState` are functions of redux store.

 `action` is orignal dispatched action. It usually contains parameters for fetching data.

 You can use `createDataLoaderMiddleware(loaders, args)` to add extra objects to context.

#### **`options:object`**

(_optional_)

`options` provides following optional values:

1. `ttl`: Provides a value in millisecond to cache the loader in order to prevent duplicated requests. (_default: 10000_)   

### **createDataLoaderMiddleware(loaders: Array, args:object)**

Returns a redux middleware.

#### **`loaders:Array`**

(**required**)

An array of created data loaders.

#### **`args:object`**

(_optional)

All the args(key-value) will be added to context.

### **load(action:object)**

Returns a `Promise`.

Wrap an action and returns a `Promise` that can be processed by dataLoaderMiddleware.

## License

MIT
