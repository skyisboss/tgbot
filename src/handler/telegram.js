import * as path from 'path';
import MTProto from '@mtproto/core/envs/node/index.js';
import {sleep, getRandomInt} from '@mtproto/core/src/utils/common/index.js';


class telegram {
    
    constructor(options = {}) {
        if (!options?.account) {
            throw new Error('account not found.');
        }
        const __dirname = path.resolve('./src');
        this.mtproto = new MTProto({
            // test: true,
            api_id: 13248470,
            api_hash: 'c56de430407e8097724c41f00ed24708',
      
            storageOptions: {
              path: path.resolve(__dirname, `./account/${options?.account}.json`),
            },
        });

        
        if (options?.update) {
            handleUpdates()
        }
    }

    handleUpdates(){
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

    async call(method, params, options = {}) {
        // options = {...options, dcId: 1 }
        try {
          const result = await this.mtproto.call(method, params, options);
    
          return result;
        } catch (error) {
    
          const { error_code, error_message } = error;
    
          if (error_code != 400 || error_message != 'BOT_RESPONSE_TIMEOUT') {
            console.log(`${method} error:`, error);
          }
    
          if (error_code === 420) {
            const seconds = Number(error_message.split('FLOOD_WAIT_')[1]);
            const ms = seconds * 1000 + 100;;
    
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
    
          return Promise.reject(error);
        }
    }
}
const { session } = require('../../common/helper');
const storege = await session();

export default telegram