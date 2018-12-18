let gulp = require('gulp')

gulp.task('generate-installer', generateInstaller)

function generateInstaller() {
    let electronInstaller = require('electron-winstaller')
    electronInstaller.createWindowsInstaller({
        appDirectory: '../electron-build/Squeak-win32-x64',
        outputDirectory: '../electron-build/installer',
        authors: '卢浩鹏',
        exe: 'Squeak.exe',
        loadingGif: `${__dirname}/static/img/loading.gif`,
        title: 'Squeak',
        iconUrl: `${__dirname}/static/img/icon.ico`,
        setupIcon: `${__dirname}/static/img/setup.ico`,
        setupExe: 'Setup.exe',
        noMsi: true
    }).then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`))
}

/* electron-packager . Squeak --out ../electron-build --platform=win32 --arch=x64 --ignore=gulpFile.js --icon=E:\WebstormProjects\squeak\static\img\icon.ico --prune --asar --overwrite
 */