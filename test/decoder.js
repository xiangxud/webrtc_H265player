self.Module = {
    onRuntimeInitialized: function () {
        onWasmLoaded();
    }
};
var LOG_LEVEL_JS = 0;
var LOG_LEVEL_WASM = 1;
var LOG_LEVEL_FFMPEG = 2;
var DECODER_H264 = 0;
var DECODER_H265 = 1;
self.importScripts("common.js");
self.importScripts("libffmpeg_264_265.js");

var decoder_type = DECODER_H265;
var pts=0;

H265Frame =[];
function Decoder(){
// this.timer=null;
this.decodeTimer = null;
this.wasmLoaded = false;
this.tmpReqQue = [];
}
Decoder.prototype.cacheReq = function (req) {
    if (req) {
        this.tmpReqQue.push(req);
    }
};
Decoder.prototype.onWasmLoaded = function () {
     console.log("Wasm loaded.");
    this.wasmLoaded = true;
    while (this.tmpReqQue.length > 0) {
        var req = this.tmpReqQue.shift();
        this.processReq(req);
    }
}
Decoder.prototype.initDecoder = function () {
    // var ret = Module._initDecoder(fileSize, this.coreLogLevel);
    var ret=0;
     console.log("initDecoder return " + ret + ".");
    // if (0 == ret) {
    //     this.cacheBuffer = Module._malloc(chunkSize);
    // }
    // this.frameBuffer.length=0;
    var objData = {
        t: kInitDecoderRsp,
        e: ret
    };
    self.postMessage(objData);
};

Decoder.prototype.uninitDecoder = function () {
    // var ret = Module._uninitDecoder();
     console.log("Uninit ffmpeg decoder return " + ret + ".");
    // if (this.cacheBuffer != null) {
    //     Module._free(this.cacheBuffer);
    //     this.cacheBuffer = null;
    // }
};
var decodet1=new Date().getTime();
Decoder.prototype.decode=function(){
    if(H265Frame.length>0){
        var typedArray=H265Frame[0];//new Uint8Array(H265Frame[0]);

        var size = typedArray.length
        var cacheBuffer = Module._malloc(size);
        Module.HEAPU8.set(typedArray, cacheBuffer);
        // totalSize += size
        // console.log("[" + (++readerIndex) + "] Read len = ", size + ", Total size = " + totalSize)
        const t2 = new Date().getTime()-decodet1;
        console.log("decode time:"+t2+" len:"+size);//+" data:"+typedArray.toString(16));
        Module._decodeData(cacheBuffer, size, pts++)
        if (cacheBuffer != null) {
            Module._free(cacheBuffer);
            cacheBuffer = null;
        }
        H265Frame.shift();
        decodet1=new Date().getTime();
    }
    
}
Decoder.prototype.startDecoding = function (interval) {
     console.log("Start decoding.");
    if (this.decodeTimer) {
        clearInterval(this.decodeTimer);
    }
    this.decodeTimer = setInterval(this.decode, interval);
};

Decoder.prototype.pauseDecoding = function () {
     console.log("Pause decoding.");
    if (this.decodeTimer) {
        clearInterval(this.decodeTimer);
        this.decodeTimer = null;
    }
};
// Decoder.prototype.startdecode=function(){
//     // this.timer = requestAnimationFrame(function fn() {
//     //     // if(this.decodertimer++>=60)
//     //     this.decodertimer=0;
//     //     this.decode();
//     //     requestAnimationFrame(fn);    
//     // })
        
//         // 	move = parseInt(getComputedStyle(box).left);
//         // 	if (move < 800) {
//         // 		box.style.left = move + 8 + 'px';
//         // 		requestAnimationFrame(fn);
//         // 	} else {
//         // 		cancelAnimationFrame(timer);
//     }

Decoder.prototype.decode_seq=function() {

    var start_time = new Date();

    var videoSize = 0;
    var videoCallback = Module.addFunction(function (addr_y, addr_u, addr_v, stride_y, stride_u, stride_v, width, height, pts) {
        console.log("[%d]In video callback, size = %d * %d, pts = %d", ++videoSize, width, height, pts)
        // if (pts===2147483647){ 
        //     return;
        // }
        let size = width * height + (width / 2)  * (height / 2) + (width / 2)  * (height / 2)
        let data = new Uint8Array(size)
        let pos = 0
        for(let i=0; i< height; i++) {
            let src = addr_y + i * stride_y
            let tmp = HEAPU8.subarray(src, src + width)
            tmp = new Uint8Array(tmp)
            data.set(tmp, pos)
            pos += tmp.length
        }
        for(let i=0; i< height / 2; i++) {
            let src = addr_u + i * stride_u
            let tmp = HEAPU8.subarray(src, src + width / 2)
            tmp = new Uint8Array(tmp)
            data.set(tmp, pos)
            pos += tmp.length
        }
        for(let i=0; i< height / 2; i++) {
            let src = addr_v + i * stride_v
            let tmp = HEAPU8.subarray(src, src + width / 2)
            tmp = new Uint8Array(tmp)
            data.set(tmp, pos)
            pos += tmp.length
        }
        var obj = {
            data: data,
            width,
            height
        }
        var objData = {
            t: kVideoFrame,
            s: pts,
            d: obj
        };
        self.postMessage(objData, [objData.d.data.buffer]);
        // displayVideoFrame(obj);
    });

    var ret = Module._openDecoder(decoder_type, videoCallback, LOG_LEVEL_WASM)
    if(ret == 0) {
        console.log("openDecoder success");
    } else {
        console.error("openDecoder failed with error", ret);
        // return;
    }
    var objData = {
        t: kOpenDecoderRsp,
        e: ret
    };
    self.postMessage(objData);

}

Decoder.prototype.sendVideoFrame = function(data,len){

            var typedArray = new Uint8Array(data);
            H265Frame.push(typedArray)
            // var size = typedArray.length
            // var cacheBuffer = Module._malloc(size);
            // Module.HEAPU8.set(typedArray, cacheBuffer);
            // // totalSize += size
            // // console.log("[" + (++readerIndex) + "] Read len = ", size + ", Total size = " + totalSize)

            // Module._decodeData(cacheBuffer, size, pts++)
            // if (cacheBuffer != null) {
            //     Module._free(cacheBuffer);
            //     cacheBuffer = null;
            // }
            // if(size < CHUNK_SIZE) {
            //     console.log('Flush frame data')
            //     Module._flushDecoder();
            //     Module._closeDecoder();
            // }
}
Decoder.prototype.closeDecoder = function () {
     console.log("closeDecoder.");
    if (this.decodeTimer) {
        clearInterval(this.decodeTimer);
        this.decodeTimer = null;
         console.log("Decode timer stopped.");
    }

    // var ret = Module._closeDecoder();
     console.log("Close ffmpeg decoder return " + ret + ".");

    var objData = {
        t: kCloseDecoderRsp,
        e: 0
    };
    self.postMessage(objData);
};
Decoder.prototype.processReq = function (req) {
    // console.log("processReq " + req.t + ".");
    switch (req.t) {
        case kInitDecoderReq:
            this.initDecoder();
            break;
        case kUninitDecoderReq:
            this.uninitDecoder();
            break;
        case kOpenDecoderReq:
            this.decode_seq();
            break;
        case kCloseDecoderReq:
            this.closeDecoder();
            break;
        case kStartDecodingReq:
            this.startDecoding(req.i);
            break;
        case kPauseDecodingReq:
            this.pauseDecoding();
            break;
        case kFeedDataReq:
            this.sendVideoFrame(req.d);
            break;
        // case kSeekToReq:
        //     this.seekTo(req.ms);
        //     break;
        default:
            this.logger.logError("Unsupport messsage " + req.t);
    }
};

self.decoder = new Decoder;

self.onmessage = function (evt) {
    if (!self.decoder) {
        console.log("[ER] Decoder not initialized!");
        return;
    }

    var req = evt.data;
    if (!self.decoder.wasmLoaded) {
        self.decoder.cacheReq(req);
         console.log("Temp cache req " + req.t + ".");
        return;
    }

    self.decoder.processReq(req);
};

function onWasmLoaded() {
    if (self.decoder) {
        self.decoder.onWasmLoaded();
    } else {
        console.log("[ER] No decoder!");
    }
}
