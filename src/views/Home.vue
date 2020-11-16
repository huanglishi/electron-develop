<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <button @click="lisenCom()">监听串口com3</button>
     <button @click="sendNotification">发送系统通知</button>
     <button @click="checkUpdate">检查更新</button>
     <br/>
    <h3>C++Dll</h3>
    <input v-model="cjj.valA" type="text"/>
    <input v-model="cjj.valB" type="text"/>={{cjj.val}}
    <button @click="CalcButton()">调用C++ dll计算</button>
      <h3>C# Dll</h3>
    <button @click="CalcButtonCs()">调用C# dll计算</button>
    <h3>执行cmd命令</h3>
    <button @click="doExec()">执行cmd命令</button>
    <div class="nale ">
        <div class="title">sqlite3数据库的数据</div>
        <template v-for="(item, i) in list">
          <div :key="i">姓名：{{ item.name }}</div>
        </template>
      </div>
  </div>
</template>

<script>
// @ is an alias to /src
const pathUtil = require('../utils/pathUtil.js')
import HelloWorld from '@/components/HelloWorld.vue'
import { ipcRenderer } from 'electron'
import { remote } from 'electron'
 const path = require("path");
 //执行cmd命令
 import { exec } from 'child_process'
//串口
const SerialPort = require('serialport')
    //C#
const edge = require('electron-edge-js')
var  invoke = edge.func({
        assemblyFile: path.join(__resources, "/dll/electronedge.dll"),
        typeName: 'electronedge.Class1',
        methodName: 'Invoke'
    })
//call ffi test
  const ffi = require("ffi-napi");
  const myAddDll = new ffi.Library(path.resolve('resources/dll/myAddDll.dll'), {
  'funAdd': 
      [
      'int', ['int', 'int'], 
      ],
  });
export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  data(){
    return{
      list: [],
      cjj:{valA:1,valB:5,val:''}
    }
  },
  created(){
    window.ipcRenderer = ipcRenderer
    //sqlite3测试
   var sqlite3 = require('sqlite3').verbose();
   console.log("sqlite3测试：",sqlite3)
      let _that = this;
       let lsrc=path.join(__resources, "/data/local.db")
      console.log("路径：",lsrc)
      // let ruing=path.join(remote.app.getPath('userData'), '/data.db');
     const db = new sqlite3.Database(lsrc);
      db.run("create table test( id INTEGER PRIMARY KEY AUTOINCREMENT,name varchar(15))", function() {
      let addname="测名称："+_that.datet();
      db.run('insert into test (name) values("'+addname+'")', function() {
        db.all("select * from test order by id desc limit 8 ", function(err, res) {
          if (!err) {
            _that.list=res
            console.log(JSON.stringify(res));
          } else {
            console.log(err);
          }
        });
      });
    });
    //串口
    ipcRenderer.on('marh-data', (event, arg) => {
        console.log("监听arg：",arg)
      })
      //监听串口
      this.opencom()
  },
  methods:{
     datet(){
       const date = new Date();
      const Y = date.getFullYear() + '-';
      const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
      const D = date.getDate() + ' ';
      const h = date.getHours() + ':';
      const m = date.getMinutes();
      const dateString = Y + M + D + h + m;
      return dateString;
    },
    //系统通知
    sendNotification () {
      const myNotification = new Notification('标题', {
        body: '通知正文内容'
      })
      myNotification.onclick = () => {
        console.log('通知被点击')
      }
    },
    //打开串口
    opencom(){
      const port = new SerialPort('COM3');
      port.on('data',function(data){
        console.log("串口数据：",data)
      });
    },
    //com
    lisenCom(){
      console.log("监听com3..")
       this.opencom()
      // ipcRenderer.send("lalala","数据")
    },
    //c++测试
    CalcButton(){
      const result = myAddDll.funAdd(parseInt(this.cjj.valA), parseInt(this.cjj.valB));
      this.cjj.val=result.toString()
    },
    //C#
    CalcButtonCs(){
      const _this = this
      if (process.platform === 'win32') {
          invoke('这是自定义字符串huang_li_shi', function (err, val) {
          if (err) throw err
              console.log(val)
              alert('调用C# 返回的结果：' + val)
          })
      } else {
          alert('此功能为windows专属功能，mac无法使用')
      }
    },
    //执行cmd命令-处理中文乱码请使用iconv-lite
    doExec(){
      // const iconv = require('iconv-lite')
     // 任何你期望执行的cmd命令，ls都可以
      const cmdStr = 'ipconfig'
      // 执行cmd命令的目录，如果使用cd xx && 上面的命令，这种将会无法正常退出子进程
      const cmdPath = pathUtil.getAppResourcePath('')
      // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
      const workerProcess = exec(cmdStr, { cwd: cmdPath })
      // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
      // 打印正常的后台可执行程序输出
      workerProcess.stdout.on('data', function (data) {
        //  console.log('stdout: ' + iconv.decode(data, 'GBK'))
        console.log('stdout: ' + data)
      })
      // 打印错误的后台可执行程序输出
      workerProcess.stderr.on('data', function (data) {
        //  console.log('stderr: ' + iconv.decode(data, 'GBK'))
        console.log('stderr: ' + data)
      })
      // 退出之后的输出
      workerProcess.on('close', function (code) {
        console.log('out code：' + code)
      })
    },
   //检查更新
    checkUpdate () {
      ipcRenderer.send('checkForUpdate')
    }
  }
}
   function getAppResourcePath (filePath) {
        const path = require('path')
        if (process.platform === 'darwin' || process.platform === 'linux') {
        
        if (process.env.NODE_ENV === 'development') {
            return path.resolve('./resources/' + filePath)
            } else {
            return path.join(__dirname, '..') + filePath
            }
        } else {
            return path.resolve('./resources/' + filePath)
        }
    }
</script>