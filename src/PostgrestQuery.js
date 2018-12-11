/* @module PostgrestFetcher */

class BaseParam {
    toString() {
        return ''
    }
    toConfig() {
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
        this.page = page
        this.limit = limit
    }

    toConfig() {
        const first = this.limit * (this.page-1)
        const last = this.limit * this.page - 1
        var headers = {}
        headers.Range = `${first}-${last}`
        headers.ResultPageSize = this.limit
        return {headers: headers}
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

/** Convienence object to build up Postgrest Queries */
export default class PostgrestQuery {

    /**postgrest suppported operators  */
    static supported_ops = [
        'eq', 'gt', 'gte', 'lt', 'lte', 'neq', 
        'like', 'ilike', 'is', 'in', 
        'fts', 'plfts', 'pfhts',
        'cs', 'cd',  'ov', 'sl', 'sr', 'nxr', 'nxl', 'adj',
    ]

    constructor() {
        this.params = []
    }

    /** @returns url search part of query */
    toSearch() {
        if (!this.params)
            return ''
        return '?' + (this.params.map(x => x.toString())).join('&')
    }

    /** @returns {object} Returns header and post part of query */
    toConfig() {
        var config = {}
        this.params.map(x => {
            Object.assign(config, x.toConfig())
        })
        return config
    }

    /** removes params */
    clear() {
        this.params = []
    }

    /** adds an order by param
     * @param {string} column
     * @param {bool} [asc=true] sort by ascending order
     * @param {bool} [nulls_last=true] sort with nulls at the bottom
     */
    order(column, asc=true, nulls_last=true) {
        this.params.push(new OrderParam(column, asc, nulls_last))
        return this
    }

    /** add a pagination param
     * @param {number} page - pager number to request
     * @param {limit} limit - how many results per page
    */
    paginate(page, limit) {
        this.params.push(new PaginationParam(page, limit))
        return this
    }

    /** call a rpc type GET call (function must be marked immutable).
     * http://postgrest.org/en/v5.1/api.html#immutable-and-stable-functions
     *  @see {@link http://postgrest.org/en/v5.1/api.html#immutable-and-stable-functions}
     * @param {string} name - the name of the argument
     * @param {string} value - the value of the argument
    */
    argument(name, value) {
        this.params.push(new ValueParam(name, value))
        return this
    }

    /** sets a raw params with no formating
     * @param {string} the exact value of the param
     * @example value="limit=20"
    */
    raw(value) {
        this.params.push(new RawParam(value))
        return this
    }

    /** combine the params of another instance to this instance
     * @param {PostgrestQuery} other
     */
    combine(other) {
        this.params = this.params.concat(other.params)
    }

    /** add a postgrest supported operator
    * @see @link{http://postgrest.org/en/v5.1/api.html#horizontal-filtering-rows} for supported names
    * @param {string} opname - postgrest operator name
    * @param {string} name - column name
    * @param {string} value
    * @param {bool} [not=false] negates operator
    * @throws error if opname not in supported_ops
    */
    op(opname, name, value, not=false) {
        if (!this.constructor.supported_ops.includes(opname))
            throw `PostgrestQuery: ${opname} not supported`
        if (not)
            opname = 'not.' + name
        this.params.push(new Param(opname, name, value))
        return this
    }

    /** add a limit clause to the query
     * @param {number} number
    */
    limit(number) {
      this.params.push(new ValueParam('limit', number))
    }
    /** add a offset clause to the query
     * @param {number} number
    */
    offset(number) {
      this.params.push(new ValueParam('offset', number))
    }
}

