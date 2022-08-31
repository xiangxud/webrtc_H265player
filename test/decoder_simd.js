self.Module = {
    onRuntimeInitialized: function () {
        onWasmLoaded();
    },
    
};

self.importScripts("common.js");

self.importScripts("videodec_simd_noems6_h265.js")


var pts=0;

H265Frame =[];
AUDIOFrame =[];
function Decoder(){
// this.timer=null;
this.decodeTimer = null;
this.wasmLoaded = false;
this.vtype = 'hevc'
this.format = 'annexb'
this.extraData = ""
this.tmpReqQue = [];
this.decodestatus=false;
this.lastpts = 0;
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

    var ret=0;
    //void VideoDecoder::setCodec(string vtype, string format, string extra)
    Module._codecInit()
    console.log("initDecoder return " + ret + ".");

    var objData = {
        t: kInitDecoderRsp,
        e: ret
    };
    self.postMessage(objData);
};

Decoder.prototype.uninitDecoder = function () {
    var ret = 0;//Module._uninitDecoder();
     Module._clear();
     console.log("Uninit ffmpeg decoder return " + ret + ".");

};
// var data={
//     pts: pts,
//     size: size,
//     iskeyframe: isKeyFrame,
//     packet: h265data
// };
// var req = {
//     t: ksendPlayerVideoFrameReq,
//     l: h265datalen,
//     d: data
// };
const MIN_H265FRAME_FOR_DECODE=0
var decodet1=new Date().getTime();
Decoder.prototype.decode=function(){
    if(H265Frame.length>MIN_H265FRAME_FOR_DECODE){
        // this.decodestatus=true;
        decodet1=new Date().getTime();
        var typedArray=H265Frame[0];//new Uint8Array(H265Frame[0]);
        var packet=typedArray.d;
        var size = typedArray.size;
        // console.log("decode len: " + size)
        console.log("decode pts:",typedArray.pts," packet len:",size," H265Frame total",H265Frame.length)
        var cacheBuffer = Module._malloc(size);
        Module.HEAPU8.set(packet, cacheBuffer);
//void  VideoDecoder::decode(string input, unsigned int isKeyFrame, unsigned int timestamp)
        Module._decode(cacheBuffer,size,typedArray.iskeyframe,typedArray.pts);
        if (cacheBuffer != null) {
            Module._free(cacheBuffer);
            cacheBuffer = null;
        }
        H265Frame.shift();

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
Decoder.prototype.displayVideoFrame = function displayVideoFrame(obj){
        //     var obj = {
        //     data: data,
        //     width,
        //     height
        // }
        var objData = {
            t: kVideoFrame,
            s: pts,
            d: obj
        };
        self.postMessage(objData, [objData.d.data.buffer]);
        const t2 = new Date().getTime()-decodet1;
        console.log("end decode time:"+t2+" len:"+size);//+" data:"+typedArray.toString(16));
        // decodet1=new Date().getTime();
        // displayVideoFrame(obj);
}
IsGreyData = function(data) {
    var isgray=false;
    var len=data.length<100?data.length:100;
    for(var i=0; i<len;i++){
        isgray=data[i]===128?true:false;
    }
    return isgray;
}
Decoder.prototype.decode_seq=function() {
    //void(*VideoCallback)(unsigned char* data,int width, int height, long pts);
    var videoCallback = Module.addFunction(function (yuvArray, width, height, pts) {
        let size = width*height;
        let halfSize = size>>2;
   
        let yPtr = HEAPU32[(yuvArray>>2)]; 
        let uPtr = HEAPU32[(yuvArray>>2) + 1]; 
        let vPtr = HEAPU32[(yuvArray>>2) + 2]; 
   
        let yBuf = HEAPU8.subarray(yPtr, yPtr + size);
        let uBuf = HEAPU8.subarray(uPtr, uPtr + halfSize);
        let vBuf = HEAPU8.subarray(vPtr, vPtr + halfSize);
   
        // let datas = [Uint8Array.from(yBuf), Uint8Array.from(uBuf), Uint8Array.from(vBuf)];
        let datas = new Uint8Array(yBuf.length + uBuf.length + vBuf.length)

        // let out_u = HEAPU8.subarray(addr_u, addr_u + (stride_u * height) / 2)
        // let out_v = HEAPU8.subarray(addr_v, addr_v + (stride_v * height) / 2)
        // let buf_y = new Uint8Array(out_y)
        // let buf_u = new Uint8Array(out_u)
        // let buf_v = new Uint8Array(out_v)
        // let data = new Uint8Array(buf_y.length + buf_u.length + buf_v.length)
        datas.set(yBuf, 0)
        datas.set(uBuf, yBuf.length)
        datas.set(vBuf, yBuf.length + uBuf.length)


       var obj = {
           s: pts,
           data: datas,
           width,
           height,
           
       }
       var objData = {
           t: kVideoFrame,
           d: obj
       };
       self.postMessage(objData, [objData.d.data.buffer]);
       const t2 = new Date().getTime()-decodet1;
       console.log("end decode simd time:"+t2,"pts",pts);//+" data:"+typedArray.toString(16));
    },'viiii')
    this.vtype="hevc";
    this.format="annexb";
    this.extraData="";
    Module._setCodec(this.vtype,this.format,this.extraData,videoCallback);
    // var ret = Module._openDecoder(decoder_type, videoCallback, LOG_LEVEL_WASM)
    // if(ret == 0) {
    console.log("openDecoder success");
    // } else {
    //     console.error("openDecoder failed with error", ret);
    //     // return;
    // }
    var objData = {
        t: kOpenDecoderRsp,
        e: 0
    };
    self.postMessage(objData);
}
// Decoder.prototype.onVideoInfo=function(width,height){
//     this.width=width;
//     this.height=height;
//     var objData={
//         t: kVideoInfo,
//         width: width,
//         height: height
//     };

//     self.postMessage(objData);

// }
// Decoder.prototype.onYUVData = function (yuvArray,pts){
//      let size = this.width*this.height;
//      let halfSize = size>>2;

//      let yPtr = HEAPU32[(yuvArray>>2)]; 
//      let uPtr = HEAPU32[(yuvArray>>2) + 1]; 
//      let vPtr = HEAPU32[(yuvArray>>2) + 2]; 

//      let yBuf = HEAPU8.subarray(yPtr, yPtr + size);
//      let uBuf = HEAPU8.subarray(uPtr, uPtr + halfSize);
//      let vBuf = HEAPU8.subarray(vPtr, vPtr + halfSize);

//      let datas = [Uint8Array.from(yBuf), Uint8Array.from(uBuf), Uint8Array.from(vBuf)];

//     //  let vFrame = {
//     //     pixelType:'I420',
//     //     datas: datas,
//     //     width: this.width,
//     //     height: this.height,
//     //     pts: pts
//     // };
//     // let out_u = HEAPU8.subarray(addr_u, addr_u + (stride_u * height) / 2)
//     // let out_v = HEAPU8.subarray(addr_v, addr_v + (stride_v * height) / 2)
//     // let buf_y = new Uint8Array(out_y)
//     // let buf_u = new Uint8Array(out_u)
//     // let buf_v = new Uint8Array(out_v)
//     // let data = new Uint8Array(buf_y.length + buf_u.length + buf_v.length)
//     // data.set(buf_y, 0)
//     // data.set(buf_u, buf_y.length)
//     // data.set(buf_v, buf_y.length + buf_u.length)

//     var obj = {
//         data: datas,
//         width,
//         height
//     }
//     var objData = {
//         t: kVideoFrame,
//         s: pts,
//         d: obj
//     };
//     self.postMessage(objData, [objData.d.data.buffer]);
//     const t2 = new Date().getTime()-decodet1;
//     console.log("decode time:"+t2);//+" data:"+typedArray.toString(16));
// }
function findMinFrame(H265Frame){
    var min=50000;
    var index=0;
    for(var i=0;i<H265Frame.length;i++){
        if((H265Frame[i].iskeyframe!==true)){
         if(H265Frame[i].size<min){
            min=H265Frame[i].size
            index=i
         }
        }
    }
    return index
}
Decoder.prototype.sendFrame = function(data,type){
            // if(data.pts<=this.lastpts){
            //   return;
            // }
            this.lastpts=data.pts;
            var typedArray = {
               pts: data.pts,
               iskeyframe: data.iskeyframe,
               size: data.size,
            //    d: data.packet//
               d: data.packet//new Uint8Array(data.packet)
            }
            console.log("sendFrame pts:",typedArray.pts)
            // if(H265Frame.length>MAX_FRAME_SIZE){
            //     H265Frame.shift();
            // }
            
            if(type==="VIDEO"){
              if(H265Frame.length>MAX_FRAME_SIZE){
                var index=findMinFrame(H265Frame)
                H265Frame = H265Frame.splice(index, 1)
                // for(var i=0;i<H265Frame.length;i++)
                // if((H265Frame[i].iskeyframe!==true)){
                //     // &&(H265Frame[i].size<MAX_DELETE_FRAME_SIZE)
                //     H265Frame = H265Frame.splice(i, 1)

                //     break
                //     //break;
                //     // H265Frame.shift();
                // }
              }  
              H265Frame.push(typedArray)
            }else if(type==="AUDIO"){
                AUDIOFrame.push(typedArray)
              }

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
            this.sendFrame(req.d,req.type);
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
function onVideoInfo(width,height){
    if (self.decoder) {
        self.decoder.onVideoInfo(width,height);
    } else {
        console.log("[ER] No decoder!");
    }
}
function onYUVData  (yuvArray,pts){
    if (self.decoder) {
        self.decoder.onYUVData(yuvArray,pts);
    } else {
        console.log("[ER] No decoder!");
    }
}