'use strict'

if (require('electron-squirrel-startup')) return

const {app, BrowserWindow, ipcMain, dialog, Menu, autoUpdater} = require('electron')
const Constant = require('./common/constant')


let win, childWin
let opening = false
let operator
let tradeExtras
let windowListener

const menuTemplate = [{
    label: '操作',
    submenu: [{
        label: '账号',
        submenu: [{
            label: '切换账号',
            click: () => {
                opening = true
                win.close()
                createLogin()
            }
        }, {
            label: '修改密码',
            click: () => {
                createPassword()
                ipcMain.once('password-window-ready', (event) => {
                    event.sender.send('password-window-initialize', operator.operator)
                })
                ipcMain.once('password-window-return', () => {
                    opening = true
                    win.close()
                    createLogin()
                })
            }
        }]
    }, {
        label: '重新加载',
        role: 'reload'
    }, {
        label: '控制台',
        role: 'toggledevtools'
    }, {
        label: '退出软件',
        role: 'quit'
    }]
}, {
    label: '其他',
    submenu: [{
        label: '设置',
        accelerator: 'CmdOrCtrl+O',
        click: createSetting
    }, {
        label: '检查更新',
        click: () => autoUpdater.checkForUpdates()
    }, {
        label: '关于',
        click: () => {
            createAbout()
            ipcMain.once('about-window-return', () => childWin.close())
        }
    }]
}]

function createLogin() {
    win = new BrowserWindow({
        width: 410,
        height: 410,
        backgroundColor: '#fff',
        title: '登录'
    })
    win.setMenu(null)
    win.loadFile('./static/page/login.html')
    win.on('closed', () => win = null)
    opening = false
}

function createManage() {
    win = new BrowserWindow({
        useContentSize: true,
        width: 800,
        height: 650,
        backgroundColor: '#fff',
        title: '人员管理'
    })
    win.setMenu(Menu.buildFromTemplate(menuTemplate))
    win.loadFile('./static/page/manage.html')
    win.on('closed', () => win = null)
    opening = false
}

function createMain() {
    win = new BrowserWindow({
        useContentSize: true,
        width: 1100,
        height: 650,
        backgroundColor: '#fff',
        title: '工单管理'
    })
    win.setMenu(Menu.buildFromTemplate(menuTemplate))
    win.loadFile('./static/page/main.html')
    win.on('closed', () => win = null)
    opening = false
}

function createUser() {
    childWin = new BrowserWindow({
        width: 400,
        height: 300,
        backgroundColor: '#fff',
        parent: win,
        modal: true,
        title: '添加用户'
    })
    childWin.setMenu(null)
    childWin.loadFile('./static/page/user.html')
    childWin.on('closed', () => childWin = null)
}

function createTrade() {
    childWin = new BrowserWindow({
        width: 400,
        height: 400,
        backgroundColor: '#fff',
        parent: win,
        modal: true,
        title: tradeExtras.modeText
    })
    childWin.setMenu(null)
    childWin.loadFile('./static/page/trade.html')
    childWin.on('closed', () => childWin = null)
}

function createPassword() {
    childWin = new BrowserWindow({
        width: 400,
        height: 350,
        backgroundColor: '#fff',
        parent: win,
        modal: true,
        title: '修改密码'
    })
    childWin.setMenu(null)
    childWin.loadFile('./static/page/password.html')
    childWin.on('closed', () => childWin = null)
}

function createSetting() {
    childWin = new BrowserWindow({
        width: 400,
        height: 220,
        backgroundColor: '#fff',
        parent: win,
        modal: true,
        title: '设置'
    })
    childWin.setMenu(null)
    childWin.loadFile('./static/page/setting.html')
    childWin.on('closed', () => childWin = null)
}

function createAbout() {
    childWin = new BrowserWindow({
        width: 400,
        height: 310,
        backgroundColor: '#fff',
        parent: win,
        modal: true,
        resizable: false,
        movable: false,
        skipTaskbar: true,
        frame: false
    })
    childWin.setMenu(null)
    childWin.loadFile('./static/page/about.html')
    childWin.on('closed', () => childWin = null)
}

app.on('ready', () => {
    if (process.argv[1] === '--squirrel-firstrun') {
        createLogin()
        return
    }

    autoUpdater.setFeedURL(Constant.getUpdateUrl())
    autoUpdater.on('update-downloaded', function () {
        autoUpdater.quitAndInstall()
    })
    try {
        autoUpdater.checkForUpdates()
    } catch (e) {
        createLogin()
    }
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin' && !opening) {
        app.quit()
    }
})

ipcMain.on('bring-confirm-box', (event, arg) => {
    dialog.showMessageBox(arg, (index) => {
        event.sender.send('confirm-selection', index)
    })
})

ipcMain.on('internal-error', (event, arg) => {
    dialog.showErrorBox('后台服务出错', arg)
})

ipcMain.on('login-success', (event, arg) => {
    opening = true
    operator = arg
    win.close()
    operator.operatorType === -1 ? createManage() : createMain()
})

ipcMain.on('main-logout', () => {
    opening = true
    win.close()
    createLogin()
})

ipcMain.on('main-window-ready', (event) => {
    event.sender.send('main-window-initialize', operator)
})

ipcMain.on('bring-trade-window', (event, arg) => {
    tradeExtras = arg
    windowListener = event.sender
    createTrade()
})

ipcMain.on('trade-window-ready', (event) => {
    event.sender.send('trade-window-initialize', tradeExtras)
})

ipcMain.on('trade-window-return', () => {
    windowListener.send('trade-window-return')
    childWin.close()
    windowListener = null
})

ipcMain.on('bring-add-user-window', (event) => {
    windowListener = event.sender
    createUser()
})

ipcMain.on('add-user-window-return', () => {
    windowListener.send('add-user-window-return')
    childWin.close()
    windowListener = null
})

ipcMain.on('bring-setting-window', (event) => {
    windowListener = event.sender
    createSetting()
})

ipcMain.on('setting-window-return', () => {
    if (windowListener) {
        windowListener.send('setting-window-return')
        windowListener = null
    } else {
        win.webContents.executeJavaScript('Constant.updateBasePrefix()')
    }
    childWin.close()
})