'use strict'

window.$ = window.jQuery = require('jquery')
require('bootstrap')

const Constant = require('../../common/constant')
const {ipcRenderer} = require('electron')

let $input_username = $('#input_username')
let $select_type = $('#select_type')
let $btn_submit = $('#btn_submit')
let $loading = $('#submit_loading')

$('form').submit((event) => {
    event.preventDefault()
    $btn_submit.attr('disabled', 'disabled')
    $loading.show()

    $.post(Constant.getUserCreateUrl(), {
        username: $input_username.val().trim(),
        type: $select_type.val(),
        description: $select_type.find("option:selected").text()
    }, (res) => {
        $btn_submit.removeAttr('disabled')
        $loading.hide()
        if (res.code === 0) {
            ipcRenderer.send('add-user-window-return')
        } else {
            ipcRenderer.send('internal-error', res.msg)
        }
    })
})