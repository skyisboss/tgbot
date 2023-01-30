const readLine = require('readline')

const response = {
    ok: (res, msg = '', data = []) => {
        res.json({ err: 0, msg: msg || 'ok', data: data })
    },
    error: (res, msg = '', data = []) => {
        res.json({ err: 1, msg: msg || 'error', data: data })
    }
}

const readInput = async (showText = '') => {
    // const readLine = require('readline');
    // console.clear()
    // console.log('\r\n')
    const rl = readLine.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    const getInput = async () => {
      return new Promise((resolve, reject) => {
        rl.question(showText, (text) => {
          resolve(isNaN(text.trim()) ? text.trim() : Number(text.trim()))
        })
      })
    }
    const input = await getInput();
    rl.close();

    return input;
}

const makeCommand = (first, arr, end) => {
    let res = []
    
    arr.map((e,i) => {
        const index = i
        if (e.trim()) {
            let ling = `${index} - [${e}]       `
            if (index % 3 === 0 && index != 0) {
                res.push(ling + '\r\n')
            }
            else if(arr.length <= 3) {
                res.push(ling)
                switch (arr.length) {
                    case 1: if(i ===0) res[0] += '\r\n'
                         break;
                    case 2: if(i ===1) res[1] += '\r\n'
                        break;
                    case 3: if(i ===2) res[2] += '\r\n'
                        break;
                }
            }
            else {
                res.push(ling) 
            }
        }
    })

    return first + res.join('') + end
}

const storage = {
    instance: undefined,
    session:()=>{
        if (storage.instance == undefined) {
            const path = require('path');
            const Configstore = require('configstore');
            const filename = path.resolve(path.resolve('./src'), `./account/data/config.json`)
            storage.instance = new Configstore(
                '@mtproto/core',
                {phones: [], account: {}},
                {
                configPath: filename,
                }
            );
        }
        return storage.instance
    },
    get:(...args)=>storage.session().get(...args),
    set:(...args)=>storage.session().set(...args),
}

const sleep = (ms) => new Promise(async (resolve) => setTimeout(resolve, ms));

module.exports = {
    sleep,
    storage,
    response,
    readInput,
    makeCommand,
}