'use strict'

window.$ = window.jQuery = require('jquery')
require('bootstrap')
require('bootstrap-table')
require('bootstrap-table/dist/locale/bootstrap-table-zh-CN.min')
require('jstree')
require('../font/iconfont')

const Constant = require('../../common/constant')
const {ipcRenderer} = require('electron')

let operator

ipcRenderer.send('main-window-ready')

ipcRenderer.once('main-window-initialize', (event, arg) => {
    operator = arg
    $('#tree').jstree({
        core: {
            data: {
                url: Constant.getTreeMenuUrl(operator.operatorType)
            },
            multiple: false
        }
    })
})

// tool button enable
$('#table_trade').on('check.bs.table', () => {
    $('#tool_btn_edit').removeClass('disabled')
    $('#tool_btn_delete').removeClass('disabled')
}).on('uncheck.bs.table', (event, row, $el) => {
    let $selected = $el.closest('table').find('tr.selected')
    if ($selected.length <= 0) {
        $('#tool_btn_edit').addClass('disabled')
        $('#tool_btn_delete').addClass('disabled')
    }
}).on('pre-body.bs.table', () => {
    $('#tool_btn_edit').addClass('disabled')
    $('#tool_btn_delete').addClass('disabled')
})

// tree menu
$('#tree').on('changed.jstree', (event, data) => {
    let $selected = data.instance.get_selected(true)[0]
    if (typeof $selected === 'undefined') return
    let level = $selected.parents.length
    let params
    switch (level) {
        case 3: // month
            params = '/year/' + $('#' + $selected.parent + '_anchor').text().substr(0, 4) + '/month/' + $selected.text.substr(0, 2)
            break
        case 2: // year
            params = '/year/' + $selected.text.substr(0, 4) + '/month/all'
            break
        case 1: // root
            params = '/year/all/month/all'
            break
        default:
            return
    }
    $.getJSON(Constant.getTradeDataUrl(operator.operatorType + params), (res) => {
        if (res.code === 0) {
            buildTableFromData(res.data.tradeData)
        } else {
            ipcRenderer.send('internal-error', res.msg)
        }
    })
})

// tool-buttons
$('#tool_btn_create').on('click', () => {
    ipcRenderer.send('bring-trade-window', {
        mode: 'create',
        modeText: '新建工单',
        operator: operator
    })
    ipcRenderer.once('trade-window-return', () => {
        let instance = $('#tree').jstree(true)
        instance.refresh()
    })
})

$('#tool_btn_edit').on('click', () => {
    let $selected = $('#table_trade').bootstrapTable('getSelections')[0]
    ipcRenderer.send('bring-trade-window', {
        mode: 'edit',
        modeText: '编辑工单',
        operator: operator,
        selected: $selected
    })
    ipcRenderer.once('trade-window-return', () => {
        let instance = $('#tree').jstree(true)
        instance.refresh()
    })
})

$('#tool_btn_delete').on('click', () => {
    ipcRenderer.send('bring-confirm-box', {
        type: 'warning',
        title: '删除工单',
        message: '此操作结果不可撤销，确认删除？',
        defaultId: 0,
        buttons: ['取消', '确认']
    })

    ipcRenderer.once('confirm-selection', (event, index) => {
        if (index === 1) {
            let $selected = $('#table_trade').bootstrapTable('getSelections')[0]
            $.post(Constant.getTradeDeleteUrl(operator.operatorType), {
                trade_no: $selected.trade_no
            }, (res) => {
                if (res.code === 0) {
                    let instance = $('#tree').jstree(true)
                    instance.refresh()
                } else {
                    ipcRenderer.send('internal-error', res.msg)
                }
            })
        }
    })
})

$('#tool_btn_logout').on('click', () => {
    ipcRenderer.send('main-logout')
})

function buildTableFromData(data) {
    let $table = $('#table_trade')
    if (typeof $table.bootstrapTable('getOptions').classes === 'string') {
        $table.bootstrapTable('load', data)
    } else {
        $table.bootstrapTable({
            columns: [{
                checkbox: true
            }, {
                field: 'trade_no',
                title: '工单号'
            }, {
                field: 'consume',
                title: '领料'
            }, {
                field: 'produce',
                title: '出货'
            }, {
                field: 'trade_time',
                title: '工单时间'
            }, {
                field: 'operator',
                title: '操作员'
            }, {
                field: 'update_time',
                title: '上次编辑时间'
            }],
            data: data,
            singleSelect: true,
            clickToSelect: true,
            search: true,
            pagination: true,
            locale: 'zh-CN'
        })
    }
}