import { VectorTileLayerThreadMode } from "./vectorTileLayerThreadMode";

export class WebglManager {
    workerCallback: any;
    worker: any;
    canvasContext: any;
    webglContext: any;
    callBackArg: any;

    constructor() {       
        this.worker = {};
        this.canvasContext = {};
        this.webglContext = {};
        this.workerCallback = {};
        this.initWorkers();
    }

    initWorkers() {
        try {
            let callBack = this.workerCallback;
            let canvasContext = this.canvasContext;
            let webglContext = this.webglContext;

            let source = '(' + window["webglCaculate"] + ')()';
            let blob = new Blob([source]);

            this.worker = new Worker(window.URL.createObjectURL(blob));
            this.worker.onmessage = function (e) {                
                let data = e.data;
                let uid = data.uid;
                let webglCallBack = callBack[uid];
                // add webglIndexObj to data??? webglIndexObj is the result of earcut
                if (webglCallBack) {
                    data.webglContext = webglContext[uid];
                    data.canvasContext = canvasContext[uid];
                    data.messageData.webglIndexObj=data.webglIndexObj;
                    webglCallBack(data.messageData,data.methodInfo);
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
            coordinates,
            webglEnds,
            webglStyle,
            uid,
            callBack,
            canvasContext,
            webglContext,
            messageData,
            methodInfo
        } = data;

        if (callBack) {
            this.workerCallback[uid] = callBack;  
            this.canvasContext[uid] = canvasContext;
            this.webglContext[uid] = webglContext;
        }
        let postMessage = {
            coordinates,
            webglEnds,
            webglStyle,
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