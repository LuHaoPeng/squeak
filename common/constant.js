'use strict'

const settings = require('electron-settings')
let BASE_PREFIX = 'http://localhost:3000'

if (settings.has('url')) {
    BASE_PREFIX = settings.get('url.address') + ':' + settings.get('url.port')
}

module.exports = Object.freeze({
    getUpdateUrl: () => {
        return BASE_PREFIX + '/releases'
    },
    getLoginUrl: () => {
        return BASE_PREFIX + '/users/login'
    },
    getUserListUrl: () => {
        return BASE_PREFIX + '/users/list'
    },
    getUserCreateUrl: () => {
        return BASE_PREFIX + '/users/create'
    },
    getUserResetUrl: () => {
        return BASE_PREFIX + '/users/reset'
    },
    getUserDeleteUrl: () => {
        return BASE_PREFIX + '/users/delete'
    },
    getUserPasswordUrl: () => {
        return BASE_PREFIX + '/users/password'
    },
    getTreeMenuUrl: (suffix) => {
        return BASE_PREFIX + '/trade/tree/' + suffix
    },
    getTradeDataUrl: (suffix) => {
        return BASE_PREFIX + '/trade/content/' + suffix
    },
    getTradeCreateUrl: (suffix) => {
        return BASE_PREFIX + '/trade/create/' + suffix
    },
    getTradeEditUrl: (suffix) => {
        return BASE_PREFIX + '/trade/edit/' + suffix
    },
    getTradeDeleteUrl: (suffix) => {
        return BASE_PREFIX + '/trade/delete/' + suffix
    },
    updateBasePrefix: () => {
        if (settings.has('url')) {
            BASE_PREFIX = settings.get('url.address') + ':' + settings.get('url.port')
        }
    }
})

Date.prototype.Format = function (fmt) { //author: meizz
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    }
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
    return fmt
}