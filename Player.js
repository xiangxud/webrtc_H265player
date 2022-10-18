self.Module = {
	onRuntimeInitialized: function() {

	}
};
self.importScripts("common.js");
// var USE_MISSILE = false;
// var decoder_type;
// var DECODER_TYPE = kDecoder_decodeer_js;
// var DECODER_TYPE = kDecoder_wx_h265_wasm_combine_js;
var webglPlayer, canvas, videoWidth, videoHeight, yLength, uvLength;
var LOG_LEVEL_JS = 0;
var LOG_LEVEL_WASM = 1;
var LOG_LEVEL_FFMPEG = 2;
var DECODER_H264 = 0;
var DECODER_H265 = 1;

function Player() {
	this.decoder_type = DECODER_TYPE; //DECODER_H265;
	this.decoding = false;
	this.webrtcplayerState = playerStateIdle;
	this.decodeInterval = 5; //编码定时器
	this.urgent = false;
	this.destroied = false;
	this.decoderworker = null;
	this.frameBuffer = [];
	// this.Module = {};
}
Player.prototype.setDecoder = function(type) {
	this.decoder_type = type;
}

Player.prototype.startDecoder = function(decoder_type) {
	//debugger;
	var self = this;
	self.setDecoder(decoder_type);
	switch(decoder_type) {
		case kDecoder_simd_decoder_js:
			self.decoderworker = new Worker("decoder_simd.js");
			var req = {
				t: kInitDecoderReq,
			};
			self.decoderworker.postMessage(req);
			self.decoderworker.onmessage = function(evt) {
				var objData = evt.data;
				switch(objData.t) {
					case kInitDecoderRsp:
						self.onInitDecoder(objData);
						break;
					case kOpenDecoderRsp:
						self.onOpenDecoder(objData);
						break;
					case kVideoFrame:
						self.onVideoFrame(objData.d);
						break;

					default:
						console.log("Unsupport messsage " + req.t);
				}
			}
			break;
		case kDecoder_decodeer_js:
			self.decoderworker = new Worker("decoder.js");
			var req = {
				t: kInitDecoderReq,
			};
			self.decoderworker.postMessage(req);
			self.decoderworker.onmessage = function(evt) {
				var objData = evt.data;
				switch(objData.t) {
					case kInitDecoderRsp:
						self.onInitDecoder(objData);
						break;
					case kOpenDecoderRsp:
						self.onOpenDecoder(objData);

						break;
					case kVideoFrame:
						self.onVideoFrame(objData.d);
						break;
					default:
						console.log("Unsupport messsage " + req.t);
				}
			}
			break;
			// this.decoderworker=new Worker("decoder_missle.js");
		case kDecoder_wx_h265_wasm_combine_js:
			// this.decoderworker=new Worker("prod_decoder.js");  
			self.Module = {};
			self.decoderworker = new Worker("decoder_wx.js");
			// self.SetWxDecoder(self.decoderworker,self);
			var req = {
				t: kInitDecoderReq,
			};
			self.decoderworker.postMessage(req);
			self.decoderworker.onmessage = function(evt) {
				var objData = evt.data;
				switch(objData.t) {
					case kInitDecoderRsp:
						self.onInitDecoder(objData);
						break;
					case kOpenDecoderRsp:
						self.onOpenDecoder(objData);
						break;
					case kVideoFrame:
						self.onVideoFrame(objData);
						break;

					default:
						console.log("Unsupport messsage " + req.t);
				}
			}
			break;
		case kDecoder_missile_decoder_js:
			self.decoderworker = new Worker("decoder_missle.js"); //prod.h265.wasm.combine.js");
			var req = {
				t: kInitDecoderReq,
			};
			self.decoderworker.postMessage(req);
			console.log("InitMissleDecoder");
			self.decoderworker.onmessage = function(evt) {
				var objData = evt.data;
				switch(objData.t) {
					case kInitDecoderRsp:
						self.onInitDecoder(objData);
						break;
					case kOpenDecoderRsp:
						self.onOpenDecoder(objData);
						// self.displayLoop();
						// var req = {
						//     t: kInitPlayerReq,
						// };
						// self.postMessage(req);
						break;
					case kVideoFrame_Missle:
						self.onVideoFrame_Missle(objData);
						break;
					default:
						console.log("Unsupport messsage " + req.t);
				}
			}
			// this.InitMissleDecoder();
			break;
		default:
			console.error("not supported");

	}

};
Player.prototype.ReqInitDecoder = function() {
	var req = {
		t: kInitDecoderReq,
	};
	this.decoderworker.postMessage(req);
}
Player.prototype.InitMissleDecoder = function() {
	var req = {
		t: kInitDecoderReq,
	};
	this.decoderworker.postMessage(req);
	console.log("InitMissleDecoder");
	this.decoderworker.onmessage = function(evt) {
		var objData = evt.data;
		switch(objData.t) {
			case kInitDecoderRsp:
				self.onInitDecoder(objData);
				break;
			case kOpenDecoderRsp:
				self.onOpenDecoder(objData);
				// self.displayLoop();
				// var req = {
				//     t: kInitPlayerReq,
				// };
				// this.postMessage(req);
				break;
			case kVideoFrame_Missle:
				self.onVideoFrame_Missle(objData);
				break;
			default:
				console.log("Unsupport messsage " + req.t);
		}
	}
}
// Player.prototype.SetDecoder = function (worker,self){
//     var req = {
//         t: kInitDecoderReq,
//     };
//     worker.postMessage(req);
//     worker.onmessage=function (evt) {
//         var objData = evt.data;
//         switch (objData.t) {
//             case kInitDecoderRsp:
//                 self.onInitDecoder(objData);
//                 break;
//             case kOpenDecoderRsp:
//                 self.onOpenDecoder(objData);
//                 break;
//             case kVideoFrame:
//                 self.onVideoFrame(objData);
//                 break;
//             // case kVideoFrame_Missle:
//             //     self.onVideoFrame_Missle(objData);
//             //     break;    
//             case kprodVideoFrame:
//                 self.onVideoFrame_Prod(objData);
//                 break;
//             case "decode":
//                 console.log("decode"+objData)
//                 break;    
//             default:
//                 console.log("Unsupport messsage " + req.t);     
//         }
//     }
// }
Player.prototype.SetWxDecoder = function(worker, self) {
	worker.onmessage = function(msg) { // 收到胶水代码返回来的消息的处理方式
		var data = msg.data;
		var decodet1 = new Date().getTime();
		console.log(decodet1, "->worker.onmessage", data.type, data.data)
		if(typeof self.onmessage == "function") {
			self.onmessage(data); // 收到解码器的事件，如果设置了onmessage函数，透传到上层，processor通过这种方式拿到解码器事件
			//data.type
			if(data.type == 'destroy' && typeof self.onterminate == 'function') {
				self.onterminate();
				worker.terminate();
				worker = null;
			}
		}
	}

	worker.onterminate = function() {

	}

	this.onmessage = function(data) {
		console.log("player onmessage", data.type);
	};
	this.onterminate = function() {
		console.log("playe onterminate");
	};
};

Player.prototype.decode = function(buffer) { // 对外api，解码一段数据
	if(this.decoderworker) {
		this.decoderworker.postMessage({
			type: 'decode',
			buffer: buffer,
		});
	}
}

Player.prototype.destroy = function() { // 对外api，销毁解码器
	this.destroied = true;
	if(this.decoderworker) {
		// window.URL.revokeObjectURL(this.url);
		this.decoderworker.postMessage({
			type: 'destroy'
		});
	}
}

Player.prototype.startDecoding = function() {
	var req = {
		t: kStartDecodingReq,
		i: this.urgent ? 0 : this.decodeInterval,
	};
	this.decoderworker.postMessage(req);
	this.decoding = true;
	this.webrtcplayerState = playerStatePlaying;
	this.displayLoop();
};

Player.prototype.pauseDecoding = function() {
	var req = {
		t: kPauseDecodingReq
	};
	this.decoderworker.postMessage(req);
	this.decoding = false;
};
Player.prototype.onOpenDecoder = function(objData) {
	console.log("reqOpenDecoder response " + objData.e + ".");
	if(objData.e == 0) {
		this.startDecoding();
	}

}
Player.prototype.onInitDecoder = function(objData) {

	console.log("Init decoder response " + objData.e + ".");
	this.reqOpenDecoder();

};
Player.prototype.reqOpenDecoder = function() {
	var req = {
		t: kOpenDecoderReq
	};
	this.decoderworker.postMessage(req);
}
Player.prototype.onFrameData = function(data, len, type) {
	//console.log("Got data bytes=" + len);
	if(this.decoder_type === kDecoder_wx_h265_wasm_combine_js) {
		this.decode(data);
	} else {
		var objData = {
			t: kFeedDataReq,
			type: type,
			d: data
		};
		this.decoderworker.postMessage(objData, [objData.d.packet.buffer]); //见h265dc.js
	}
}
// Player.prototype.onFrameData = function (data, len) {
//     // console.log("Got data bytes=" + start + "-" + end + ".");
//     if(this.decoder_type===kDecoder_wx_h265_wasm_combine_js){
//         this.decode(data);
//     }else{
//         var objData = {
//             t: kFeedDataReq,
//             d: data
//         };
//         this.decoderworker.postMessage(objData, [objData.d.packet]); //见h265.js
//     }
// }
Player.prototype.startBuffering = function() {
	this.buffering = true;
	this.showLoading();
	this.pause();
}

Player.prototype.stopBuffering = function() {
	this.buffering = false;
	this.hideLoading();
	this.resume();
}

Player.prototype.displayVideoFrame = function(frame) {
	var audioTimestamp = 0;
	var delay = 0
	// 此处做音轨同步
	if(audioTimestamp <= 0 || delay <= 0) {
		this.renderVideoFrame(frame);
		return true;
	}
	return false;
};

Player.prototype.displayLoop = function() {
	// console.log("displayLoop")
	if(this.webrtcplayerState !== playerStateIdle) {
		requestAnimationFrame(this.displayLoop.bind(this));
	}
	if(this.frameBuffer.length > 0) {
		console.log("displayLoop ready to display: ", this.frameBuffer.length)
		var frame = this.frameBuffer[0];
		var flag = this.displayVideoFrame(frame);
		if(flag){
			this.frameBuffer.shift();
		}
	}
};
Player.prototype.stopDecoder = function() {
	var req = {
		t: kPauseDecodingReq,
	}
	this.decoderworker.postMessage(req);
	var req = {
		t: kUninitDecoderReq,
	}
	this.decoderworker.postMessage(req);
	//  this.stopBuffering();
	this.webrtcplayerState = playerStateIdle;
};
Player.prototype.renderVideoFrame = function(data) {
	//绘图数据sunhangjin
	var playFrame = {
		t: kplayeVideoFrame,
		d: data
	}
	self.postMessage(playFrame, [playFrame.d.data.buffer])

};
Player.prototype.onNetStatus = function(status) {
	var playStatus = {
		t: kplaterNetStatus,
		s: status
	}
	self.postMessage(playStatus)
}
Player.prototype.getBufferTimerLength = function() {
	if(!this.frameBuffer || this.frameBuffer.length == 0) {
		return 0;
	}

	let oldest = this.frameBuffer[0];
	let newest = this.frameBuffer[this.frameBuffer.length - 1];
	return newest.s - oldest.s;
};
Player.prototype.bufferFrame = function(frame) {
	// If not decoding, it may be frame before seeking, should be discarded.

	var len = this.frameBuffer.length;
	if(len > 0) {
		// debugger
	}

	var s = len > 0 ? this.frameBuffer[len - 1].s : 0;
	var ms = s < frame.s;
	ms = true;
	if(ms) {
		this.frameBuffer.push(frame);
	} else {
		console.log("bufferFrame pts:" + frame.s + " w:" + frame.width + ", h: " + frame.height);
	}

}
Player.prototype.onVideoFrame = function(frame) {
	this.bufferFrame(frame);
};
Player.prototype.onVideoFrame_Prod = function(frame) {
	this.bufferFrame(frame);
};
Player.prototype.onVideoFrame_Missle = function(frame) {
	this.bufferFrame(frame);
};

Player.prototype.processReq = function(req) {
	// console.log("processReq " + req.t + ".");
	switch(req.t) {
		case kstartPlayerCoderReq:
			this.startDecoder(req.decoder_type);
			break;
		case kendPlayerCoderReq:
			this.stopDecoder();
			break;
		case kInitPlayerReq:
			this.displayLoop();
			break;
		case ksendPlayerVideoFrameReq:
			this.onFrameData(req.d, req.l, "VIDEO");
			break;
		case ksendPlayerAudioFrameReq:
			this.onFrameData(req.d, req.l, "AUDIO");
			break;
		case kconnectStatusResponse:
			this.onNetStatus(req.s);
			break;
		default:
			console.log("Unsupport messsage " + req.t);
	}
};
self.player = new Player;

self.onmessage = function(evt) {
	if(!self.player) {
		console.log("[ER] Player not initialized!");
		return;
	}

	var req = evt.data;

	self.player.processReq(req);
};