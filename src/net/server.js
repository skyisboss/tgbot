const WebSocket = require('ws');


const WebSocketServer = WebSocket.Server;

//在4000端口上打开了一个WebSocket Server，该实例由变量wss引用。
const wss =new WebSocketServer({
    port:4000
})

//如果有WebSocket请求接入，wss对象可以响应connection事件来处理这个WebSocket：
wss.on('connection',function(ws){  //在connection事件中，回调函数会传入一个WebSocket的实例，表示这个WebSocket连接。
    console.log(`[SERVER] connection()`, ws);
    ws.on('message',function(message){  //我们通过响应message事件，在收到消息后再返回一个ECHO: xxx的消息给客户端。
        console.log(`[SERVER] Received:${message}`);
        ws.send(`ECHO:${message}` ,(err)=>{
            if(err){
                console.log(`[SERVER] error:${err}`);
            }
        })
    })
})