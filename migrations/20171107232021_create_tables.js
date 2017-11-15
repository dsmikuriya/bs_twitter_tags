
exports.up = (knex, Promise) => {
    return Promise.resolve().then(() => {
        /** users */
        return knex.schema.createTable('users', t => {
            t.increments('id').unsigned().primary()
            t.bigInteger('user_id').notNullable()
            t.string('screen_name').notNullable()
            t.string('name').notNullable()
            t.integer('follower_count')
            t.integer('friend_count')
            t.text('description')
            t.string('url')
            t.string('location')
            t.timestamps()
            t.unique('user_id')
        }).raw('ALTER TABLE users AUTO_INCREMENT = 1001;')
    })
    .then(() => {
        /** categories */
        return knex.schema.createTable('categories', t => {
            t.increments('id').unsigned().primary()
            t.string('name').notNullable()
            t.timestamps()
            t.unique('name')
        }).raw('ALTER TABLE categories AUTO_INCREMENT = 1001;')
    })
    .then(() => {
        /** patterns */
        return knex.schema.createTable('patterns', t => {
            t.increments('id').unsigned().primary()
            t.string('name').notNullable()
            t.text('pattern').notNullable()
            t.boolean('is_extract').notNullable()
            t.timestamps()
        }).raw('ALTER TABLE patterns AUTO_INCREMENT = 1001;')
    })
    .then(() => {
        /** tags */
        return knex.schema.createTable('tags', t => {
            t.increments('id').unsigned().primary()
            t.integer('pattern_id').unsigned().references('id').inTable('patterns').onUpdate('CASCADE')
            t.string('name').notNullable()
            t.timestamps()
            t.unique('name')
        }).raw('ALTER TABLE tags AUTO_INCREMENT = 1001;')
    })
    .then(() => {
        /** tags_users */
        return knex.schema.createTable('tags_users', t => {
            t.increments('id').unsigned().primary()
            t.integer('tag_id').unsigned().references('id').inTable('tags').onUpdate('CASCADE')
            t.integer('user_id').unsigned().references('id').inTable('users').onUpdate('CASCADE')
            t.unique(['tag_id', 'user_id'])
        }).raw('ALTER TABLE tags_users AUTO_INCREMENT = 1001;')
    })
    .then(() => {
        /** categories_patterns */
        return knex.schema.createTable('categories_patterns', t => {
            t.increments('id').unsigned().primary()
            t.integer('category_id').unsigned().references('id').inTable('categories').onUpdate('CASCADE')
            t.integer('pattern_id').unsigned().references('id').inTable('patterns').onUpdate('CASCADE')
            t.unique(['category_id', 'pattern_id'])
        }).raw('ALTER TABLE categories_patterns AUTO_INCREMENT = 1001;')
    })
    .then(() => {
        /** relations */
        return knex.schema.createTable('relations', t => {
            t.increments('id').unsigned().primary()
            t.integer('from_id').unsigned().references('id').inTable('users').onUpdate('CASCADE')
            t.integer('to_id').unsigned().references('id').inTable('users').onUpdate('CASCADE')
            t.timestamps()
            t.unique(['from_id', 'to_id'])
        }).raw('ALTER TABLE relations AUTO_INCREMENT = 1001;')
    })
    .then(() => {
        const date = new Date()
        const dateString = date.toISOString().replace(/T/, ' ').replace(/\.\d{3}Z$/, '')

        /** categoriesマスタデータ */
        const rows = [
            { id: 1001, name: '組織', created_at: dateString, updated_at: dateString },
            { id: 1002, name: '役職', created_at: dateString, updated_at: dateString },
            { id: 1003, name: '職種・業態', created_at: dateString, updated_at: dateString }
        ]

        return knex('categories').insert(rows)
    })
    .then(() => {
        const date = new Date()
        const dateString = date.toISOString().replace(/T/, ' ').replace(/\.\d{3}Z$/, '')

        /** patternsマスタデータ */
        const rows = [
            { id: 1001, name: '会社', is_extract: true, pattern: '[ａ-ｚＡ-Ｚa-zA-Z\u30A0-\u30FF\u4E00-\u9FFF]{2,}(株式会社|㈱|研究所|有限会社)', created_at: dateString, updated_at: dateString },
            { id: 1002, name: '会社', is_extract: true, pattern: '(株式会社|㈱|有限会社)[ａ-ｚＡ-Ｚa-zA-Z\u30A0-\u30FF\u4E00-\u9FFF]{3,}', created_at: dateString, updated_at: dateString },
            { id: 1003, name: '会社', is_extract: true, pattern: '[a-zA-Z ]+ [iI]nc', created_at: dateString, updated_at: dateString },
            { id: 1004, name: '会社', is_extract: true, pattern: '(株式会社|㈱|有限会社)[a-zA-Z ]{3,}', created_at: dateString, updated_at: dateString },
            { id: 1005, name: '会社', is_extract: true, pattern: '[a-zA-Z ]{3,}(株式会社|㈱|有限会社)', created_at: dateString, updated_at: dateString },
            { id: 2001, name: '社長', is_extract: false, pattern: '(代表取締役|CEO|ＣＥＯ|[^a-zA-Z0-9]ceo[^a-zA-Z0-9]|社長|代表[^取]|を経営|を創業)', created_at: dateString, updated_at: dateString },
            { id: 2002, name: '会社役員', is_extract: false, pattern: '[^代][^表]取締役|COO|ＣＯＯ|CFO|ＣＦＯ', created_at: dateString, updated_at: dateString },
            { id: 2003, name: 'CTO', is_extract: false, pattern: 'CTO|ＣＴＯ|Technical manager', created_at: dateString, updated_at: dateString },
            { id: 3001, name: 'エンジニア', is_extract: false, pattern: 'エンジニア|プログラマ|[^業]開発|Developer|Developing|Development', created_at: dateString, updated_at: dateString },
            { id: 3002, name: 'コンサルティング', is_extract: false, pattern: 'コンサル', created_at: dateString, updated_at: dateString },
            { id: 3003, name: 'クリエイティブ', is_extract: false, pattern: 'デザイナ|アートディレクタ|クリエイティブディレクタ|クリエイタ|クリエータ', created_at: dateString, updated_at: dateString },
            { id: 3004, name: 'ライター', is_extract: false, pattern: 'ライター', created_at: dateString, updated_at: dateString },
            { id: 3005, name: 'プランナー', is_extract: false, pattern: 'プランナ', created_at: dateString, updated_at: dateString },
            { id: 3006, name: 'マーケティング', is_extract: false, pattern: 'マーケティング|マーケッター', created_at: dateString, updated_at: dateString },
            { id: 3007, name: 'ディレクター', is_extract: false, pattern: 'ディレクタ', created_at: dateString, updated_at: dateString },
            { id: 3008, name: 'プロデューサー', is_extract: false, pattern: 'プロデューサー', created_at: dateString, updated_at: dateString },
            { id: 3009, name: 'アナリスト', is_extract: false, pattern: '分析|アナリスト|解析', created_at: dateString, updated_at: dateString },
            { id: 3010, name: '広告関連', is_extract: false, pattern: '広告|リスティング|アフィリエイト|SEO|ＳＥＯ', created_at: dateString, updated_at: dateString },
            { id: 3011, name: '営業関連', is_extract: false, pattern: '営業|販路開拓', created_at: dateString, updated_at: dateString },
            { id: 3012, name: '投資関連', is_extract: false, pattern: '投資|[^a-zA-Z]VC[^a-zA-Z]|[Cc]apital|キャピタル|キャピタリスト', created_at: dateString, updated_at: dateString },
            { id: 3013, name: '建築関連', is_extract: false, pattern: '不動産|建築', created_at: dateString, updated_at: dateString },
            { id: 3014, name: 'ソーシャルメディア', is_extract: false, pattern: 'ソーシャルメディア|ソーシャル・ビッグデータ', created_at: dateString, updated_at: dateString },
            { id: 3015, name: '教育関連', is_extract: false, pattern: '教育|育成', created_at: dateString, updated_at: dateString },
            { id: 3016, name: '人材紹介', is_extract: false, pattern: '求人|人材紹介|リクルーティング|エージェント', created_at: dateString, updated_at: dateString },
            { id: 3017, name: '経理関連', is_extract: false, pattern: '経理|会計', created_at: dateString, updated_at: dateString },
            { id: 3018, name: '人事', is_extract: false, pattern: '人事[^業]', created_at: dateString, updated_at: dateString }
        ]

        return knex('patterns').insert(rows)
    })
    .then(() => {
        /** categories_patternsマスタデータ */
        const rows = [
            { id: 1001, category_id: 1001, pattern_id: 1001 },
            { id: 1002, category_id: 1001, pattern_id: 1002 },
            { id: 1003, category_id: 1001, pattern_id: 1003 },
            { id: 1004, category_id: 1001, pattern_id: 1004 },
            { id: 1005, category_id: 1001, pattern_id: 1005 },
            { id: 1006, category_id: 1002, pattern_id: 2001 },
            { id: 1007, category_id: 1002, pattern_id: 2002 },
            { id: 1008, category_id: 1002, pattern_id: 2003 },
            { id: 1009, category_id: 1003, pattern_id: 3001 },
            { id: 1010, category_id: 1003, pattern_id: 3002 },
            { id: 1011, category_id: 1003, pattern_id: 3003 },
            { id: 1012, category_id: 1003, pattern_id: 3004 },
            { id: 1013, category_id: 1003, pattern_id: 3005 },
            { id: 1014, category_id: 1003, pattern_id: 3006 },
            { id: 1015, category_id: 1003, pattern_id: 3007 },
            { id: 1016, category_id: 1003, pattern_id: 3008 },
            { id: 1017, category_id: 1003, pattern_id: 3009 },
            { id: 1018, category_id: 1003, pattern_id: 3010 },
            { id: 1019, category_id: 1003, pattern_id: 3011 },
            { id: 1020, category_id: 1003, pattern_id: 3012 },
            { id: 1021, category_id: 1003, pattern_id: 3013 },
            { id: 1022, category_id: 1003, pattern_id: 3014 },
            { id: 1023, category_id: 1003, pattern_id: 3015 },
            { id: 1024, category_id: 1003, pattern_id: 3016 },
            { id: 1025, category_id: 1003, pattern_id: 3017 },
            { id: 1026, category_id: 1003, pattern_id: 3018 }
        ]

        return knex('categories_patterns').insert(rows)
    })
}

exports.down = (knex, Promise) => {
    return Promise.resolve()
    .then(() => knex.raw('SET foreign_key_checks = 0'))
    .then(() => {
        return knex.schema
        .dropTableIfExists('users')
        .dropTableIfExists('tags')
        .dropTableIfExists('categories')
        .dropTableIfExists('patterns')
        .dropTableIfExists('tags_users')
        .dropTableIfExists('categories_patterns')
        .dropTableIfExists('relations')
    })
    .then(() => knex.raw('SET foreign_key_checks = 1'))
}
