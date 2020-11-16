const path = require('path')
const webpack = require('webpack')
module.exports = {
    pluginOptions: {
      electronBuilder: {
        nodeIntegration: true,//需要在fs或sqlite渲染器过程中使用本机模块
        externals: ['serialport','electron-edge-js'], //这里是你使用的原生模块名字列表，改成自己的即可
        nodeModulesPath: ['../../node_modules', './node_modules','../node_modules'],//这里是多个node_modules路径，按自己需要配置即可
        //打包配置
        builderOptions: {
            "appId": "com.cerp.app",
            "productName":"cerp",//项目名，也是生成的安装文件名，即aDemo.exe
            "copyright":"Copyright © 2019",//版权信息
            "directories":{
                "output":"./build"//输出文件路径
            },
            'extraResources': {
                // 拷贝dll等静态文件到指定位置,否则打包之后回出现找不大dll的问题
                'from': 'resources/',
                'to': './'
            },
            "win":{//win相关配置
                "icon":"./resources/ico/icon.ico",//图标，当前图标在根目录下，注意这里有两个坑
                "target": [
                    {
                        "target": "nsis",//利用nsis制作安装程序
                        "arch": [
                            "x64",//64位
                            "ia32"//32位
                        ]
                    }
                ]
            },
            "nsis": {
                "oneClick": false, // 是否一键安装
                "allowElevation": true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
                "allowToChangeInstallationDirectory": true, // 允许修改安装目录
                "installerIcon": "./resources/ico/icon.ico",// 安装图标
                "uninstallerIcon": "./resources/ico/icon.ico",//卸载图标
                "installerHeaderIcon": "./resources/ico/icon.ico", // 安装时头部图标
                "createDesktopShortcut": true, // 创建桌面图标
                "createStartMenuShortcut": true,// 创建开始菜单图标
                "shortcutName": "erp", // 图标名称
            }
        },
      }
    },
   configureWebpack: {
        plugins:[
            new webpack.DefinePlugin({
                __resources: `"${path.join(__dirname, './resources').replace(/\\/g, '\\\\')}"`,
            }),
            new webpack.ExternalsPlugin("commonjs", ["ffi-napi"])
        ]
    },
    lintOnSave: false
  }
