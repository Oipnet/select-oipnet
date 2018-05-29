const Mustache = require('mustache');
const debounce = require('debounce');
const axios = require('axios');

class SelectAjax {
    constructor(selector, opts) {
        this.selector = selector
        this.opts = opts

        this.selectedElements = document.querySelectorAll(selector);
        this.template = document.querySelector(this.opts.template).innerHTML;
        Mustache.parse(this.template);

        this.selectedElements.forEach((elt) => {
            this.addOnKeyUpEvent(elt)
        })
    }
    addOnKeyUpEvent(elt) {
        elt.addEventListener('keyup', debounce((e) => {
            const elt = e.target
            this.getDatas().then(datas => {
                const template = Mustache.render(this.template, { datas: datas.data })
                const newElt = document.createRange().createContextualFragment(template);
                newElt.querySelector('div').id = 'select-ajax-result'
                const result = document.querySelector('#select-ajax-result')
                if (result) {
                    result.parentNode.removeChild(result);
                }
                
                elt.parentNode.insertBefore(newElt, elt.nextSibling);
            });
        }, 250));
    }
    getDatas() {
        if (this.opts.datas) {
            return new Promise((resolve) => {
                resolve({ data: this.opts.datas })
            });
        }

        return axios.get('https://jsonplaceholder.typicode.com/posts');
    }
}

module.exports = SelectAjax