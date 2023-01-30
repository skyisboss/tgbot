const { readInput, storage } = require('../../common/helper');

/**
 * 使用url版本机器人发送带有按钮的信息
 */
class Message {
    constructor() {
        this.baseUrl = 'https://api.telegram.org/'
        this.token   = 'bot5578828503:AAFThD1w9usY3VMs1Cc7RVG9SewZnj9KmcU'
        this.method  = 'sendMessage'
        this.chat_id = '-1001651676187'
        this.message = "🔥急用钱的来，租借银行卡🔥\n\n高价收银行卡  其他银行U盾 即可\n\n中国银行，农业银行，地方银行\n农村信用社，手机银行！\n\n可买断  可长期租用\n\n招实力中介 \n\n广东 同台  骗票高抬贵手\n本人本卡同台，落地三包！\n验卡预付  5000\n跑完现场结清，不拖工资！\n不坑人 不坑人  ！！！！！\n\n飞机✈️  @tt168800\n\n飞机✈️  @tt168800"
        this.message2 = "🔥急用钱的来\r\n银行8800"
        this.parse_mode = 'HTML'
        this.reply_markup = {
            inline_keyboard: [
                [{"text": "上方业务", "url": "https://t.me/tt168800"}, {"text": "点此联系", "url": "https://t.me/tt168800"}],
                [{"text": "猎豹广告 协议推送 日发百万", "url": "https://t.me/tt168800"}]
            ],
        }
    }
    
    send(){
        this.message = 'hello'
        //encodeURI(uri)
        const query = [
            `chat_id=${this.chat_id}`, 
            `text=${encodeURI(this.message)}`,
            `parse_mode=${this.parse_mode}`, 
            `reply_markup=${encodeURI(JSON.stringify(this.reply_markup))}`
        ];
        const uri = `${this.baseUrl}${this.token}/${this.method}?${query.join('&')}`
        console.log(uri);
    }
}

(new Message()).send()