 
const Fetcher = require("../PostgrestFetcher")
const fetcher = new Fetcher({debug: false})

fetcher.get('http://localhost:3000')
    .then(r => console.log(r))
    .catch(e => console.log(e))
