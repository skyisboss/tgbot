const Telegram = require('../telegram/index');
const { readInput } = require('../common/helper');
const path = require('path');

/**
 * 消息群发： 从一个指定的目标频道转发一条消息到指定目的地频道/用户
 * 1、获取已登录账户列表，生成一个api数组实例
 * 2、循环api数组得到每个登录账户实例
 * 3、获取该用户的对话列表，根据关键词过滤出以指定的目标频道和消息
 * 4、配置目的地频道（已用户名组成的数组），群与群之间发送间隔，群内发送间隔
 * 5、开始循环执行任务
 */


/** 获取账户列表 */
const accounts = []
const getAccountList = async()=>{
    const fs = require('fs')
    const Configstore = require('configstore');
    const filename = path.resolve(path.resolve('./src'), `./account/data/index.json`)
    const exists = fs.existsSync(filename)
    if (!exists) {
        throw new Error('文件不存在')
    }
    const localStorage = new Configstore(
        '@mtproto/core',
        {data: []},
        {
          configPath: filename,
        }
    );

    let data = await localStorage.get('data');
    accounts.push(JSON.parse(data))
    return JSON.parse(data)
}

const initApis = async()=>{
    const path = require('path');

    const accounts = await getAccountList()
    const apis = [];
    accounts.map(item => {
        const user = new Telegram({
            test: true,
            filepath: path.resolve('./src', `./account/data/${item}.json`)
        })
        user['account'] = item
        apis.push(user)
    })
    return apis;
}


(async () => {
    const apis = await initApis()

    // 初始化工作线程
    const WorkerPool = require('../net/worker_pool.js');
    const workerPath = path.resolve(path.resolve('./src'), `./net/worker.js`); 
    const pool = new WorkerPool(workerPath)
    
    const promises = apis.map(async (e, i) => await pool.run(`${i} - hello`))
    const results = await Promise.allSettled(promises);

    console.log(results);

    // await Promise.all(apis.map(async (e, i) => await pool.run(`${i} - hello`)))

    // console.log(await users['9996629689'].getUser());
})()

// function sleep(ms){
//     return new Promise(res => setTimeout(res, ms))
// }

// async function test() {
//     const all = [1,2,3,4,5]
//     console.time('程序1')
//     for (const item of all) {
//         await sleep(1000)
//     }
//     console.timeEnd('程序1')

//     console.time('程序2')
//     await Promise.all(all.map(e => sleep(1000)))
//     console.timeEnd('程序2')
// }
// test()