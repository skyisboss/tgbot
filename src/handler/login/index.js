const Telegram = require('../../telegram/index');
const { storage,readInput,makeCommand } = require('../../common/helper');
const {sleep} = require('@mtproto/core/src/utils/common')
const colors = require('colors');

class Login {
    constructor(options = {}) {
        this.telegram = []
        this.options = []
    }
    saveConfig(phone){
        const config = sessionStorege.get()
        const account = config['account']
        
        account[phone] = this.options[phone]  
        sessionStorege.set('account', account)

        const phones = config['phones']
        phones.push(phone)
        sessionStorege.set('phones', [...new Set(phones)])
    }

    async initTelegram(phone, option){
        this.options[phone] = option
        this.telegram[phone] = new Telegram(option)
        return this.telegram[phone]
    }

    async _2FAlogin(phone){
        try {
            // 二步验证
		    const password = await readInput('输入二步验证密码> ')
            console.log('正在进行二步验证...');

            const { srp_id, current_algo, srp_B } = await this.telegram[phone].api.getPassword();
            const { g, p, salt1, salt2 } = current_algo;
            const { A, M1 } = await this.telegram[phone].mtproto.crypto.getSRPParams({
                g,
                p,
                salt1,
                salt2,
                gB: srp_B,
                password,
            });
            const checkPasswordResult = await this.telegram[phone].api.checkPassword({ srp_id, A, M1 });
            return checkPasswordResult
        } catch (error) {
            console.log(`error:`, error);
            return;
        }
    }

    async signIn(phone, code = undefined, env){
        let flag;
        try {
            const { phone_code_hash } = await this.telegram[phone].api.sendCode(phone);
            if (code == undefined) {
                code = await readInput('请输入验证码> ')
            }
            console.log('正在登录...');

            const signInResult = await this.telegram[phone].api.signIn({
                code,
                phone,
                phone_code_hash,
            });
            if (signInResult._ === 'auth.authorizationSignUpRequired') {
                try {
                    await this.telegram[phone].api.signUp({
                        phone,
                        phone_code_hash,
                    });
                } catch (error) {
                    console.log(`error`, error);
                }
            }
            flag = true
        } catch (error) {
            switch (error.error_message) {
                case 'PHONE_NUMBER_BANNED': console.log(`${phone} 提供的电话号码被禁止使用电报`);break;
                case 'PHONE_NUMBER_FLOOD': console.log(`${phone} 您多次询问代码`);break;
                case 'PHONE_NUMBER_INVALID': console.log(`${phone} 电话号码是无效的`);break;
                case 'PHONE_PASSWORD_FLOOD': console.log(`${phone} 您已尝试登录太多次`);break;
                case 'AUTH_RESTART': console.log(`${phone} 重新启动授权过程`);break;
                case 'SESSION_PASSWORD_NEEDED': 
                    const _2FAloginResult = await this._2FAlogin(phone)
                    if (_2FAloginResult && _2FAloginResult['_'] === 'auth.authorization') {
                        console.log('_2FAloginResult',_2FAloginResult);
                        flag = true
                    }
                    break;
                default:
                    console.log(`${phone} 登录失败`, error);
                    return;
            }
            
        }

        if (flag) {
            // this.saveAccount(phone);
            // this.savePhone(phone);
            this.saveConfig(phone);
            console.log(`${phone} 登录成功`);
        }
    }

    async handleLogin(phoneList = [], isTest){
        if (phoneList.length > 0) {
            console.time('处理完毕')
            const handlerCount = []
            // return await autoLogin(phoneList)
            console.log(`待处理数量 ${phoneList.length}`);
            
            for (let i = 0; i < phoneList.length; i++) {
                console.log(`开始处理 ${handlerCount.length + 1} 个`);
                const phone = phoneList[i];
                const user = await this.telegram[phone].api.getUser();
                await sleep(1000)
                if (user) {
                    this.saveConfig(phone);
                    console.log(`${phone} 已登录`);
                } else {
                    await this.signIn(phone, '22222', env)
                }
                handlerCount.push(1)
            }
            console.timeEnd('处理完毕')
        } else {
            const phone = await readInput('请输入电话号码> ')
            console.log('正在发送验证码...');

            await this.initTelegram(phone, {
                test: isTest,
                filepath: `./account/data/${phone}.json`,
                account: phone
            })
            
            await this.signIn(phone, undefined, isTest)
        }
        
        const input = await readInput(makeCommand(
            '\r\n',
            ['结束程序','继续登录'],
            '请选择> '
        ))
        if (input === 0) {
            process.exit(0)
        } else {
            await this.main()
        }

    }

    async removeAccount(phone){
        const config = sessionStorege.get()
        const account = config['account']
        const phones = config['phones']
        
        if (phone in sessionStorege.get('account')) {
            const path = require('path');
            const fs = require('fs')
            const filepath = sessionStorege.get(`account.${phone}.filepath`)

            try {
                fs.unlinkSync(path.resolve(path.resolve('./src'), filepath))
                //file removed
            } catch(err) {
                console.log('删除文件失败',err);
                return
            }
            // const findAccount = account.filter(e => e.account != phone)
            sessionStorege.delete(`account.${phone}`)
            
            const findPhone = phones.indexOf(phone)
            if (findPhone >= 0) {
                phones.splice(findPhone,1)
            }
            console.log(phones);
            sessionStorege.set('phones', phones)

            console.log(`${phone} 已移除`);
        } else {
            console.log(`${phone} 不存在`);
        }
        const input = await readInput(makeCommand('\r\n',['退出','继续'], '请选择> '))
        if (input === 1) {
            await this.main()
        } else {

        }
    }

    async main(){
        console.clear();
        const phoneList = []
        const start_text = makeCommand(
            colors.cyan('账号登录') +' - '+ colors.yellow('猎豹营销系统 v1.0\r\n\r\n'),
            ['添加测试号','添加真实号', '移除账号'],
            '\r\n请选择> '
        )
        const input = await readInput(start_text)
        let isTest = true;
        switch (input) {
            case 0:
                const type = await readInput(makeCommand(
                    '添加测试号\r\n\r\n',
                    ['批量添加','单个添加'],
                    '请选择> '
                ))
                if (type === 0) {
                    let start_phone = await readInput('请输入起始号码> ')
                    let total_phone = await readInput('请输入添加数量> ')
                    if (total_phone <= 0) {
                        return await this.main()
                    }
        
                    for (let I = 0; I < total_phone; I++) {
                        const phone = start_phone ++
                        await this.initTelegram(phone, {
                            test: isTest,
                            filepath: `./account/data/${phone}.json`,
                            account: phone
                        })
                        phoneList.push(phone)
                    }
                }
                else if(type === 1) {

                }
                else {
                    return await this.main()
                }
                break;
            case 1:
                isTest = false;
                break
            case 2:
                const phone = await readInput('请输入电话号码> ')
                return await this.removeAccount(phone)
                
                break
            default:
                return this.main()
        }
        try {
            await this.handleLogin(phoneList, isTest);
        } catch (error) {
            console.log(error);
        }
    }
}

const sessionStorege = storage.session();
(new Login()).main()