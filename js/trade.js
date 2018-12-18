'use strict'

window.$ = window.jQuery = require('jquery')
require('bootstrap')

const Constant = require('../../common/constant')
const {ipcRenderer} = require('electron')

let $input_trade_no = $('#input_trade_no')
let $input_consume = $('#input_consume')
let $input_produce = $('#input_produce')
let $input_operator = $('#input_operator')
let $input_trade_time = $('#input_trade_time')
let $loading = $('#submit_loading')
let $btn_submit = $('#btn_submit')

let operatorType, mode

ipcRenderer.send('trade-window-ready')

ipcRenderer.on('trade-window-initialize', (event, arg) => {
    mode = arg.mode
    operatorType = arg.operator.operatorType
    if (arg.mode === 'create') {
        // generate trade_no, trade_time, operator
        let time = new Date()
        let trade_no = getTradeNoPrefix(arg.operator.operatorType) + time.Format('yyyyMMddhhmmssS')
        $input_trade_no.val(trade_no)
        $input_operator.val(arg.operator.operator)
        $input_trade_time.val(time.Format('yyyy-MM-dd hh:mm:ss'))
    } else if (arg.mode === 'edit') {
        // fill blank with arg
        $input_trade_no.val(arg.selected.trade_no)
        $input_consume.val(arg.selected.consume)
        $input_produce.val(arg.selected.produce)
        $input_operator.val(arg.selected.operator)
        $input_trade_time.val(arg.selected.trade_time)
    }
})

$('form').submit((event) => {
    event.preventDefault()
    $btn_submit.attr('disabled', 'disabled')
    $loading.show()
    let url
    if (mode === 'create') {
        url = Constant.getTradeCreateUrl(operatorType)
    } else if (mode === 'edit') {
        url = Constant.getTradeEditUrl(operatorType)
    } else {
        return
    }
    $.post(url, {
        trade_no: $input_trade_no.val(),
        consume: $input_consume.val(),
        produce: $input_produce.val(),
        operator: $input_operator.val(),
        trade_time: $input_trade_time.val()
    }, (res) => {
        $btn_submit.removeAttr('disabled')
        $loading.hide()
        if (res.code === 0) {
            ipcRenderer.send('trade-window-return')
        } else {
            ipcRenderer.send('internal-error', res.msg)
        }
    })
})

function getTradeNoPrefix(operatorType) {
    switch (operatorType) {
        case 1:
            return 'CJ'
        case 2:
            return 'CH'
        case 3:
            return 'HD'
        case 4:
            return 'CK'
        case 5:
            return 'XS'
        default:
    }
}