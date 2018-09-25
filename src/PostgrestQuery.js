


class BaseParam {
    toString() {
        return ''
    }
    toHeaders() {
        return {}
    }
}

class Param extends BaseParam {

    constructor(op, column, val) {
        super()
        this.op = String(op)
        this.column = String(column)
        this.val = String(val)
    }
    toString() {
        return this.column + '=' + this.op + '.' + this.val
    }
}

class ValueParam  extends BaseParam{
    constructor(op, val) {
        super()
        this.op = String(op)
        this.val = String(val)
    }
    toString() {
        return this.op + '=' + this.val
    }
}

class OrderParam extends BaseParam {

    constructor(column, asc, nulls_last) {
        super()
        this.column = String(column)
        this.asc = asc ? true : false
        this.nulls_last = nulls_last ? true : false
    }
    toString() {
        return (`order=${this.column}${this.asc ? '' : '.desc'}${this.nulls_last ? '' : '.nullslast'}`)
    }
}

class PaginationParam extends BaseParam {

    constructor(page, limit) {

        super()
        this.limit = Math.floor(Number(limit))
        this.page = Math.floor(Number(page))

        if (this.limit < 1)
            throw 'Pagination: limit must be greater than 0'
        if (this.page < 1)
            throw 'Pagination: page must be greater than 0'
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

class RawParam extends BaseParam {
    constructor(value) {
        super()
        this.value = String(value)
    }

    toString() {
        return this.value
    }
}


export default class PostgrestQuery {

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

    toRequest () {
        return {
            string: this.toSearch(),
            header: this.toHeaders,
        }
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
  PostgrestQuery.prototype[filter] = function filterValue (name, value) {
      this.params.push(new Param(filter, name, value))
      return this
  }
)

const value_ops = ['limit', 'offset']

value_ops.forEach(filter =>
  PostgrestQuery.prototype[filter] = function filterValue (value) {
      this.params.push(new ValueParam(filter, value))
      return this
  }
)

