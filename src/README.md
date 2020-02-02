if you get something like this error while running:
`
TypeError: Cannot read property 'replace' of null
    at dispatchHttpRequest
    (axios/lib/adapters/http.js:84:74)
`
pretty bad error reporting. maybe switch out axios

your url is probably malformed
like `localhost:3000` needs `http://localhost:3000`
