import axios from 'axios'

const pretty = (obj) => JSON.stringify(obj, null, 2); // spacing level = 2

class PostgrestResponse {

    constructor(response, page_size) {

        this.status = parseInt(response.status)
        if (this.status == 206) {
            this.pagination = true
        } else if (this.status != 200)
            console.warn("non 200 response: " + this.status + response.headers['content-location'])

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

        this.data = response.data
    }
}


export default class PostgrestFetcher {
    constructor(config) {
        this.config = {}
        this.config.count = config.count || true
        this.config.debug = config.debug || false
        this.config.console = config.console || console
    }

    get(url, config={}) {

        if (!config.headers)
            config.headers = {}

        if (this.config.count) {
            config.headers.Prefer = 'count=exact'
        }
        if (this.config.debug) {
            this.config.console.log(`PostgrestFetcher.get: url:${url} config:${pretty(config)}`)
        }
        
        return axios.get(url, config)
            .then(response => new PostgrestResponse(response, Number(config.headers.ResultPageSize)))
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
