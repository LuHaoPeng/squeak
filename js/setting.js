'use strict'

window.$ = window.jQuery = require('jquery')
require('bootstrap')

const {ipcRenderer} = require('electron')
const setting = require('electron-settings')

let $input_address = $('#input_address')
let $input_port = $('#input_port')

if (setting.has('url')) {
    $input_address.val(setting.get('url.address'))
    $input_port.val(setting.get('url.port'))
}

$('form').submit((event) => {
    event.preventDefault()
    let address = $input_address.val().trim()
    if (!/^http(s)?:\/\//.test(address)) {
        address = 'http://' + address
    }
    let port = parseInt($input_port.val())

    // set
    $input_address.val(address)
    $input_port.val(port)
    setting.set('url', {
        address: address,
        port: port
    })

    ipcRenderer.send('setting-window-return')
})