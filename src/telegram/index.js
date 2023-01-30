const path = require('path');
const MTProto = require('@mtproto/core');
// const { sleep } = require('@mtproto/core/src/utils/common');
const Api = require('./api');
const { timeStamp } = require('console');
const { sleep } = require('../common/helper');

let showWait = true
let FLOOD_WAIT_X = 0
class Telegram {

  constructor(options = {}) {
    if (!options?.account) {
      // throw new Error('account not found.');
      options.account = Date.now()
    }

    const __dirname = path.resolve('./src');
    const api_id = options?.api_id || 13248470
    const api_hash = options?.api_hash || 'c56de430407e8097724c41f00ed24708'
    const filepath = options?.filepath || path.resolve(__dirname, `./account/api_id#${api_id}/account#${options?.account}.json`)
    
    this.api = new Api(this)
    this.account = options?.account
    this.mtproto = new MTProto({
      test: options?.test || false,
      api_id: api_id,
      api_hash: api_hash,
      bot_auth_token: options?.bot_auth_token || '',

      storageOptions: {
        // path: path.resolve(__dirname, `./account/api_id#${api_id}/account#${options?.account}.json`),
        path: path.resolve(__dirname, filepath),
      },
    });

    if (options?.handler_update) {
      this.registerUpdates()
    }
  }
  async call(method, params, options = {}) {
    // options = {...options, dcId: 1 }
    try {
      const result = await this.mtproto.call(method, params, options);

      return result;
    } catch (error) {

      const { error_code, error_message } = error;

      if (error_code === 420) {
        const seconds = Number(error_message.split('FLOOD_WAIT_')[1]);
        const ms = seconds * 1000;

        const colors = require('colors');
        console.log(colors.bgBlue.yellow(`${this.account} 被动休眠 ${ms / 1000} 秒`));

        await sleep(ms);

        return this.call(method, params, options);
      }

      if (error_code === 303) {
        const [type, dcIdAsString] = error_message.split('_MIGRATE_');

        const dcId = Number(dcIdAsString);

        // If auth.sendCode call on incorrect DC need change default DC, because
        // call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
        if (type === 'PHONE') {
          await this.mtproto.setDefaultDc(dcId);
        } else {
          Object.assign(options, { dcId });
        }

        return this.call(method, params, options);
      }

      if (error_message != 'AUTH_KEY_UNREGISTERED' && error_message != 'BOT_RESPONSE_TIMEOUT') {
        if (error_code !== 420) {
          // console.log(`${method} error:`, error, this.account);
        }
        console.log(`${method} error:`, error, this.account);
      }

      return Promise.reject(error);
    }
  }

  registerUpdates() {
    this.mtproto.updates.on('updatesTooLong', (updateInfo) => {
      console.log('updatesTooLong:', updateInfo);
    });

    this.mtproto.updates.on('updateShortMessage', (updateInfo) => {
      console.log('updateShortMessage:', updateInfo);
    });

    this.mtproto.updates.on('updateShortChatMessage', (updateInfo) => {
      console.log('updateShortChatMessage:', updateInfo);
    });

    this.mtproto.updates.on('updateShort', (updateInfo) => {
      console.log('updateShort:', updateInfo);
    });

    this.mtproto.updates.on('updatesCombined', (updateInfo) => {
      console.log('updatesCombined:', updateInfo);
    });

    this.mtproto.updates.on('updates', (updateInfo) => {
      console.log('updates:', updateInfo);
    });

    this.mtproto.updates.on('updateShortSentMessage', (updateInfo) => {
      console.log('updateShortSentMessage:', updateInfo);
    });
  }
  /*
      async getUser() {
          try {
            const user = await this.call('users.getFullUser', {
              id: {
                _: 'inputUserSelf',
              },
            });
        
            return user;
          } catch (error) {
            return null;
          }
      }
      
      sendCode(phone) {
        return this.call('auth.sendCode', {
            phone_number: phone,
            settings: {
            _: 'codeSettings',
            },
        });
      }
      
      signIn({ code, phone, phone_code_hash }) {
      return this.call('auth.signIn', {
          phone_code: code,
          phone_number: phone,
          phone_code_hash: phone_code_hash,
      });
      }
      
      signUp({ phone, phone_code_hash }) {
      return this.call('auth.signUp', {
          phone_number: phone,
          phone_code_hash: phone_code_hash,
          first_name: 'MTProto',
          last_name: 'Core',
      });
      }
      
      getPassword() {
      return this.call('account.getPassword');
      }
      
      checkPassword({ srp_id, A, M1 }) {
      return this.call('auth.checkPassword', {
          password: {
          _: 'inputCheckPasswordSRP',
          srp_id,
          A,
          M1,
          },
      });
      }
  
      */
}
const { storage } = require('../common/helper');
storage.session()

module.exports = Telegram;