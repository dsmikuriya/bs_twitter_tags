const Promise = require('bluebird')

const Tag = require('./Tag')
const TagUser = require('./TagUser')

module.exports = require('./Model').extend({
    tableName: 'users',
    hasTimestamps: true,
    tags: function () {
        return this.belongsToMany(Tag, 'tags_users')
    }
}, {
    findOneWithTags: function (query) {
        return this.findOne(query, { withRelated: ['tags'] })
    },

    findAllWithTags: function (query) {
        return this.findAll(query, { withRelated: ['tags'] })
    },

    findOrCreateWithTags: function (userObject, tagObjects) {
        return new Promise((resolve, reject) => {
            const where = { user_id: userObject.user_id }
            return resolve(this.findOrCreate(where, { defaults: userObject }))
        })
        .then(user => {
            return Promise.mapSeries(tagObjects, tagObject => {
                const where = { name: tagObject.name }
                return Tag.findOrCreate(where, { defaults: tagObject })
            })
            .then(tags => {
                return Promise.mapSeries(tags, tag => {
                    const data = { tag_id: tag.get('id'), user_id: user.get('id') }
                    TagUser.findOrCreate(data, { defaults: data })
                })
                .then(() => {
                    return tags
                })
            })
            .then(results => {
                user.related('tags').set(results)
                return user
            })
        })
    }
})
