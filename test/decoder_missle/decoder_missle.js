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
self.importScripts("decoder_missle_wasm.js");
self.importScripts("raw-parser.js");
var decoder_type = DECODER_H265;
var ptsIdx=0;

// H265Frame =[];
function Decoder(){
// this.timer=null;
this.decodeTimer = null;
this.rawParserObj = null;
this.wasmLoaded = false;
this.tmpReqQue = [];
this.decoderMod = null;
this.token = "base64:QXV0aG9yOmNoYW5neWFubG9uZ3xudW1iZXJ3b2xmLEdpdGh1YjpodHRwczovL2dpdGh1Yi5jb20vbnVtYmVyd29sZixFbWFpbDpwb3JzY2hlZ3QyM0Bmb3htYWlsLmNvbSxRUTo1MzEzNjU4NzIsSG9tZVBhZ2U6aHR0cDovL3h2aWRlby52aWRlbyxEaXNjb3JkOm51bWJlcndvbGYjODY5NCx3ZWNoYXI6bnVtYmVyd29sZjExLEJlaWppbmcsV29ya0luOkJhaWR1";
this.version = '100.2.0';
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
     this.rawParserObj = new RawParserModule();
     this.decoderMod=new MissileDecoderModule(this.token, this.version);
     this.decoderMod.initFinish = () => {
		console.log("init Finshed");
		let bind_ret = this.decoderMod.bindCallback(function(
			y, u, v, 
			stride_y, stride_u, stride_v, 
			width, height, pts,
			pix_name) {
                var obj = {
                    data: y,u,v,
                    stride_y, stride_u, stride_v, 
                    width,
                    height
                }
                var objData = {
                    t: kVideoFrame_Missle,
                    s: pts,
                    d: obj
                };
                self.postMessage(objData, [objData.d.data.buffer]);
                const t2 = new Date().getTime()-decodet1;
                // console.log("decode time:"+t2+" len:"+size);//+" data:"+typedArray.toString(16));
                decodet1=new Date().getTime();
			// console.log("======> One Frame ");
			// console.log("======> ======> width, height, pts", width, height, pts);
			// console.log("======> ======> pix_name", pix_name);
			// console.log("======> ======> Y ", stride_y, y);
			// console.log("======> ======> U ", stride_u, u);
			// console.log("======> ======> V ", stride_v, v);

			// RenderEngine420P.renderFrame(
	        //     yuv,
	        //     y, u, v,
	        //     stride_y, height);
		});
		console.log("bind ret ", bind_ret);

		// main();
	};
	// 3
	this.decoderMod.initDecoder();
    var objData = {
        t: kInitDecoderRsp,
        e: ret
    };
    self.postMessage(objData);
};

Decoder.prototype.openDecoder = function () {
    
    var objData = {
        t: kOpenDecoderRsp,
        e: ret
    };
    self.postMessage(objData);

}
Decoder.prototype.uninitDecoder = function () {
    // var ret = Module._uninitDecoder();
     console.log("Uninit ffmpeg decoder return " + ret + ".");
     this.rawParserObj.release();
	 this.rawParserObj = null;

     this.decoderMod.release();
     this.decoderMod = null;
    // if (this.cacheBuffer != null) {
    //     Module._free(this.cacheBuffer);
    //     this.cacheBuffer = null;
    // }
};
var decodet1=new Date().getTime();
Decoder.prototype.decode=function(){
    let nalBuf = this.rawParserObj.nextNalu(); // nal
    if (nalBuf != false) {
        this.decoderMod.decodeNalu(nalBuf, ptsIdx);
        ptsIdx++;
    }
    
}
Decoder.prototype.startDecoding = function (interval) {
     console.log("Start decoding.");
    if (this.decodeTimer) {
        clearInterval(this.decodeTimer);
    }
    this.decodeTimer = setInterval(this.decode, 0);//interval);
};

Decoder.prototype.pauseDecoding = function () {
     console.log("Pause decoding.");
    if (this.decodeTimer) {
        clearInterval(this.decodeTimer);
        this.decodeTimer = null;
    }
};

Decoder.prototype.sendVideoFrame = function(data,len){

            var typedArray = new Uint8Array(data);
            this.rawParserObj.appendStreamRet(typedArray);

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
            this.openDecoder();
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
