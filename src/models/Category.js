const Pattern = require('./Pattern')

module.exports = require('./Model').extend({
    tableName: 'categories',
    hasTimestamps: true,
    patterns: function () {
        return this.belongsToMany(Pattern, 'categories_patterns')
    }
}, {
    findOneWithPatterns: function (query) {
        return this.findOne(query, { withRelated: ['patterns'] })
    },

    /** マスタに登録されているcategoryおよびpatternを全て取得 */
    findAllWithPatterns: function (query) {
        return this.findAll(query, { withRelated: ['patterns'] })
    }
})
