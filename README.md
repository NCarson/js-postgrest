
# js-postgrest

## JavaScript API for Postgrest

Lean and mean api for using Postgrest. Only depends on axios http lib.
Basically just wraps Postgrest api since it is already an ORM. No need
to do it twice.

### Doc

[Api](https://ncarson.github.io/js-postgrest/index.html)

### Basics


```js

import {PostgrestFetcher as Fetcher} from 'js-postgrest'
import {PostgrestQuery as Query} from 'js-postgrest'

const fetcher = new Fetcher()
const host = 'https://postgrest-test.chessindex.org'
const default_q = '/testing?limit=5'
const query = new Query()
query.paginate(1, 20)
query.op('gt', 'i', 4)
const conf = query.toConfig()
const search = query.toSearch()
const host = 'https://postgrest-test.chessindex.org'
const table = '/testing'

const result = await fetcher.get(host + table + search, conf)
    .then(response => {console.log('fetched:', href); return response})
    .catch(error => {console.log('failed:', href); return error})

result.data // great things happens here
```

#### Supports

- All of the basic operators with `query.op`.
- Pagination with `query.paginate`.
- Order clauses with `query.order`.
- Limits and offsets with `query.limit` and `query.offset`.
- Raw clauses for things not yet supported with `query.raw`.
- Combine other PostgrestQuery instances with `query.combine`.
- Method chaining as methods that add paramaters return `this`.
- GET method rpc function args with `query.argument` (see API doc)

### Install

```
npm i js-postgrest
```

### Use

#### Node
```js
//named imports ...
import {PostgrestQuery} from 'js-postgrest'
import {PostgrestFetcher} from 'js-postgrest'

//or for individual imports ...
import PostgresteQuery from 'js-postgrest/lib/PostgrestQuery'
import PostgresteFetcher from 'js-postgrest/lib/PostgrestFetcher'
```

### TODO

Anyting missing can still be done through PostgrestFetcher.get(url, config)
as it basically just passes url and config to axios.get with same
signature.

- oauth
- methods other than GET




