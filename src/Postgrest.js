import axios from 'axios'

import Config from './config'

class Param {

    constructor(op, column, val) {
        this.op = String(op)
        this.column = String(column)
        this.val = String(val)
    }
    toString() {
        return this.column + '=' + this.op + '.' + this.val
    }
}

class ValueParam {
    constructor(op, val) {
        this.op = String(op)
        this.val = String(val)
    }
    toString() {
        return this.op + '=' + this.val
    }
}

class OrderParam {

    constructor(column, asc, nulls_last) {
        this.column = String(column)
        this.asc = asc ? true : false
        this.nulls_last = nulls_last ? true : false
    }
    toString() {
        return (`order=${this.column}${this.asc ? '' : '.desc'}${this.nulls_last ? '' : '.nullslast'}`)
    }
}

class RawParam {
    constructor(value) {
        this.value = String(value)
    }

    toString() {
        return this.value
    }
}


export class Query {

    constructor() {
        this.params = []
    }

    toString() {
        if (!this.params)
            return ''
        return '?' + (this.params.map(x => x.toString())).join('&')
    }

    clear() {
        this.params = []
    }

    order(column, asc=true, nulls_last=true) {
        this.params.push(new OrderParam(column, asc, nulls_last))
        return this
    }

    raw(value) {
        this.params.push(new RawParam(value))
        return this
    }

    combine(other) {
        this.params.push(other.params)
    }
}

const ops = ['eq', 'gt', 'lt', 'gte', 'lte', 'like', 'ilike', 'is', 'in', 'not', 'fts', 'plfts', 'pfhts']

ops.forEach(filter =>
  Query.prototype[filter] = function filterValue (name, value) {
      this.params.push(new Param(filter, name, value))
      return this
  }
)

const value_ops = ['limit', 'offset']

value_ops.forEach(filter =>
  Query.prototype[filter] = function filterValue (value) {
      this.params.push(new ValueParam(filter, value))
      return this
  }
)

export class Adapter {
    constructor(host, exact_count=true) {
        this.host = host 
        this.exact_count = exact_count
    }

    get(q, first=null, last=null) {
        let params = this.exact_count ? {headers : { Prefer: 'count=exact', 'Cache-Control': 'public, max-age=3600,  s-max-age=3600'}} : { headers :{}}
        let config = {}
        if (first !== null || last !== null) {
            params.headers.Range = `${first}-${last}`
        }

        Config.log('Adapter.get', this.host + q, params)
        return axios.get(this.host + q, params, config)
            .then(response => new Response(response))
            .catch(error => this.on_error(error))
	}

    on_error(error) {

        //console.log(Object.getOwnPropertyNames(error.request.socket))
        var path = null
        if (error.request.socket)
            path = (`${error.request.method} ${error.request.socket._host} ${error.request.path} `)
        else
            path = ''
        
        console.error(`Adapter: ${path}${error.message}`)
        if (error.response && error.response.data && error.response.data.message) {
            console.error("Adapter:" + error.response.data.message)
            if (error.response.data.details)
                console.error("Adapter:" + error.response.data.details)
        }
        throw ("Adapter: request failed", error)

    }
}

export class Response {

    constructor(response) {
        this.status = parseInt(response.status)
        this.pagination = false
        if (this.status == 206) {
            this.pagination = true
        } else if (this.status != 200)
            console.warn("non 200 response: " + this.status + response.headers['content-location'])

        this.headers = response.headers
        let res = this.headers['content-range'].split('/')
        this.count = res[1] != '*' ? parseInt(res[1]) : null
        res = res[0].split('-')
        this.first = parseInt(res[0])
        this.last = parseInt(res[1])
        this.data = response.data
    }
}

export class Pagination {
    constructor(host, view, limit) {
        if (!host)
            throw 'host var should be non-empty string'
        if (!view)
            throw 'view var should be non-empty string'
        this.adapter = new Adapter(host)
        this.view  = view.charAt(0) == '/' ? view : '/' + view
        this.limit = limit
        this.reset()
    }

    reset() {
        this.query = null
        this.page_count = null
        this.pages = null
        this.count = null
    }

    set_query(query) {
        if (this.query != query)
            this.reset()
        this.query = query
    }

    get(page=1) {
        if (this.query === null) {
            throw 'Pagination: set_query(q) has to be called before get()'
        }
        if (page < 1)
            throw 'page must be greater than 0'
            /*
		if (this.pages !== null && this.pages[page]) {
            console.log('cached')
			return new Promise( resolve(this.pages[page]))
		}
        */
        let range = this.get_range(page)
        return this.adapter.get(this.view + this.query, range[0], range[1])
            .then(response => this.pages === null ? this.init_pages(page, response) : this.on_response(page, response))
    }

    init_pages(page, response) {
        if (response) {
            this.page_count = Math.floor(response.count / this.limit)
            if (response.count % this.limit)
                this.page_count += 1
            this.pages = Array.apply(null, Array(this.page_count))
            return this.on_response(page, response)
        }
    }

    on_response(page, response) {
        this.pages[page] = response
        this.count = response.count
        response.pagenum = page
        response.page_count = this.page_count
        return response
    }

    get_range(page) {
        let n = (page-1) * this.limit
        return [n, n+this.limit-1]
    }
}


