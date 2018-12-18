'use strict'

window.$ = window.jQuery = require('jquery')
require('bootstrap')

const Constant = require('../../common/constant')
const {ipcRenderer} = require('electron')

let $account = $('#input_account')
let $old_password = $('#input_old_password')
let $new_password = $('#input_new_password')
let $confirm_password = $('#input_confirm_password')
let $btn_submit = $('#btn_submit')
let $loading = $('#submit_loading')

ipcRenderer.send('password-window-ready')
ipcRenderer.once('password-window-initialize', (event, arg) => {
    $account.val(arg)
})

$('form').submit((event) => {
    event.preventDefault()
    // reset status
    $btn_submit.attr('disabled', 'disabled')
    $loading.show()
    $old_password.removeClass('text-white').removeClass('bg-danger')
    $confirm_password.removeClass('text-white').removeClass('bg-danger')
    // check confirm
    if ($new_password.val().trim() !== $confirm_password.val().trim()) {
        $confirm_password.addClass('text-white').addClass('bg-danger')
        $btn_submit.removeAttr('disabled')
        $loading.hide()
        return
    }
    // ajax
    $.post(Constant.getUserPasswordUrl(), {
        username: $account.val().trim(),
        oldPassword: $old_password.val().trim(),
        newPassword: $new_password.val().trim()
    }, (res) => {
        $btn_submit.removeAttr('disabled')
        $loading.hide()
        switch (res.code) {
            case 0:
                ipcRenderer.send('password-window-return')
                break
            case 2:
                // wrong old password
                $old_password.addClass('text-white').addClass('bg-danger')
                break
            case -1:
                ipcRenderer.send('internal-error', res.msg)
                break
            default:
        }
    })
})