const test = require('ava')

const Fetcher = require('../lib/PostgrestFetcher')
const Query = require('../lib/PostgrestQuery')

const log = msg => {console.log(msg)}

function logGet(test, fetcher, href, headers, on_success, on_error) {
    log("fetching " + href)
    return fetcher.get(href, headers)
        .then(response => {log('fetched:', href); return response})
        .catch(error => {log('failed:', href); return error})
}

const fetcher = new Fetcher()
const host = 'http://127.0.0.1:3000'
//const badhost = 'https://fake.chessindex.org'
const default_q = '/v_testing?limit=5'
const not_found = '/not_here'

test('basic fetcher get', async t => {
    const result = await logGet(t, fetcher, host + default_q)
    t.truthy(result.status == 200 || result.status == 206)
});

/*
test('basic badhost fail',  async t => { FIXME
    const result = await logGet(t, fetcher, badhost + default_q)
    t.is(result.status, 'ENOTFOUND')
});
*/

test('basic 404 fail',  async t => {
    const result = await logGet(t, fetcher, host + not_found)
    t.is(result.status, 404)
});

test('basic query',  t => {
    var query = new Query()
    log(query.toSearch())
    t.is('?', query.toSearch())
});

test('paginate query',  t => {
    var query = new Query()
    query.paginate(1, 20)
    log(query.toConfig())
    const conf = query.toConfig()
    t.is('0-19', conf.headers.Range)
    t.is(20, conf.headers.ResultPageSize)
});

test('order query',  t => {
    var query = new Query()
    query.order('i', false)
    t.is('?order=i.desc', query.toSearch())
});

test('raw query',  t => {
    var query = new Query()
    query.raw('i=5')
    t.is('?i=5', query.toSearch())
});

test('limit query',  t => {
    var query = new Query()
    query.limit(20)
    log(query.toSearch())
    t.is('?limit=20', query.toSearch())
});

test('offset query',  t => {
    var query = new Query()
    query.offset(5)
    log(query.toSearch())
    t.is('?offset=5', query.toSearch())
});

test('op query',  t => {
    var query = new Query()
    query.op('gt', 'i', '1')
    log(query.toSearch())
    t.is('?i=gt.1', query.toSearch())
});


