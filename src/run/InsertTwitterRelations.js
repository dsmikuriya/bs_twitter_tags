const Promise = require('bluebird')

/** Utilities */
const logger = require('../utils/logger-base')
const TwitterUtils = require('../utils/TwitterUtils')
const BusinessProfiler = require('../utils/BusinessProfiler')

/** Models */
const User = require('../models/User')
const Relation = require('../models/Relation')

/** Instance */
const twitter = new TwitterUtils()
const profiler = new BusinessProfiler()

/** 引数でscreen_nameを受け取る */
const targetUser = process.argv[2]

if (!targetUser) {
    logger.error('相互フォロー取得＆企業情報取得したいアカウントを引数に指定してください')
    process.exit(0)
}

logger.info('bioを取得 - screen_name: %s', targetUser)

twitter.getBiosByNames([targetUser]).then(apiResponses => {
    logger.info('bioをDB登録およびTags登録 - screen_name: %s', targetUser)
    return saveTwitterUsers(apiResponses)
})
.then(fromUsers => {
    return fromUsers[0]
})
.then(fromUser => {
    logger.info('相互フォローIDを取得 - screen_name: %s', fromUser.get('screen_name'))
    return twitter.getSougoIds(fromUser.get('screen_name')).then(sougoIds => {
        logger.info('相互フォローIDのbioを取得 - screen_name: %s, sougoIds.length: %s', fromUser.get('screen_name'), sougoIds.length)
        return twitter.getBiosByIds(sougoIds)
    })
    .then(toUserIds => {
        logger.info('bioをDB登録およびTags登録 - sougoIds.length: %s', toUserIds.length)
        return saveTwitterUsers(toUserIds)
    })
    .then(toUsers => {
        logger.info('相互フォロー関係をDB登録 - fromUser: %s, toUsers.length: %s', fromUser.get('id'), toUsers.length)
        return Promise.mapSeries(toUsers, toUser => {
            return Promise.all([
                Relation.findOrCreate({ from_id: fromUser.get('id'), to_id: toUser.get('id') }),
                Relation.findOrCreate({ from_id: toUser.get('id'), to_id: fromUser.get('id') })
            ])
        })
        .then(results => {
            logger.info('対象ユーザーのupdated_atを更新 - screen_name: %s, id: %s', fromUser.get('screen_name'), fromUser.get('id'))
            return new User({ id: fromUser.get('id') }).save()
        })
    })
})
.then(() => {
    logger.info('全ての処理が完了')
    process.exit(0)
})
.catch(error => {
    logger.error('予期せぬエラー発生。処理を終了')
    logger.error(error)
})

function saveTwitterUsers(users) {
    return Promise.mapSeries(users, user => {
        return Promise.all([
            profiler.getCompanies(user.description),
            profiler.getPositions(user.description),
            profiler.getJobs(user.description)
        ])
        .spread((companies, positions, jobs) => {
            const userObject = {
                user_id: user.id,
                screen_name: user.screen_name,
                name: user.name,
                follower_count: user.followers_count,
                friend_count: user.friends_count,
                description: user.description,
                url: user.url,
                location: user.location
            }

            return User.findOrCreateWithTags(userObject, companies.concat(positions, jobs))
        })
    })
}
