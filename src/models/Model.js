const config = require('config')
const knex = require('knex')(config.get('database'))
const bookshelf = require('bookshelf')(knex)
const bookshelfBase = require('bookshelf-modelbase')(bookshelf)

bookshelf.plugin('pagination')
bookshelf.plugin(require('bookshelf-modelbase').pluggable)

module.exports = bookshelfBase.extend({
    initialize: function () {
        //this.on('fetching', this._fetching);
        //this.on('fetching:collection', this._fetchingCollection);
        //this.on('fetched', this._fetched);
        //this.on('fetched:collection', this._fetched:collection);
        //this.on('creating', this._creating);
        //this.on('created', this._created);
        //this.on('updating', this._updating);
        //this.on('updated', this._updated);
        //this.on('saving', this._saving);
        //this.on('saved', this._saved);
        //this.on('destroying', this._destroying);
        //this.on('destroyed', this._destroyed);
    }
}, {
    transaction: function(t) {
        return bookshelf.transaction(t)
    }
})
