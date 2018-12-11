/* @module PostgrestFetcher */
import axios from 'axios'

const pretty = (obj) => JSON.stringify(obj, null, 2); // spacing level = 2

/** Non-200 class error */
class PostgrestError {

    constructor(error){
        /** axios http status */
        this.status = (error.response && error.response.status) || error.errno
        /** axios response */
        this.response = error.response
        /** postgres message */
        this.statusMsg = (error.response && error.response.data && error.response.data.message) || (error.response && error.response.statusText) 
        /** postgres message details */
        this.statusDetails = error.response && error.response.data && error.response.data.details
        /** postgres message hint */
        this.statusHint =  error.response && error.response.data && error.response.data.hint
    }
}

/**Class returned from PostgrestFetcher promise (not exported). */
class PostgrestResponse {

    /** @private */
    constructor(response, page_size) {

        /** @member {number} */
        this.status = parseInt(response.status)
        if (this.status == 206) {
            this.pagination = true
        } else if (this.status != 200)
            this.config.warn("non 200 response: " + this.status + response.headers['content-location'])

        /** @member {object} */
        this.headers = response.headers
        if (this.headers['content-range']) {
            let res = this.headers['content-range'].split('/')
            this.count = res[1] != '*' ? parseInt(res[1]) : null
            res = res[0].split('-')
            this.first = parseInt(res[0])
            this.last = parseInt(res[1])

            if (page_size && this.count) {
                this.page_count = Math.floor(this.count / page_size)
                if (this.count % page_size)
                   this.page_count += 1
            } else
                this.page_count = null
        }

        /** @member {object} */
        this.data = response.data
    }
}


/** Fetches Postgrest results.
 * @param {Object} config - configure
 * @param {Boolean} [config.count=true] - request Postgrest run a seperate count query and return it in the results
 * @param {Boolean} [config.debug=false] - extra debugging info sent to logger
 * @param {function} [config.log=console.log] - logging function
 * @param {function} [config.warn=console.warn] - warning function
*/
export default class PostgrestFetcher {
    constructor(config) {
        this.config = {}
        this.config.count = config.count || true
        this.config.debug = config.debug || false
        this.config.log = config.log || console.log
        this.config.warn = config.warn || console.warn
    }

    /** @async returns promise from axios.get
     * @param {string} url - passed to axios.get
     * @param {object} config - headers and post data passed to axios.get
     * @returns {Promise} - PostgrestResult object or throws on failure
     * @throws {PostgrestError}
    */
    get(url, config={}) {

        if (!config.headers)
            config.headers = {}

        if (this.config.count) {
            config.headers.Prefer = 'count=exact'
        }
        if (this.config.debug) {
            this.config.log(`PostgrestFetcher.get: url:${url} config:${pretty(config)}`)
        }
        
        return axios.get(url, config)
            .then(response => new PostgrestResponse(response, Number(config.headers.ResultPageSize)))
            .catch(error => { throw (PostgrestError(error))})
	}
}
