const Pattern = require('./Pattern')
const User = require('./User')

module.exports = require('./Model').extend({
    tableName: 'tags',
    hasTimestamps: true,
    pattern: function () {
        return this.belongsTo(Pattern)
    },
    users: function () {
        return this.belongsToMany(User, 'tags_users')
    }
}, {
})
