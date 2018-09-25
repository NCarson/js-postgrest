import axios from 'axios'

class Param {

    constructor(op, column, val) {
        this.op = String(op)
        this.column = String(column)
        this.val = String(val)
    }
    toString() {
        return this.column + '=' + this.op + '.' + this.val
    }

    toHeaders() {
        return {}
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

    toHeaders() {
        return {}
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

    toHeaders() {
        return {}
    }
}

class PaginationParam {

    constructor(page, limit) {

        this.limit = Math.floor(Number(limit))
        this.page = Math.floor(Number(page))

        if (this.limit < 1)
            throw 'Pagination: limit must be greater than 0'
        if (this.page < 1)
            throw 'Pagination: page must be greater than 0'
    }

    toString() {
        return ''
    }

    toHeaders() {
        const first = this.limit * (this.page-1)
        const last = this.limit * this.page - 1
        var headers = {}
        headers.Range = `${first}-${last}`
        headers.ResultPageSize = this.limit
        return headers
    }
}

class RawParam {
    constructor(value) {
        this.value = String(value)
    }

    toString() {
        return this.value
    }

    toHeaders() {
        return {}
    }
}


export class Query {

    constructor() {
        this.params = []
    }

    toSearch() {
        if (!this.params)
            return ''
        return '?' + (this.params.map(x => x.toString())).join('&')
    }

    toHeaders() {
        var headers = {}
        this.params.map(x => Object.assign(headers, x.toHeaders()))
        return headers
    }

    clear() {
        this.params = []
    }

    order(column, asc=true, nulls_last=true) {
        this.params.push(new OrderParam(column, asc, nulls_last))
        return this
    }

    paginate(page=1, limit=20) {
        this.params.push(new PaginationParam(page, limit))
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


export class Fetcher {
    constructor(debug=false) {
        this.debug = debug
    }

    get(href, headers={}, count=false) {

        let config = {}
        let params = {headers:{}}

        Object.assign(params.headers, headers)
        if (count) {
            params.headers.Prefer = 'count=exact'
        }

        console.log(href, params)

        //this.debug && console.log('Fetcher.get', href, params)
        return axios.get(href, params, config)
            .then(response => new Response(response, headers.ResultPageSize))
            .catch(error => this.onError(error))
	}

    onError(error) {
        var new_error = {
            status: (error.response && error.response.status) || error.errno,
            statusMsg : (
                (error.response && error.response.data && error.response.data.message)
                || (error.response && error.response.statusText) 
                || error.code),
            statusDetails:  error.response && error.response.data && error.response.data.details,
            statusHint:  error.response && error.response.data && error.response.data.hint,
        }
        throw (new_error)
    }
}

    /*
    count(page, response) {
        //FIXME
        if (response) {
            this.page_count = Math.floor(response.count / this.per_page)
            if (response.count % this.per_page)
                this.page_count += 1
        }
    }
    */

export class Response {

    constructor(response, page_size) {

        //console.log('page size', page_size)
        this.status = parseInt(response.status)
        if (this.status == 206) {
            this.pagination = true
        } else if (this.status != 200)
            console.warn("non 200 response: " + this.status + response.headers['content-location'])

        this.headers = response.headers
        //console.log(this.headers)
        if (this.headers['content-range']) {
            let res = this.headers['content-range'].split('/')
            this.count = res[1] != '*' ? parseInt(res[1]) : null
            res = res[0].split('-')
            this.first = parseInt(res[0])
            this.last = parseInt(res[1])

            if (page_size && this.count) {
                this.page_count = Math.floor(this.count / page_size)
                //if (this.count % page_size)
                //   this.page_count += 1
            } else
                this.page_count = null
        }
        //console.log('page count', this.page_count)
        this.data = response.data
    }
}

