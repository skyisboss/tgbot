const account = require('./handler/account');
const { readInput, makeCommand } = require('./common/helper');
const WebSocket = require('ws');
const Telegram = require('./telegram/index');
const config = require('./common/config');


const handlerAccount = {
    check: async() => {
        console.log('全部账户 102');
        console.log('已 登 录 102');
        console.log('状态正常 102');
        console.log('状态异常 102\r\n');
        const arr = []
        const welcome = makeCommand('', arr,'\r\n请选择>', true)
    
        const input = Number(await readInput(welcome))
        if (!isNaN(input) && input >= 1 && input <= arr.length) {
            // console.log(`进入 [${arr[input -1]}] 操作`);
            switch (input) {
                case 1:break;
                case 2:break;
                case 3:break;
                default:
                    await mainCommand()
                break;
            }
        } else {
            await mainCommand()
        }
    },
    add: async() => {
        const phone = await readInput(`请输入手机号>`)
        console.log('验证码已发送');
        const code = await readInput(`请输入验证码>`)
        console.log('登录成功');

        const text = makeCommand('', ['继续添加'],'\r\n请选择>', true)
        await readInput(text)
    }

}
const accountCommand = {
    check: async()=>{
        

        const handler1 = async()=>{
            console.clear()

            let show = '账户列表\r\n\r\n';
            show += '+63789654123 [加入群组: 500] [对话列表: 493]\r\n';
            show += '+63789654123 [加入群组: 500] [对话列表: 493]\r\n';
            show += '+63789654123 [加入群组: 500] [对话列表: 493]\r\n';
            show += '***当前还有数据，请查看下页***\r\n';
            console.log(show);

            let text = makeCommand('', ['返回上页','查看下页'],'请选择>')
            let input = await readInput(text)
            await accountCommand.check()
        }
        const handler2 = async()=>{

        }

        console.clear()
        let show = '查看账号\r\n\r\n';
        show += '全部账户: 102\r\n';
        show += '状态正常: 102\r\n';
        show += '状态异常: 0\r\n';
        console.log(show);

        let text = makeCommand('', ['返回上页','账户列表','异常列表'],'请选择>')
        let input = await readInput(text)

        switch (input) {
            case 0:
                await mainCommand()
                break;
            case 1:
                handler1()
                break;
            case 2:
                handler2()
                break;
            default:
                accountCommand.check() 
        }
    },
    add: async()=>{
        console.clear()

        let text = makeCommand('添加账号\r\n\r\n', ['返回上页'],'请选择电话号码>')
        let input = await readInput( text )
        if (input === 0) {
            return await mainCommand()
        }
        await readInput(`请输入验证码>`)

        text = makeCommand('账户 [xxx] 登录成功\r\n\r\n', ['返回上页','继续添加'],'请选择>')
        input = await readInput(text)
        if (input === 1) {
            console.log('您选择 [继续添加]\r\n');
            await accountCommand.add();
        } else {
            await mainCommand()
        }
    },
}
const settingCommand = async()=>{
    console.clear()

    let show = '系统设置\r\n\r\n';
    show += ': 未启动\r\n';
    show += '已发数量: 0\r\n';
    show += '异常数量: 0\r\n';
    console.log(show);
}
const messageCommand = {
    sender: async()=>{
        console.clear()

        const handler1 = ()=>{}
        const handler2 = ()=>{}

        let show = '群发广告\r\n\r\n';
        show += '当前状态: 未启动\r\n';
        show += '已发数量: 0\r\n';
        show += '异常数量: 0\r\n';
        console.log(show);

        const text = makeCommand('', ['返回上页','实时数据','启动群发'],'请选择>')
        let input = await readInput(text)
        switch (input) {
            case 0:
                await mainCommand()
                break;
            default:
                await messageCommand.sender()
                break;
        }

    },
    monitor: async()=>{
        console.clear()

        const handler1 = ()=>{}
        const handler2 = ()=>{}

        let show = '消息监听\r\n\r\n';
        show += '当前状态: 未启动\r\n';
        show += '监听数量: 0\r\n';
        show += '异常数量: 0\r\n';
        console.log(show);

        const text = makeCommand('', ['返回上页','监听设置','启动群发'],'请选择>')
        let input = await readInput(text)
        switch (input) {
            case 0:
                await mainCommand()
                break;
            default:
                await messageCommand.sender()
                break;
        }
    },
    spider: async()=>{
        console.clear()

        const handler1 = ()=>{}
        const handler2 = ()=>{}

        let show = '信息采集\r\n\r\n';
        show += '当前状态: 未启动\r\n';
        show += '采集数量: 0\r\n';
        show += '异常数量: 0\r\n';
        console.log(show);

        const text = makeCommand('', ['返回上页','采集设置','启动采集'],'请选择>')
        let input = await readInput(text)
        switch (input) {
            case 0:
                await mainCommand()
                break;
            default:
                await messageCommand.sender()
                break;
        }
    },
}
const mainCommand = async () => {
    console.clear()

    const arr = ['', '查看账号','添加账号','系统设置','群发广告','消息监听','信息采集']
    const welcome = makeCommand('猎豹营销系统 v1.0\r\n\r\n', arr,'\r\n请选择>')

    const input = Number(await readInput(welcome))
    if (!isNaN(input) && input >= 0 && input <= arr.length) {
        console.log(`您选择 [${arr[input]}]\r\n`);
        switch (input) {
            case 1:
                await accountCommand.check()
                break;
            case 2:
                await accountCommand.add()
                break;
            case 3:break;
            case 4:
                await messageCommand.sender()
                break;
            case 5:
                await messageCommand.monitor()
                break;
            case 6:
                await messageCommand.spider()
                break;
            case 0:
                await mainCommand()
                break;
        }
    } else {
        await mainCommand()
    }
}

//导入内置模块
const EventEmitter = require('events');
const util=require('util');
const taskEvent = () => {
    //Man继承EventEmitter
    util.inherits(Man,EventEmitter); 
    //创建一个函数
    function Man(){}
    //实例化函数
    let man=new Man();
    
    function findGirl() {
      console.log('找新的女朋友')
    }
    function saveMoney() {
      console.log('省钱')
    }
    man.on('失恋',findGirl)//失恋 ，绑定一个函数方法
    man.on('失恋',saveMoney)//失恋 ，绑定一个函数方法
    // man.removeListener('失恋',findGirl); //移除省钱
    man.emit('失恋')
}

const initSystem  = async()=>{
    console.log('正在启动');
    console.log('启动完成');
}



const runWorker = () => {
    const WorkerPool = require('./net/worker_pool.js');
    // const { join, dirname } = require('path');
    // const workerPath = join(__dirname + '/net/worker.js');
    // const pool = new WorkerPool(workerPath)
    // await pool.run('hello')
    // console.log(pool);
}
const start = async () => {
    

    await initSystem()
    await mainCommand()
    // const api = new Telegram({account: 9776})
    // console.log(api);

    
    
}

start();