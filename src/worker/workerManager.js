import Worker from "./geo.worker.js";

class WorkerManager {
    constructor() {
        this.workerCount = 1;
        this.currentWorkerIndex = 0;
        this.workers = [];
        this.workerCallback = {};
    }

    initWorkers() {

        // var dataObj = "(" + workerFunction + ")();";
        // var blob = new Blob([dataObj.replace('"use strict";', '')]);
        // var blobURL = (window.URL ? URL : webkitURL).createObjectURL(blob, {
        //     type: 'application/javascript; charset=utf-8'
        // });

        // var worker = new Worker(blobURL);

        // worker.onmessage = function (e) {
        //     console.log('Worker said: ', e.data); // message received from worker
        // };

        var w = new Worker();

        w.onmessage = function (e) {
            console.log('Worker said: ', e.data); // message received from worker
        };
        this.workers.push(w);
    }


    postMessage(uid, methodName, messageData, callbackInfo, workerIndex) {

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

}

export default WorkerManager;