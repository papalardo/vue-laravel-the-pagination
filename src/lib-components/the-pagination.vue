<template>
    <div class="pagination">
        <button class="pagination__button pagination__button--first-page" @click="get()" :disabled="paginate.current_page <= 1">
            <slot name="first-page">&laquo;</slot>
        </button>
        <button class="pagination__button pagination__button--prev-page" @click="get(paginate.current_page - 1)" :disabled="paginate.current_page <= 1">
            <slot name="prev-page">&lsaquo;</slot>
        </button>
        <button class="pagination__button" v-for="(nr, index) in interval" @click="get(nr)" :key="index" :class="[{'active': paginate.current_page == nr}]">{{ nr }}</button>
        <button class="pagination__button pagination__button--next-page" @click="get(paginate.current_page + 1)" :disabled="paginate.current_page >= paginate.last_page">
            <slot name="next-page">&rsaquo;</slot>
        </button>
        <button class="pagination__button pagination__button--last-page" @click="get(paginate.last_page)" :disabled="paginate.current_page >= paginate.last_page">
            <slot name="last-page">&raquo;</slot>
        </button>
    </div>
</template>

<script>
    const buildURLQuery = obj => Object.entries(obj).map(pair => pair.map(encodeURIComponent).join('=')).join('&');

    const validURL = str => { 
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return !!pattern.test(str);
    }

    export default {
        props: {
            query: {
                type: Object,
            },
            url: {
                type: String,
                required: true,
            },
            intervalMaxNumbers: {
                type: Number,
                default: () => 5
            },
            config: {
                type: Object
            }
        },
        data() {
            return {
                paginate: {
                    data: [],
                    current_page: 0,
                    last_page: 0,
                    per_page: 0,
                    total: 0,
                },
                interval: [1],
                buzy: false,
                request: null,

                baseConfig: null,
                baseUrl: null,
            }
        },
        computed: {
            _config() {
                return Object.assign({
                        headers: [],
                        customEventName: {
                            loading: 'loading',
                            getData: 'getData',
                        }
                    },
                    this.baseConfig,
                    this.config)
            },
            _query() {
                return Object.assign({
                    per_page: 20
                }, this.query)
                // return {
                    // per_page: 20,
                    // ...this.query
                // }
            }
        },
        watch: {
            '_query'() {
                this.get(1, true)
            }
        },
        mounted() {
            this.get()
        },
        methods: {
            getInterval() {
                let totalItens = this.paginate.total
                let perPage = this.paginate.per_page
                let currentPage = this.paginate.current_page
                let maxShowingNumbers = this.intervalMaxNumbers
    
                let lastPage = Math.ceil(totalItens / perPage)
    
                if (totalItens < 0) {
                    console.error(`Total of itens cant be less or equal than 0`)
                    return;
                } else if (lastPage > 0 && currentPage > lastPage) {
                    console.error(`Current page [${currentPage}] cant be bigger than last page [${lastPage}]`)
                    return;
                }
    
                function getRange(start, end, step = 1) {
                    let len = Math.floor((end - start) / step) + 1
                    return Array(len).fill().map((_, idx) => start + (idx * step))
                }
    
                let interval = lastPage > 0 ?
                    getRange(
                        Math.max(1, Math.min(lastPage - maxShowingNumbers + 1, currentPage - Math.floor(maxShowingNumbers / 2))),
                        Math.min(lastPage, Math.max(maxShowingNumbers, Math.min(lastPage, currentPage + Math.floor(maxShowingNumbers / 2)))),
                    ) : [1]
    
                this.interval = interval
            },
            get(page = 1, forceRequest) {
                if(page === this.paginate.current_page && !forceRequest) return;

                this.paginate.current_page = page;
                this.getInterval()

                let queryToString = buildURLQuery(Object.assign({page}, this._query))
                // let queryToString = buildURLQuery({
                //     page,
                //     ...this._query
                // })

                let url = this.baseURL ? `${this.baseURL}/${this.url}?${queryToString}` : `${this.url}?${queryToString}`

                if(!validURL(url)) {
                    console.error('URL to request is not valid. Verify prop ->url<- and/or default config ->baseURL<-')
                    return;
                }

                this.makeRequest(url)
                    .then(res => {
                        this.$emit(this._config.customEventName.getData, res.data)

                        this.paginate = Object.assign(this.paginate,res)
                        // this.paginate = {
                        //     ...this.paginate,
                        //     ...res
                        // }
                        this.getInterval()
                    })
            },
            makeRequest(url) {
                let self = this
                return new Promise((resolve, reject) => {
                    var xhr = typeof XMLHttpRequest != 'undefined' ?
                        new XMLHttpRequest() :
                        new ActiveXObject('Microsoft.XMLHTTP');
                    xhr.open('get', url, true);

                    
                    Object.entries(self._config.headers).map(val => xhr.setRequestHeader(val[0], val[1]))
    
                    xhr.onreadystatechange = function() {
                        var status;
                        var data;

                        if (xhr.readyState == 4) { // `DONE`
                            status = xhr.status;
                            if (status == 200) {
                                data = JSON.parse(xhr.responseText);
                                resolve(data)
                            } else {
                                reject(status)
                            }

                            self.request = null
                            self.$emit(self._config.customEventName.loading, false)
                        }
                    };

                    self.request && self.request.abort();

                    self.request = xhr;
                    xhr.send();
                    self.$emit(self._config.customEventName.loading, true)

                })
            }
        }
    }
</script>

<style scoped>
    .pagination {
        display: inline-block;
    }
    
    .pagination__button {
        cursor: pointer;
        color: black;
        float: left;
        padding: 8px 16px;
        text-decoration: none;
        border: 1px solid #ddd;
        outline: none;
    }
    .pagination__button:disabled:not(.active),
    .pagination__button[disabled]:not(.active) {
        background-color: #cccccc;
        border: 1px solid #cccccc;
        color: #666666;
        cursor: not-allowed;
    }
    .pagination__button.active {
        background-color: #4CAF50;
        color: white;
        border: 1px solid #4CAF50;
    }
    
    .pagination__button:hover:not(.active):not(:disabled) {
        background-color: #ddd;
    }
    
    .pagination__button:first-child {
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
    }

    .pagination .pagination__button:last-child {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
    }
    
    /* .pagination__button--first-page::before { content: '\00AB' }
    .pagination__button--next-page::before { content: '\203A' }
    .pagination__button--prev-page::before { content: '\2039' }
    .pagination__button--last-page::before { content: '\00BB' } */
    
</style>