const { isMainThread, parentPort } = require('worker_threads');
const {sleep} = require('@mtproto/core/src/utils/common')

if (isMainThread) throw new Error('嘿！你为什么在主线程跑这个玩意！！？？');

// 从主线程获取数据，传入的数据为需要渲染的文件名
parentPort.on('message', async data => {
    console.time('app ' + data)
    for (let i = 0; i < 5; i++) {
        console.log(data);
        await sleep(1000)
    }
    console.timeEnd('app ' + data)
    // 渲染完成后，向主线程发送「Done」
    // 虽然最终结果被写入文件，不需要返回，但是 WorkerPool 仍然需要一个 Worker 执行完毕的信号
    parentPort.postMessage('Done');
});