'use strict'
window.$ = window.jQuery = require('jquery')
require('bootstrap')
require('../font/iconfont')

const Constant = require('../../common/constant')
const {ipcRenderer} = require('electron')

let $btn = $('#btn_login')
let $loading = $('#login_loading')
let $username = $('#username')
let $password = $('#password')
let $div_username = $('#div_username')
let $div_password = $('#div_password')

$('#btn_settings').on('click', () => {
    ipcRenderer.send('bring-setting-window')
    ipcRenderer.once('setting-window-return', () => Constant.updateBasePrefix())
})

$('form').submit((event) => {
    // reset error msg
    $div_username.removeAttr('err')
    $div_password.removeAttr('err')
    // set button loading
    $loading.show()
    $btn.attr('disabled', 'disabled')
    // ajax
    $.post(Constant.getLoginUrl(), {
        username: $('#username').val().trim(),
        password: $('#password').val().trim()
    }, (res) => {
        $loading.hide()
        $btn.removeAttr('disabled')
        switch (res.code) {
            case 0:
                // correct
                ipcRenderer.send('login-success', {
                    operator: $('#username').val().trim(),
                    operatorType: res.data.type
                })
                break
            case 1:
                // wrong username
                $div_username.attr('err', '')
                $username.focus()
                break
            case 2:
                // wrong password
                $div_password.attr('err', '')
                $password.focus()
                break
            case -1:
                // internal error
                ipcRenderer.send('internal-error', res.msg)
                break
            default:
        }
    })
    event.preventDefault()
})