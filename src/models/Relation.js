const User = require('./User')

module.exports = require('./Model').extend({
    tableName: 'relations',
    hasTimestamps: true,
    fromUsers: function () {
        return this.hasMany(User, 'from_id', 'id')
    },
    toUsers: function () {
        return this.hasMany(User, 'to_id', 'id')
    }
})
