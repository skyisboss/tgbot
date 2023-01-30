const Telegram = require('../../telegram/index');
const { readInput, storage } = require('../../common/helper');
const path = require('path');
const {sleep} = require('@mtproto/core/src/utils/common')
const colors = require('colors');

 
class Sender {
    
    constructor(options = {}) {
        this._phone = []
        this.clients = options.clients || {}
        this.msg_from_user = options.msg_from_user || ''
        this.msg_from_id = options.msg_from_id || 0
        this.msg_send_to = options.msg_send_to || []
    }
    // 初始化客户端
    async initClient(phone = undefined){
        
        if (phone == undefined) {
            const config  = session.get()
            const phones  = config['phones']
            const account = config['account']

            phones.map(phone => {
                this.clients[phone] = new Telegram(account[phone])
            })
            return this.clients 
        } else {
            if (phone in clients) {
                return this.clients[phone]
            }
        }
    }
    // 构建转发配置
    createForwardConfig(phone, from, to){
        // 获取对话框，解析来源群和目标群的 id 和access_hash ，
        // 从来源群获取某条消息
        const dialogs = session.get(`dialogs.${phone}`)
        const from_target = this.filterDialog(dialogs, from)
        const to_target = this.filterDialog(dialogs, to)

        return [{
            _: 'inputPeerChannel',
            channel_id: to_target.id,
            access_hash: to_target.access_hash
        },{
            _: 'inputPeerChannel',
            channel_id: from_target.id,
            access_hash: from_target.access_hash
        }]
    }

    // 获取对话列表
    async getDialogs(client){
        const result = await client.api.getDialogs()
        const _dialogsSession = session.get('dialogs')
        _dialogsSession[client.account] = result
        session.set('dialogs', _dialogsSession)
        return result
    }

    // 转发消息
    async forwardMessages(client, msg_id, to_peer, from_peer){
        return await client.api.forwardMessages(msg_id, to_peer, from_peer)
    }

    // 从对话列表过滤某个对话
    filterDialog(dialogs, target, type = {bot: false, user: false, channel: false}){
        for (let index = 0; index < dialogs.chats.length; index++) {
            const item = dialogs.chats[index];
            if ((target === item.username || target === item.title) && item.id && item.access_hash) {
              return item 
            }
        }
        for (let index = 0; index < dialogs.users.length; index++) {
            const item = dialogs.users[index];
            if ((target === item.username || target === item.first_name) && item.id && item.access_hash) {
              return item 
            }
        }
        return [];
    }

    // 发送任务
    async sendTask(client, phone){
        // 访问调度器获取广告和配置
        // 开发执行任务

        // 解析对话列表，生成转发配置
        //TODO:: 此处应从网络获取配置
        const [to, from] = this.createForwardConfig(phone, '猎豹广告 稳定高效 协议推送 日发百万', '电报机器人开发')

        // 执行发送
        const send = await this.forwardMessages(client, [28], to, from)
        if (send["_"] == 'updates') {
            console.log(colors.yellow(`${phone} send ok ${new Date().toLocaleString()}`))
        }
    }

    // 主任务启动程序
    async mainTask(){
        // 1、获取运行配置
        // 2、启动主任务
        // 3、遍历客户端，执行子任务
        // 4、主任务执行完一轮，根据配置是否休眠
        // 5、调用自身继续运行，以此循环执行

        let runTotal = 0;
        const start_time = Date.now()
        const time_str = new Date(start_time).toLocaleTimeString()
        
        const wait = 0 * 1000
    
        runTotal ++
        console.time(`本次耗时`);
        const useTime = `启动时间: ${time_str}`
        console.log(colors.bgBlue.yellow(`开始第 ${runTotal} 论执行, ${useTime}，当前时间: ${(new Date().toLocaleTimeString())}，已用时间：${(Date.now()-start_time)/1000}`));
        await sleep(100)
        for(const phone in clients) {
            const client = clients[phone]
            console.log(`已用时间：${(Date.now()-start_time)/1000}`);
            await runHanler(client, phone)
        }
        console.log(colors.yellow(`第 ${runTotal} 论执行结束，主动休眠 ${wait/1000} 秒, ${useTime}，当前时间: ${(new Date().toLocaleTimeString())}，已用时间：${(Date.now()-start_time)/1000}`));
        console.timeEnd(`本次耗时`);
        console.log(``);

        await sleep(wait)
        this.mainTask()
    }

    /**
     * 消息群发： 从一个指定的目标频道转发一条消息到指定目的地频道/用户
     * 1、获取已登录账户列表，生成一组客户端实例
     * 2、循环客户端实例 获取该用户的对话列表，根据关键词过滤出以指定的目标频道和消息
     * 4、配置目的地频道（用户名组成的数组），群与群之间发送间隔，群内发送间隔
     * 5、开始循环执行任务
     */
    async main(){
        // 初始化客户端
        const _clients = await this.initClient()

        // 获取每个客户端的对话列表
        for (const _phone in _clients) {
            const _client = _clients[_phone];
            // 测试模式，只取真实账号 639925933411
            if (Number(_phone) !== 639925933411) {
                continue
            }
            if (session.get(`dialogs.${_phone}`) == undefined) {
                await this.getDialogs(_client)
                console.log('dialogs ok');
            }

            try {
                await this.sendTask(_client, _phone)
            } catch (error) {
                console.log(error);
            }
        }
        await sleep(5000)
        this.main()
    }
}

const session = storage.session();
try {
    (new Sender()).main()
} catch (error) {
    console.log(error);
}
return

// let storege;
(async () => {
    const account = session.get('account')
    const runHanler = async(client,phone)=>{
        const getUserResult =  await client.api.getUser()
        console.log( colors.green(`${phone}: 用户名: ${getUserResult.users[0].first_name}`));
        // await sleep(3000)
    }
    
    for (const phone in account) {
        const option = account[phone]
        const client = new Telegram(option)
        clients[phone] = client
    }
    
    let runTotal = 0;
    const start_time = Date.now()
    const time_str = new Date(start_time).toLocaleTimeString()
    const start_clients = async ()=>{
        const wait = 0 * 1000

        runTotal ++
        console.time(`本次耗时`);
        const useTime = `启动时间: ${time_str}`
        console.log(colors.bgBlue.yellow(`开始第 ${runTotal} 论执行, ${useTime}，当前时间: ${(new Date().toLocaleTimeString())}，已用时间：${(Date.now()-start_time)/1000}`));
        await sleep(100)
        for(const phone in clients) {
            const client = clients[phone]
            console.log(`已用时间：${(Date.now()-start_time)/1000}`);
            await runHanler(client, phone)
        }
        console.log(colors.yellow(`第 ${runTotal} 论执行结束，主动休眠 ${wait/1000} 秒, ${useTime}，当前时间: ${(new Date().toLocaleTimeString())}，已用时间：${(Date.now()-start_time)/1000}`));
        console.timeEnd(`本次耗时`);
        console.log(``);

        await sleep(wait)
        start_clients()
    }
    start_clients()
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