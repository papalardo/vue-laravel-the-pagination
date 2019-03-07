
<template>
    <div class="the-paginatable-lib-dev">
        <button @click.prevent="query.status = query.status == 0 ? 1 : 0">Change Status {{ query.status }}</button>

        <input type="text" v-model="query.termToSearch" placeholder="Term to search..">
        {{ loader ? 'Loading..' : 'Done' }}

        <ThePagination 
            url="paginate"
            :query="query" 
            :config="paginateConfig"
            @loading="res => loader = res"
            @getData="res => list = res"
        >
        </ThePagination>

        <p>Results</p>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in list" :key="index">
                    <td>{{ item.name }}</td>
                    <td>{{ item.email }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import Vue from 'vue'
import ThePagination from './entry';

Vue.use(ThePagination, { 
    nameComponent: 'ThePagination',
    baseURL: 'http://127.0.0.1:8000/api',
    config: {
        headers: { 
            'Authorization': 'Bearer ...',
            'Accept': 'application/json'
        }
    }
})

export default {
    name:  'ThePaginationLibDev', // vue library dev component
    data() {
        return {
            loader: false,
            list: [],
            query: {
                per_page: 5,
                termToSearch: '',
                status: 0,
            },
            paginateConfig: {
                headers: { 
                    'OVERWRITE': 'THIS OVERWRITE DEFAULT CONFIG',
                }
            }
        }
    }
}
</script>

<style scoped>
.the-paginatable-lib-dev {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    min-height: 40vh;
}

.the-paginatable-lib-dev table {
    display: block;
    max-height: 20vh;
    overflow: scroll;
}
</style>
