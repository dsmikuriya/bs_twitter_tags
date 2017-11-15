const Promise = require('bluebird')
const _ = require('lodash')

const Category = require('../models/Category')

class BusinessProfiler {
    constructor() {
        this.category_company = '組織'
        this.category_position = '役職'
        this.category_job = '職種・業態'
    }

    /**
     * 組織を取得する
     * @param {string} content - 解析したいテキスト
     * @returns {Promise<Array>} - tagsテーブル型の配列を持ったPromiseが返ってくる
     */
    getCompanies(content) {
        return Category.findOneWithPatterns({ name: this.category_company }).then(category => {
            const models = category.related('patterns').models

            return Promise.reduce(models, (results, model) => {
                const tags = content.match(model.get('pattern'))
                if (tags) {
                    results.push({ pattern: model, tags: tags })
                }

                return results
            }, [])
            .then(values => {
                let companies = []

                values.forEach(value => {
                    value.tags.forEach(tag => {
                        let company = tag.trim().replace(/代表.*?$/, '').replace(/^年/,'').replace(/運営$/,'').replace(/^取締役・/, '').replace(/^現在/, '').replace(/^現/, '')

                        if (company.match(/ of .+?Inc/)) {
                            company = company.replace(/^.+ of /, '')
                        }

                        if (company
                            && !_.find(companies, { name: company })
                            && company !== '株式会社'
                            && company !== '㈱'
                            && company !== '有限会社'
                            && company !== '研究所') {
                            companies.push({ pattern_id: value.pattern.get('id'), name: company })
                        }
                    })
                })

                return companies
            })
        })
    }

    /**
     * 役職を取得する
     * @param {string} content - 解析したいテキスト
     * @returns {Promise<Array>} - tagsテーブル型の配列を持ったPromiseが返ってくる
     */
    getPositions(content) {
        return this.getTags(content, this.category_position)
    }

    /**
     * 職種・業態を取得する
     * @param {string} content - 解析したいテキスト
     * @returns {Promise<Array>} - tagsテーブル型の配列を持ったPromiseが返ってくる
     */
    getJobs(content) {
        return this.getTags(content, this.category_job)
    }

    /** private method */
    getTags(content, categoryName) {
        return Category.findOneWithPatterns({ name: categoryName }).then(category => {
            const models = category.related('patterns').models

            return Promise.reduce(models, (results, model) => {
                /** 正規表現に一致した値のみ保存する(tagテーブル型として) */
                if (content.match(model.get('pattern'))) {
                    results.push({
                        pattern_id: model.get('id'),
                        name: model.get('name')
                    })
                }

                return results
            }, [])
        })
    }

}

module.exports = BusinessProfiler
