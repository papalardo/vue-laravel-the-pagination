[![Travis](https://travis-ci.org/papalardo/vue-laravel-the-pagination.svg?branch=master)](https://travis-ci.org/papalardo/vue-laravel-the-pagination)
[![Version](https://img.shields.io/npm/v/vue-laravel-the-pagination.svg)](https://www.npmjs.com/package/vue-laravel-the-pagination)
[![Downloads](https://img.shields.io/npm/dt/vue-laravel-the-pagination.svg)](https://www.npmjs.com/package/vue-laravel-the-pagination)

# Laravel VueJs ThePagination
A Vue.js pagination simple component for Laravel paginators.

## Requirements

* [Vue.js](https://vuejs.org/) 2.x
* [Laravel](http://laravel.com/docs/) 5.x

## Simple example

![Simple example](https://media.giphy.com/media/1b5u0PG7rgRzQbFHI9/giphy.gif) 

## Install

```bash
npm install vue-laravel-the-pagination
```

## Usage

Register the component:

```javascript
import Vue from 'vue'
import ThePagination from 'vue-laravel-the-pagination';

Vue.use(ThePagination, { // Default config (optional)
    nameComponent: 'ThePagination', // Change name component default: (ThePagination or the-pagination)
    baseURL: 'http://127.0.0.1:8000/api', // Base URL to request
    config: {
        headers: { 
            'Authorization': 'Bearer ...',
            'Accept': 'application/json'
        }
    }
})
```

Use the component:

```html
<the-pagination 
    url="paginate"
    :query="query" 
    :config="paginateConfig"
    @loading="res => loader = res"
    @getData="res => list = res"
/>
```

```javascript
export default {
    data: () => ({
        loader: false,
        list: [],
        query: {
            per_page: 5,
            termToSearch: '',
            status: 0,
            // ADD HERE ALL PARAMS TO GET REQUEST
            // QUERY IS WATCHED, WHEN CHANGE, WILL MAKE NEW REQUEST
        },
        paginateConfig: {
            headers: { 
                'OVERWRITE': 'THIS OVERWRITE DEFAULT CONFIG',
            }
        }
    })
}
```

### Customizing Prev/Next Buttons

Prev/Next buttons can be customized using the `first-page`, `prev-page`, `next-page` and `last-page` slots:

```html
<the-pagination>
    <span slot="first-page || prev-page || next-page || last-page"> Label </span>
<the-pagination>
```

### Example in Laravel

![Backend like this](https://i.ibb.co/r5c1Z4f/Captura-de-Tela-2019-03-06-a-s-22-32-07.png) 

## API

### Props

| Name | Type | Description |
| --- | --- | --- |
| `url` | String | (required) Endpoint for make request
| `query` | Object | (optinal) Watched Object to be params request
| `intervalMaxNumbers` | Number | (default: 5) Qty numbers to show in pagination (can be unpaired)
| `config` | Object | Object to config component

### Events

| Name | Return | Description |
| --- | --- | --- |
| `loading` | Boolean | Return status request
| `getData` | Array | Return data with list request
