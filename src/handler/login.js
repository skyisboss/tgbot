const Telegram = require('../telegram/index');
const { readInput, session } = require('../common/helper');
const {sleep} = require('@mtproto/core/src/utils/common')

const api = [];
const initTelegram = async (phone, option) => {
    api[phone] = new Telegram(option)
    return api
}

const handleLogin = async (phones = [], env = 1) => {
    const signIn = async(phone, code = '')=>{
        let flag = false
        try {
            const { phone_code_hash } = await api[phone].sendCode(phone);
            if (!code) {
                code = await readInput('请输入验证码> ')
            }

            console.log('正在登录...');
            const signInResult = await api[phone].signIn({
                code,
                phone,
                phone_code_hash,
            });

            if (signInResult._ === 'auth.authorizationSignUpRequired') {
                await api[phone].signUp({
                    phone,
                    phone_code_hash,
                });
            }

            console.log('登录成功',phone);
            flag = true
        } catch (error) {
            if (error.error_message !== 'SESSION_PASSWORD_NEEDED') {
                console.log(`error:`, error);
                return;
            }

            // 二步验证
		    input = await readInput('输入二步验证密码> ')

            console.log('正在进行二步验证...');
            const { srp_id, current_algo, srp_B } = await api[phone].getPassword();
            const { g, p, salt1, salt2 } = current_algo;

            const { A, M1 } = await api[phone].mtproto.crypto.getSRPParams({
                g,
                p,
                salt1,
                salt2,
                gB: srp_B,
                password,
            });
            const checkPasswordResult = await api[phone].checkPassword({ srp_id, A, M1 });

            console.log('登录成功',phone);
            flag = true
        }
        if (flag) {
            storege.set('data', [...storege.get('data'), phone])
        }
    }
    const initApi = async(phone) => {
         await initTelegram(phone, {
            test: true,
            filepath: `./account/data/${phone}.json`
        })

    }
    const autoLogin = async(phones)=>{
        console.log(`待处理 ${phones.length}`);
        console.time('处理完毕')
        const tasks = []
        for (let j = 0; j < phones.length; j++) {
            const phone = phones[j];
            await initApi(phone)
            const user = await api[phone].getUser();
            if (!user) {
                tasks.push(phone)
            } else {
                storege.set('data', [...storege.get('data'), phone])
                console.log(`${phone} 已登录`);
            }
        }
        
        await Promise.all(tasks.map(async(phone, index) => {
            await signIn(phone, '22222')
        }))
        console.timeEnd('处理完毕')
    }

    if (phones.length > 0) {
        await autoLogin(phones)
        return
    }


    let input = await readInput('请输入电话号码> ')
    const phone = input
    await initApi(input)

    console.log('正在查询用户信息...');
    const user = await api[phone].getUser();
	if (user) {
        console.log(`用户已登录`, user.users[0].first_name +' '+ user.users[0].last_name);
        
	} else {
        console.log('正在发送验证码...');
    
        await signIn(phone)
        /*
        const { phone_code_hash } = await api.sendCode(phone);
        const code = await readInput('请输入验证码> ')
        try {
            console.log('正在登录...');
            const signInResult = await api.signIn({
                code,
                phone,
                phone_code_hash,
            });

            if (signInResult._ === 'auth.authorizationSignUpRequired') {
                await signUp({
                  phone,
                  phone_code_hash,
                });
            }

            console.log('登录成功');
        } catch (error) {
            if (error.error_message !== 'SESSION_PASSWORD_NEEDED') {
                console.log(`error:`, error);
                return;
            }

            // 二步验证
		    input = await readInput('输入二步验证密码> ')

            console.log('正在进行二步验证...');
            const { srp_id, current_algo, srp_B } = await api.getPassword();
            const { g, p, salt1, salt2 } = current_algo;

            const { A, M1 } = await api.mtproto.crypto.getSRPParams({
                g,
                p,
                salt1,
                salt2,
                gB: srp_B,
                password,
            });
            const checkPasswordResult = await api.checkPassword({ srp_id, A, M1 });

            console.log('登录成功');
        }

        */
    }
    //console.clear();
    input = await readInput('登录成功\r\n\r\n0 - 结束程序     1 - 继续登录\r\n请选择> ')
    if (input === 0) {
        process.exit(0)
    } else {
        await handleLogin()
    }
}

var storege;
;(async () => {
    storege = await session()

    let env = await readInput('1 - [添加测试账户]     2 - [添加真实账户]\r\n\r\n请选择> ')
    if (env !== 1 && env !== 2) {
        return
    }
    let phones = []
    
    if (env === 1) {
        let start_phone = await readInput('请输入起始号码> ')
        let total_phone = await readInput('请输入添加数量> ')
        
        for (let index = 0; index < total_phone; index++) {
            phones.push(start_phone ++)
        }
    }
    await handleLogin(phones, env);
})()