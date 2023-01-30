class Config {
    constructor() {
        console.log('consig init');
        this.clients = new Map();
        this.api_id = 13248470;
        this.api_hash = 'c56de430407e8097724c41f00ed24708';
        this.account_files = './src/account/';

        this.loop_group_select = 10 * 60;
        this.loop_group_message = 10;

        // 消息监听是否启动
        this.message_monitor = false;
        this.message_monitor_start_time = '';

        // 信息采集是否启动
        this.message_spider = false;
        this.message_spider_start_time = '';
        // 群发广告是否启动
        this.message_sender_start_time = false;
        this.message_sender_start_time = '';
    }

    set(key, value) {
        return config[key] = value;
    }

    get(key) {
        return config[key];
    }
}

const config = new Config();
module.exports = config;