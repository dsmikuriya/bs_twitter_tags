const config = require('config')
const twitter = require('twitter')
const Promise = require('bluebird')
const sleep = require('sleep')

const logger = require('./logger-base')

class TwitterUtils {
    constructor() {
        this.client = new twitter(config.twitter)
    }

    /**
     * 指定したアカウントの相互フォローIDを取得。フォローもフォロワーも上限5000件まで
     * @param {string} - 相互フォローIDを取得したいscreen_name
     * @returns {Promise<Array>} - 相互フォローIDの配列
     */
    getSougoIds(screenName) {
        const followerFunc = this.getFollowerIds(screenName)
        const followFunc = this.getFollowIds(screenName)

        return followerFunc.then(followers => {
            return followFunc.then(follows => {
                return this.duplicateIds(followers.ids, follows.ids)
            })
        }).then(sougoIds => {
            return sougoIds
        }).catch(error => {
            logger.error(error)
            return []
        })
    }

    /**
     * 指定したアカウントのフォロワーIDを取得。上限5000件まで
     */
    getFollowerIds(screenName) {
        // return new Promise((resolve, reject) => { return resolve([1,2,3,4]) })
        const params = { screen_name: screenName, count: 5000 }
        return this.connectApi('followers/ids', params)
    }

    /**
     * 指定したアカウントがフォローしているIDを取得。上限5000件まで
     */
    getFollowIds(screenName) {
        // return new Promise((resolve, reject) => { return resolve([3,4,5,6]) })
        const params = { screen_name: screenName, count: 5000 }
        return this.connectApi('friends/ids', params)
    }

    /**
     * 指定したscreen_nameのアカウント情報を取得。API仕様上100単位に分割して取得する
     * @param {Array} - screen_nameの配列
     * @returns {Promise<Array>} - アカウント情報を持ったオブジェクトの配列を返却
     */
    getBiosByNames(screenNames) {
        return this.getBios(screenNames, 'screen_name')
    }

    /**
     * 指定したユーザーIDのアカウント情報を取得。API仕様上100単位に分割して取得する
     * @param {Array} - ユーザーIDの配列
     * @returns {Promise<Array>} - アカウント情報を持ったオブジェクトの配列を返却
     */
    getBiosByIds(ids) {
        return this.getBios(ids, 'user_id')
    }

    /** private function */
    getBios(ids, key) {
        if (!ids || ids.length == 0) {
            return []
        }

        let tmpIds = []
        let bioFuncArray = []

        ids.forEach(id => {
            tmpIds.push(id)

            if (tmpIds.length == 100) {
                bioFuncArray.push(this.connectApi('users/lookup', { [key]: tmpIds.join(',') }))
                tmpIds = []
            }
        })

        if (tmpIds.length > 0) {
            bioFuncArray.push(this.connectApi('users/lookup', { [key]: tmpIds.join(',') }))
        }

        return Promise.reduce(bioFuncArray, (results, bios) => {
            results = results.concat(bios)
            return results
        }, [])
    }

    /**
     * private function
     * @param {string} - api path exp: user/lookup
     * @param {object} - APIに渡すパラメータオブジェクト
     * @returns {Promise<Object>} - APIから返却された値
     */
    connectApi(apiPath, params) {
        return new Promise((resolve, reject) => {
            this.client.get(apiPath, params, (error, result, response) => {
                if (error) {
                    if (error[0] && error[0].code === 88) {
                        logger.error('Twitter APIの利用制限に達しました。30秒sleepします')
                        sleep.sleep(30)
                        return this.connectApi(apiPath, params)
                    } else {
                        return reject(error)
                    }
                } else {
                    return resolve(result)
                }
            })
        })
    }

    /** private function */
    duplicateIds(aArray, bArray) {
        return aArray.concat(bArray).filter((target, index, self) => {
            return self.indexOf(target) === index && index !== self.lastIndexOf(target)
        })
    }
}

module.exports = TwitterUtils
