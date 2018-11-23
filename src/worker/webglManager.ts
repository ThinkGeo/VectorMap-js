export class WebglManager {
    workerCallback: any;
    worker: any;

    constructor() {       
        this.worker = {};
        this.workerCallback = {};
        this.initWorkers();
    }

    initWorkers() {
        try {
            let callBack = this.workerCallback;

            let source = '(' + window["webglCaculate"] + ')()';
            let blob = new Blob([source]);

            this.worker = new Worker(window.URL.createObjectURL(blob));
            this.worker.onmessage = function (e) {                
                let data = e.data;
                let uid = data.uid;
                let webglCallBack = callBack[uid];
                // add webglIndexObj to data??? webglIndexObj is the result of earcut
                if (webglCallBack) {
                    let replay = data.messageData.replays[0];  
                    if(replay)                  {
                        replay.Polygon && (replay.Polygon.webglIndexObj = data.webglPolygonIndex);
                        webglCallBack(data.messageData, data.methodInfo);
                    }
                }
                delete callBack[uid];
            }

            return true;
        } catch (e) {
            return false;
        }   
    }

    postMessage(data) {
        let {  
            replays,          
            uid,
            callBack,
            messageData,
            methodInfo
        } = data;

        if (callBack) {
            this.workerCallback[uid] = callBack;  
        }

        let postMessage = {
            replays,
            uid: uid,
            messageData,
            methodInfo
        }
        this.worker.postMessage(postMessage);
    }

    close() {
        this.worker.terminate();
    }
}