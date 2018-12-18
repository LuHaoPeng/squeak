'use strict'

window.$ = window.jQuery = require('jquery')
require('bootstrap')
require('bootstrap-table')
require('bootstrap-table/dist/locale/bootstrap-table-zh-CN.min')
require('../font/iconfont')

const Constant = require('../../common/constant')
const {ipcRenderer} = require('electron')

loadTable()

// tool button enable
$('#table_account').on('check.bs.table', () => {
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

$('#tool_btn_create').on('click', () => {
    ipcRenderer.send('bring-add-user-window')
    ipcRenderer.once('add-user-window-return', loadTable)
})

$('#tool_btn_edit').on('click', () =>{
    ipcRenderer.send('bring-confirm-box', {
        type: 'info',
        title: '重置密码',
        message: '将重置为初始密码，确认继续？',
        defaultId: 0,
        buttons: ['取消', '确认']
    })

    ipcRenderer.once('confirm-selection', (event, index) => {
        if (index === 1) {
            let $selected = $('#table_account').bootstrapTable('getSelections')[0]
            $.post(Constant.getUserResetUrl(), {
                username: $selected.username
            }, (res) => {
                if (res.code === 0) {
                    // 重置密码暂时不需要刷新表格，如果以后需要显示密码才刷新
                    // loadTable()
                } else {
                    ipcRenderer.send('internal-error', res.msg)
                }
            })
        }
    })
})

$('#tool_btn_delete').on('click', () => {
    ipcRenderer.send('bring-confirm-box', {
        type: 'warning',
        title: '删除账号',
        message: '此操作结果不可撤销，确认删除？',
        defaultId: 0,
        buttons: ['取消', '确认']
    })

    ipcRenderer.once('confirm-selection', (event, index) => {
        if (index === 1) {
            let $selected = $('#table_account').bootstrapTable('getSelections')[0]
            $.post(Constant.getUserDeleteUrl(), {
                username: $selected.username
            }, (res) => {
                if (res.code === 0) {
                    loadTable()
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

function loadTable() {
    $.getJSON(Constant.getUserListUrl(), (res) => {
        if (res.code === 0) {
            buildTableFromData(res.data.list)
        } else {
            ipcRenderer.send('internal-error', res.msg)
        }
    })
}

function buildTableFromData(data) {
    let $table = $('#table_account')
    if (typeof $table.bootstrapTable('getOptions').classes === 'string') {
        $table.bootstrapTable('load', data)
    } else {
        $table.bootstrapTable({
            columns: [{
                checkbox: true
            }, {
                field: 'username',
                title: '账号'
            }, {
                field: 'description',
                title: '部门'
            }, {
                field: 'update_time',
                title: '上次修改时间'
            }],
            data: data,
            search: true,
            singleSelect: true,
            clickToSelect: true,
            pagination: true,
            locale: 'zh-CN'
        })
    }
}