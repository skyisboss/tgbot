class Api {
    constructor(mtproto) {
        this.mtproto = mtproto
    }

    async getUser() {
        try {
            const user = await this.mtproto.call('users.getFullUser', {
                id: {
                    _: 'inputUserSelf',
                },
            });

            return user;
        } catch (error) {
            return null;
        }
    }

    async sendCode(phone) {
        return await this.mtproto.call('auth.sendCode', {
            phone_number: phone,
            settings: {
                _: 'codeSettings',
            },
        });
    }

    async signIn({ code, phone, phone_code_hash }) {
        return await this.mtproto.call('auth.signIn', {
            phone_code: code,
            phone_number: phone,
            phone_code_hash: phone_code_hash,
        });
    }

    async signUp({ phone, phone_code_hash }) {
        return  this.mtproto.call('auth.signUp', {
            phone_number: phone,
            phone_code_hash: phone_code_hash,
            first_name: 'MTProto',
            last_name: 'Core',
        });
    }

    async getPassword() {
        return await this.mtproto.call('account.getPassword');
    }

    async checkPassword({ srp_id, A, M1 }) {
        return await this.mtproto.call('auth.checkPassword', {
            password: {
                _: 'inputCheckPasswordSRP',
                srp_id,
                A,
                M1,
            },
        });
    }

    /**
     * 获取对话列表
     * @returns 
     */
     async getDialogs (limit = 100) {
        return await this.mtproto.call('messages.getDialogs', {
          offset_id: 0,
          limit: limit,
          hash: 0,
          exclude_pinned: false,
          offset_peer: { _: "inputPeerSelf", }
        });
    }

    /**
     * 获取频道群组消息
     * @param {{ channel_id:number, access_hash:string }} channel inputChannel 
     * @param { { "_": "inputMessageID", id: number }[] } id 消息id
     * @returns 
     */
    async getMessages (id, channel) {
        // for (let i = 0; i < id.length; i++) {
        //     id[i]['_'] = 'inputMessageID'
        // }
        // channel.channel['_'] = 'inputChannel'
        return await this.mtproto.call('channels.getMessages', {
            channel: channel,
            id: id,
        });
    }

    /**
     * 转发消息
     * @param { number[] } msg_id 
     * @param {number} random_id 
     * @param {{ _: 'inputPeerChannel'|'inputPeerUser', ['channel_id'|'user_id']: number access_hash: string }} to_peer 
     * @param {{ _: 'inputPeerChannel'|'inputPeerUser', ['channel_id'|'user_id']: number access_hash: string }} from_peer 
     * @returns 
     */
    async forwardMessages (msg_id, to_peer, from_peer) {
        return await this.mtproto.call('messages.forwardMessages', {
            id: msg_id ,//[6],
            random_id: [ Date.now() ],
            drop_author: false, // 转发时是否隐藏原作者
            to_peer: to_peer, 
            from_peer: from_peer,
            // from_peer: {
            //     _: 'inputPeerChannel',
            //     channel_id: 1191264954,
            //     access_hash: '486836519978908226'
            // },
        })
    }

}

// const api = new API;
module.exports = Api;