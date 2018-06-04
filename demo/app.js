const SelectAjax = require('../src/js/selecta');

const transform = (datas) => {
    datas = JSON.parse(datas)
    return datas.map(d => {
        return {
            'id': d.id,
            'value': d.title
        }
    }).slice(0, 20)
}
new SelectAjax('.select-ajax', { url: 'https://jsonplaceholder.typicode.com/posts', transformer: transform, name: 'select-ajax'})