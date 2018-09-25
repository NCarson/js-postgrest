
import Fetcher from './PostgrestFetcher'
import Query from './PostgrestQuery'

const fetcher = new Fetcher(true)
const host = 'https://postgrest-test.chessindex.org'
const badhost = 'https://fake.chessindex.org'
const default_q = '/testing?limit=5'
const not_found = '/not_here'

function logGet(fetcher, href, headers, count) {
    console.log("fetching " + href, count)
    fetcher.get(href, headers, count).then(response => { 
        console.log(response.headers, response.data) 
    }).catch((error) => {
        console.error('get failed:', error)
    })
}

logGet(fetcher, host + default_q)
// badhost
logGet(fetcher, badhost + default_q)
// 404
logGet(fetcher, host + not_found)

var query = new Query()
console.log(query.toSearch())
query.order('i', false)
console.log(query.toSearch())
query.paginate(1, 5)
console.log(query.toHeaders())
query.raw('i=eq.5')
query.gt('i', '1')
console.log(query.toSearch())
logGet(fetcher, host + '/testing' + query.toSearch(), query.toHeaders(), true)
query.clear()
console.log(query.toSearch())

