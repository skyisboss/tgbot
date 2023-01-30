const WebSocket =require('ws')
let ws = new WebSocket('ws://localhost:4000');



// 打开WebSocket连接后立刻发送一条消息:
ws.on('open', async function () {
    console.log(`[CLIENT] open()`);
    ws.send('Hello!');
});

// 响应收到的消息:
ws.on('message', async function (message) {
    console.log(`[CLIENT] Received: ${message}`);
})