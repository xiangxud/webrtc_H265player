self.Module = {
    onRuntimeInitialized: function () {

    }
};
var webglPlayer, canvas, videoWidth, videoHeight, yLength, uvLength;
var LOG_LEVEL_JS = 0;
var LOG_LEVEL_WASM = 1;
var LOG_LEVEL_FFMPEG = 2;
var DECODER_H264 = 0;
var DECODER_H265 = 1;
self.importScripts("common.js");
function Player(){
    this.decoder_type = DECODER_H265;
    this.decoding = false;
    this.webrtcplayerState = playerStateIdle;
    this.decodeInterval     = 3; //编码定时器
    this.urgent = false;

    this.frameBuffer = [];
}
Player.prototype.setDecoder=function(type) {
    this.decoder_type = type;
}
Player.prototype.startDecoder=function(){
    var self = this;
    this.decoderworker=new Worker("decoder.js");
    // this.decoderworker.initDecoder();
    var req = {
        t: kInitDecoderReq,
    };
    this.decoderworker.postMessage(req);
    this.decoderworker.onmessage=function (evt) {
        var objData = evt.data;
        switch (objData.t) {
            case kInitDecoderRsp:
                self.onInitDecoder(objData);
                break;
            case kOpenDecoderRsp:
                self.onOpenDecoder(objData);
                break;
            case kVideoFrame:
                self.onVideoFrame(objData);
                break;
        }
    }

};
Player.prototype.startDecoding = function () {
    var req = {
        t: kStartDecodingReq,
        i: this.urgent ? 0 : this.decodeInterval,
    };
    this.decoderworker.postMessage(req);
    this.decoding = true;
    this.webrtcplayerState = playerStatePlaying;
    
};

Player.prototype.pauseDecoding = function () {
    var req = {
        t: kPauseDecodingReq
    };
    this.decoderworker.postMessage(req);
    this.decoding = false;
};
Player.prototype.onOpenDecoder=function(objData){
     console.log("reqOpenDecoder response " + objData.e + ".");
    if(objData.e==0){
       this.startDecoding();
    }

}
Player.prototype.onInitDecoder = function (objData) {
  

     console.log("Init decoder response " + objData.e + ".");
    this.reqOpenDecoder();

};
Player.prototype.reqOpenDecoder=function(){
    var req = {
        t: kOpenDecoderReq
    };
    this.decoderworker.postMessage(req);
}
Player.prototype.onFrameData = function (data, len) {
    // console.log("Got data bytes=" + start + "-" + end + ".");
 
    var objData = {
        t: kFeedDataReq,
        d: data
    };
    this.decoderworker.postMessage(objData, [objData.d]);
}
Player.prototype.startBuffering = function () {
    this.buffering = true;
    this.showLoading();
    this.pause();
}

Player.prototype.stopBuffering = function () {
    this.buffering = false;
    this.hideLoading();
    this.resume();
}

Player.prototype.displayVideoFrame = function (frame) {

    var audioTimestamp=0;
    var delay=0
    // console.log("displayVideoFrame delay=" + delay + "=" + " " + frame.s  + " - (" + audioCurTs  + " + " + this.beginTimeOffset + ")" + "->" + audioTimestamp);

    if (audioTimestamp <= 0 || delay <= 0) {
        this.renderVideoFrame(frame.d);
        return true;
    }
    return false;
};

Player.prototype.displayLoop = function() {
    if (this.webrtcplayerState !== playerStateIdle) {
        requestAnimationFrame(this.displayLoop.bind(this));
    }
    if(this.frameBuffer.length>0){
        var frame = this.frameBuffer[0];
        if (this.displayVideoFrame(frame)) {
            this.frameBuffer.shift();
        }
    }
};
Player.prototype.stopDecoder = function() {
     var req={
       t: kPauseDecodingReq,
     }
     this.decoderworker.postMessage(req);
    //  this.stopBuffering();
     this.webrtcplayerState=playerStateIdle;
};
Player.prototype.renderVideoFrame = function (data) {
    // var self = this;
    var playFrame={
        t: kplayeVideoFrame,
        d: data
    }
    self.postMessage(playFrame,[playFrame.d.data.buffer])

};
Player.prototype.getBufferTimerLength = function() {
    if (!this.frameBuffer || this.frameBuffer.length == 0) {
        return 0;
    }

    let oldest = this.frameBuffer[0];
    let newest = this.frameBuffer[this.frameBuffer.length - 1];
    return newest.s - oldest.s;
};
Player.prototype.bufferFrame = function (frame) {
    // If not decoding, it may be frame before seeking, should be discarded.

    this.frameBuffer.push(frame);
     console.log("bufferFrame pts:" + frame.s+" w:" + frame.d.width + ", h: " + frame.d.height);

}
Player.prototype.onVideoFrame = function (frame) {
    this.bufferFrame(frame);
};

Player.prototype.processReq = function (req) {
    // console.log("processReq " + req.t + ".");
    switch (req.t) {
        case kstartPlayerCoderReq:
            this.startDecoder();
            break;
        case kendPlayerCoderReq:
            this.stopDecoder();
            break;
    
        case kInitPlayerReq:
            this.displayLoop();
            break;           
        case ksendPlayerVideoFrameReq:
            this.onFrameData(req.d,req.l);
            break;

        default:
            this.logger.logError("Unsupport messsage " + req.t);
    }
};
self.player = new Player;

self.onmessage = function (evt) {
    if (!self.player) {
        console.log("[ER] Player not initialized!");
        return;
    }

    var req = evt.data;


    self.player.processReq(req);
};
