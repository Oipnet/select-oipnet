const Mustache = require('mustache');
const debounce = require('debounce');
const axios = require('axios');
const fs = require('fs')

class SelectAjax {
    constructor(selector, opts = {}) {
        this.selector = selector
        this.opts = opts
        this.selectedElements = -1;
        this.currentElement = -1;
        this.search = '';
        this.name = opts.name || ''

        this.selectedElements = document.querySelectorAll(selector);
        this.loadTemplate().then(template => {
            this.template = template;
            
            Mustache.parse(this.template);

            this.selectedElements.forEach((elt) => {
                this.addOnKeyUpEvent(elt)
                this.addCloseOnOuterClick(elt)
                this.addKeyDownOrUpPressEvent(elt)
            })
        });
    }
    addOnKeyUpEvent(elt) {
        elt.addEventListener('keyup', debounce((e) => {
            if (e.target.value === this.search) {
                return;
            }

            const elt = e.target
            this.search = elt.value
            this.getDatas().then(datas => {
                const template = Mustache.render(this.template, { datas: datas.data })
                const newElt = document.createRange().createContextualFragment(template);
                newElt.querySelector('div').id = 'selecta-result'
                const result = document.querySelector('#selecta-result')
                if (result) {
                    result.parentNode.removeChild(result);
                }
                
                let hiddenId = document.createElement('input');
                hiddenId.setAttribute('type', 'hidden');
                hiddenId.setAttribute('id', 'selecta-hidden');
                hiddenId.setAttribute('name', this.name);
                elt.parentNode.prepend(hiddenId)
                elt.parentNode.insertBefore(newElt, elt.nextSibling);
                this.addHoverEvent(elt)
            });
        }, 250));
    }
    addCloseOnOuterClick(elt) {
        document.addEventListener('click', (event) => {
            if(! event.target.closest('#selecta-result')) {
                if (document.querySelector('#selecta-result')) {
                    const selected = document.querySelector('#selecta-result .selected');
                    elt.value = selected.getAttribute('data-value')
                    document.querySelector('#selecta-hidden').value = selected.getAttribute('data-id')
                    document.querySelector('#selecta-result').remove()
                    this.selectedElements = -1
                }
            }
        });
    }
    addKeyDownOrUpPressEvent(elt) {
        document.addEventListener('keydown', (event) => {
            event.stopPropagation()
            if (! document.querySelector('#selecta-result')) {
                return
            }

            if (event.keyCode === 40 || event.keyCode === 38) {
                const selected = document.querySelector('#selecta-result .selected')
                if (selected) {
                    selected.classList.remove('selected')
                }
                
                (event.keyCode === 40)?this.currentElement++:this.currentElement--

                const results = document.querySelectorAll('#selecta-result li')

                if (this.currentElement >= results.length) {
                    this.currentElement = 0;
                }
                
                if (this.currentElement < 0) {
                    this.currentElement = results.length - 1;
                }

                const current = results[this.currentElement];
                current.classList.add('selected');
                current.querySelector('a').focus()

                event.preventDefault()
            }
        })
    }
    addHoverEvent(elt) {
        const lis = document.querySelectorAll('#selecta-result li');

        lis.forEach((li) => {
            li.addEventListener('mouseenter', (e) => {
                //e.stopPropagation();
                const selected = document.querySelector('#selecta-result .selected')
                if (selected) {
                    selected.classList.remove('selected')
                }
                e.target.classList.add('selected')
                const lis = e.target.parentNode.querySelectorAll('li');

                lis.forEach((li, indice) => {
                    if (li.classList.contains('selected')) {
                        this.currentElement = indice;
                    }
                })
            })
        })
    }
    getDatas() {
        if (this.opts.datas) {
            return new Promise((resolve) => {
                resolve({ data: this.opts.datas })
            });
        }

        if (! this.opts.transformer) {
            this.opts.transformer = (datas => datas)
        }

        return axios.get(this.opts.url, {
            transformResponse: this.opts.transformer
        });
    }
    loadTemplate() {
        if (this.opts.template) {
            return new Promise((resolve) => {
                resolve(document.querySelector(this.opts.template).innerHTML)
            });
        }

        return new Promise((resolve) => {
            resolve(fs.readFileSync(__dirname + '/../tpl/default-template.tpl', 'utf8'));
        });
    }
}

module.exports = SelectAjax