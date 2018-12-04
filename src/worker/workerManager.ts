import { VectorTileLayerThreadMode } from "./vectorTileLayerThreadMode";

export class WorkerManager {
    workerCount: number;
    workers: Worker[];
    currentWorkerIndex;

    inited: boolean;
    workerCallback: any;

    constructor(threadMode, workerCount: number) {
        if (threadMode === VectorTileLayerThreadMode.SingleBackgroundWorker) {
            this.workerCount = 1;
        }
        else {
            if (isNaN(workerCount) || workerCount <= 0) {
                this.workerCount = Math.max(Math.floor(window.navigator.hardwareConcurrency / 2), 1);
            }
            else {
                // passed by parm
                this.workerCount = workerCount;
            }
        }
        this.currentWorkerIndex = 0;
        this.workers = [];
        this.workerCallback = {};
    }

    initWorkers() {
        try {
            let callbacks = this.workerCallback;
            for (let i = 0; i < this.workerCount; i++) {
                let source = '(' + window["olInit"] + ')()';
                let blob = new Blob([source]);
                let worker = new Worker(window.URL.createObjectURL(blob));
                worker.onmessage = function (e) {
                    let methodInfo = e.data["methodInfo"];
                    let messageData = e.data["messageData"];
                    let uid = methodInfo.uid;
                    let callback = callbacks[uid];                    
                    if(false && methodInfo.methodName === 'createReplay'){
                        let replays = messageData.replays[0];
                        
                        (<any>window).webglManager.postMessage({
                            replays: replays,
                            uid: uid,
                            callBack: callback,
                            messageData: messageData,
                            methodInfo: methodInfo
                        });   
                    } else{
                        if (callback) {
                            callback(messageData, methodInfo);
                        }
                    }  
                    delete callbacks[uid];
                }
                this.workers.push(worker);
            }
            this.inited = true;
            return true;
        }
        catch (e) {
            this.inited = false;
            return false;
        }

    }

    postMessage(uid: string, methodName: string, messageData, callbackInfo, workerIndex) {

        if (typeof workerIndex !== "number" || isNaN(workerIndex) || workerIndex >= this.workers.length) {
            workerIndex = this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.workers.length;
        }

        let methodInfo = {
            uid: uid,
            methodName: methodName,
            workerId: workerIndex
        };

        if (callbackInfo) {
            this.workerCallback[uid] = callbackInfo;
        }

        let postMessage = {
            methodInfo: methodInfo,
            messageData: messageData
        }

        this.workers[workerIndex].postMessage(postMessage);
        return workerIndex;
    }

    close() {
        this.workerCallback = {};
        for (let index = 0; index < this.workers.length; index++) {
            this.workers[index].terminate();
        }
    }
}