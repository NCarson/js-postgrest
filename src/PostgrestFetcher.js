import axios from 'axios'

class PostgrestResponse {

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


export default class PostgrestFetcher {
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
        //console.log(href, params)
        //this.debug && console.log('Fetcher.get', href, params)
        return axios.get(href, params, config)
            .then(response => new PostgrestResponse(response, headers.ResultPageSize))
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
