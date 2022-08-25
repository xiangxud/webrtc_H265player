// var isWorker = typeof importScripts == "function";
// var bridgeName = "__CODE_BRIDGE__" + +new Date();
// self.Module = {
//     onRuntimeInitialized: function () {
//         onWasmLoaded();
//     },
//     // onVideoDataSize: function () {
//     //   onVideoDataSize();
//     // },
//     // onVideoData: function () {
//     //   onVideoData();
//     // },
//     // onAudioDataSize: function () {
//     //   onAudioDataSize();
//     // },
//     // onAudioData: function () {
//     //   onAudioData();
//     // },
//   // };
//   // var isWorker = typeof importScripts == "function";
//   // var bridgeName = "__CODE_BRIDGE__" + +new Date();
//   // [bridgeName] = {
//     onHeader: function(header) {
//       //Module.postMessage({ type: "header", data: header });
//     },
//     onMediaInfo: function(mediaInfo) {
//       console.log("onMediaInfo"+mediaInfo.toString(16));
//       //Module.postMessage({ type: "mediaInfo", data: mediaInfo });
//     },
//     onAudioDataSize: function(data) {
//       // Module.audioBufferSize = data.size;
//       // Module.audioBuffer = Module._malloc(Module.audioBufferSize);
//       // Module._codecSetAudioBuffer(Module.audioBuffer);
//     },
//     onAudioData: function(data) {
//       // var timestamp = data.timestamp;
//       // Module.audioTimestamps.push(timestamp);
  
//       // var u8s = Module.HEAPU8.subarray(
//       //   Module.audioBuffer,
//       //   Module.audioBuffer + Module.audioBufferSize
//       // );
  
//       // var output = null;
//       // if (supportSharedBuffer) {
//       //   output = new Uint8Array(new SharedArrayBuffer(u8s.byteLength));
//       //   output.set(u8s);
//       // } else {
//       //   output = new Uint8Array(u8s);
//       // }
  
//       // Module._free(Module.audioBuffer);
//       // Module.audioBuffer = null;
//       // Module.postMessage(
//       //   {
//       //     type: "audio",
//       //     data: {
//       //       buffer: output.buffer,
//       //       timestamp: timestamp
//       //     }
//       //   },
//       //   supportSharedBuffer ? undefined : [output.buffer]
//       // );
//     },
//     onVideoDataSize: function(data) {
//       console.log("onVideoDataSize"+data.toString(16));
//       // if (Module.videoBuffer == null) {
//       //   Module.videoBufferSize = data.size;
//       //   Module.videoBuffer = Module._malloc(Module.videoBufferSize);
//       //   if (supportSharedBuffer) {
//       //     Module.videoSharedBuffer = new SharedArrayBuffer(data.size);
//       //   }
//       // }
//       // Module._codecSetVideoBuffer(Module.videoBuffer);
//     },
//     onVideoData: function(data) {
//       console.log("onVideoData"+data.toString(16));
//       // var timestamp = data.timestamp;
//       // Module.videoTimestamps.push(timestamp);
  
//       // var u8s = Module.HEAPU8.subarray(
//       //   Module.videoBuffer,
//       //   Module.videoBuffer + Module.videoBufferSize
//       // );
  
//       // var output = null;
//       // if (supportSharedBuffer) {
//       //   output = new Uint8Array(Module.videoSharedBuffer);
//       //   output.set(u8s);
//       // } else {
//       //   output = new Uint8Array(u8s);
//       // }
      
//       // Module.postMessage(
//       //   {
//       //     type: "video",
//       //     data: {
//       //       buffer: output.buffer,
//       //       timestamp: timestamp,
//       //       width: data.width,
//       //       height: data.height,
//       //       stride0: data.stride0,
//       //       stride1: data.stride1
//       //     }
//       //   },
//       //   supportSharedBuffer ? undefined : [output.buffer]
//       // );
//     },
//     onComplete: function() {
//       console.log("onComplete");
//       // Module.postMessage({ type: "complete" });
//     }
// };
var Module = {};
self.importScripts("common.js");
self.importScripts("glue.js");
self.importScripts("prod.h265.wasm.js");

// var decoder_type = DECODER_H265;
var ptsIdx=0;

H265Frame =[];
function Decoder(){
// this.timer=null;
this.decodeTimer = null;
this.rawParserObj = null;
this.wasmLoaded = false;
this.tmpReqQue = [];
this.destroied = false;
// this.poddecoder = null;
// this.supportSharedBuffer = false;
// this.bridgeName = "__CODE_BRIDGE__" + +new Date();
// this.audioTimestamps = []
// this.videoTimestamps = []
// this.audioBufferSize = 0
// this.videoBufferSize = 0
// this.audioBuffer = null
// this.videoBuffer = null
// this.videoSharedBuffer =null;
// this.token = "base64:QXV0aG9yOmNoYW5neWFubG9uZ3xudW1iZXJ3b2xmLEdpdGh1YjpodHRwczovL2dpdGh1Yi5jb20vbnVtYmVyd29sZixFbWFpbDpwb3JzY2hlZ3QyM0Bmb3htYWlsLmNvbSxRUTo1MzEzNjU4NzIsSG9tZVBhZ2U6aHR0cDovL3h2aWRlby52aWRlbyxEaXNjb3JkOm51bWJlcndvbGYjODY5NCx3ZWNoYXI6bnVtYmVyd29sZjExLEJlaWppbmcsV29ya0luOkJhaWR1";
// this.version = '100.2.0';
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
    //  try {
    //   this.supportSharedBuffer = !!new SharedArrayBuffer(0);
    // } catch (e) {
    //   // nothing to do...
    // }
    // //  this.bridgeName = "__CODE_BRIDGE__" + +new Date();
    //  Module._codecInit();
    //  var callbackStr = bridgeName.split("");
    //  callbackStr = callbackStr
    //    .map(function(v) {
    //      return v.charCodeAt(0);
    //    })
    //    .concat(0);
 
    //  var callbackStrData = Module._malloc(callbackStr.length - 1);
    //  Module.HEAPU8.set(callbackStr, callbackStrData);
    //  Module._codecSetBridgeName(callbackStrData);

    var objData = {
        t: kInitDecoderRsp,
        e: ret
    };
    self.postMessage(objData);
};

Decoder.prototype.openDecoder = function () {
    
    var objData = {
        t: kOpenDecoderRsp,
        e: 0
    };
    self.postMessage(objData);

}
Decoder.prototype.uninitDecoder = function () {
    var ret = 0;//Module._uninitDecoder();
    // Module._codecFree();
    console.log("Uninit ffmpeg decoder return " + ret + ".");

};

// Decoder.prototype.onHeader = function(header) {

//     // Module.postMessage({ type: "header", data: header });
//   };
//   Decoder.prototype.onMediaInfo = function(mediaInfo) {
//     // Module.postMessage({ type: "mediaInfo", data: mediaInfo });
//   };
//   Decoder.prototype.onAudioDataSize = function(data) {
//    this.audioBufferSize = data.size;
//     this.audioBuffer = Module._malloc(this.audioBufferSize);
//     Module._codecSetAudioBuffer(this.audioBuffer);
//   };
//   Decoder.prototype.onAudioData = function(data) {
//     var timestamp = data.timestamp;
//     this.audioTimestamps.push(timestamp);

//     var u8s = Module.HEAPU8.subarray(
//       this.audioBuffer,
//       this.audioBuffer +this.audioBufferSize
//     );

//     var output = null;
//     if (supportSharedBuffer) {
//       output = new Uint8Array(new SharedArrayBuffer(u8s.byteLength));
//       output.set(u8s);
//     } else {
//       output = new Uint8Array(u8s);
//     }

//     Module._free(this.audioBuffer);
//     this.audioBuffer = null;
//     // Module.postMessage(
//     //   {
//     //     type: "audio",
//     //     data: {
//     //       buffer: output.buffer,
//     //       timestamp: timestamp
//     //     }
//     //   },
//     //   supportSharedBuffer ? undefined : [output.buffer]
//     // );
//   };
//   Decoder.prototype.onVideoDataSize = function(data){
//     if (this.videoBuffer == null) {
//         this.videoBufferSize = data.size;
//         this.videoBuffer = Module._malloc(this.videoBufferSize);
//         if (this.supportSharedBuffer) {
//           this.videoSharedBuffer = new SharedArrayBuffer(data.size);
//         }
//       }
//       Module._codecSetVideoBuffer(this.videoBuffer);
// }
//   Decoder.prototype.onVideoData = function(data) {
//     var timestamp = data.timestamp;
//     this.videoTimestamps.push(timestamp);

//     var u8s = Module.HEAPU8.subarray(
//       this.videoBuffer,
//       this.videoBuffer + this.videoBufferSize
//     );

//     var output = null;
//     if (supportSharedBuffer) {
//       output = new Uint8Array(this.videoSharedBuffer);
//       output.set(u8s);
//     } else {
//       output = new Uint8Array(u8s);
//     }
    
//     // Module.postMessage(
//     //   {
//     //     type: "video",
//     //     data: {
//     //       buffer: output.buffer,
//     //       timestamp: timestamp,
//     //       width: data.width,
//     //       height: data.height,
//     //       stride0: data.stride0,
//     //       stride1: data.stride1
//     //     }
//     //   },
//     //   supportSharedBuffer ? undefined : [output.buffer]
//     // );
//     var obj = {
//         data: output,
//         width: data.width,
//         height: data.height,
//     }
//     var objData = {
//         t: kprodVideoFrame,
//         s: timestamp,
//         stride0: data.stride0,
//         stride1: data.stride1,        
//         d: obj
//     };
//     self.postMessage(objData, [objData.d.data.buffer]);
//   };

//   Decoder.prototype.onComplete=function() {
//     // Module.postMessage({ type: "complete" });
//   }
var decodet1=new Date().getTime();
Decoder.prototype.decodeVideo=function(){
  if(H265Frame.length>0){
    decodet1=new Date().getTime();
    var typedArray= H265Frame.shift();//H265Frame[0];//new Uint8Array(H265Frame[0]);
    h265decode(typedArray);
    // if(Module){
    //   Module.postMessage({
    //         type: 'decode',
    //         buffer: typedArray,
    //     });
    // }
    // var size = typedArray.length
    // var cacheBuffer = Module._malloc(size);
    // Module.HEAPU8.set(typedArray, cacheBuffer);

    // this.audioTimestamps = [];
    // this.videoTimestamps = [];
    // Module._codecDecode(cacheBuffer, size);
    // this.decode(typedArray)

    // if (cacheBuffer != null) {
    //     Module._free(cacheBuffer);
    //     cacheBuffer = null;
    // }
   

 }

    
}
// Decoder.prototype.decodeVideo = function(){    // 对外api，解码一段数据

// }

Decoder.prototype.decode = function(buffer){    // 对外api，解码一段数据
     h265decode(buffer);
  // if(Module){
    
  //   // Module.postMessage({
  //   //       type: 'decode',
  //   //       buffer: buffer,
  //   //   });
  // }
}

Decoder.prototype.destroy = function(){         // 对外api，销毁解码器
  this.destroied = true;
  if(Module){
      // window.URL.revokeObjectURL(this.url);
      Module.postMessage({type: 'destroy'});
  }
}


Decoder.prototype.startDecoding = function (interval) {
     console.log("Start decoding.");
    if (this.decodeTimer) {
        clearInterval(this.decodeTimer);
    }
    this.decodeTimer = setInterval(this.decodeVideo, 0);//interval);
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
    if(H265Frame.length>MAX_FRAME_SIZE){
        H265Frame.shift();
    }
    H265Frame.push(typedArray)

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
// function onVideoDataSize() {
//   if (self.decoder) {
//     self.decoder.onVideoDataSize();
//   } else {
//       console.log("[ER] No decoder!");
//   }
// }
// function onVideoData() {
//   if (self.decoder) {
//     self.decoder.onVideoData();
//   } else {
//       console.log("[ER] No decoder!");
//   }
// }
// function onAudioDataSize() {
//   if (self.decoder) {
//     self.decoder.onAudioDataSize();
//   } else {
//       console.log("[ER] No decoder!");
//   }
// }
// function onAudioData() {
//   if (self.decoder) {
//     self.decoder.onAudioData();
//   } else {
//       console.log("[ER] No decoder!");
//   }
// }