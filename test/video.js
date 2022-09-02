
var webglPlayer, canvas, videoWidth, videoHeight, yLength, uvLength;
var player=null;
var sdk = null; // Global handler to do cleanup when replaying.
// var DECODER_TYPE = kDecoder_decodeer_js;
// var DECODER_TYPE = kDecoder_prod_h265_wasm_combine_js;
function startPlay(url) {
       
   if(url===undefined||url.value===""){
    alert("url is null")
     return;
   } 
   StartMetaRTC(url)

};
function onSelectDecode(){
    var decodetype=document.getElementById("decodeType");
    if(decodetype.value==="H264"){
        bDecodeH264=true;
    }else{
        bDecodeH264=false;
    }
}
function onSelectResolution() {
    // switch resolution {
    //     case "1080":
    //         resolut = 1
    //     case "720":
    //         resolut = 2
    //     case "540":
    //         resolut = 3
    //     case "360":
    //         resolut = 4
    //     default:
    //         resolut = 2
    //     }
    var resolution=document.getElementById("resolutionId");    
    p_Resolution=resolution.value;
}
function onSelectProto(){
    var porotocol=document.getElementById("protocol");
    var url=document.getElementById("inputUrl");
    switch(porotocol.value){
        case "webrtc":
        url.value="webrtc://192.168.0.4:1988/live/livestream"
        // startPlay(url);
        break;
        case "mqtt":
            url.value="ws://192.168.0.18:8083/mqtt"
            break;
        default:
            return;    
    }
}
function handleVideo() {
    var porotocol=document.getElementById("protocol");
    var url=document.getElementById("inputUrl");
    if(url.value===""){
        alert("Please input your url addr");
        return;
    }
    switch(porotocol.value){
        case "webrtc":
        
           startPlay(url.value);
           return;
        case "mqtt":
            MqttServer=url.value;
            break;
        default:
            return;    
    }
    if(!bDecodeH264){
       player = new Worker("Player.js");
    }  
    // H265transferworker = new Worker ("")
    var el = document.getElementById("btnPlayVideo");
    // var currentState = self.player.getState();
    // if (currentState == playerStatePlaying) {
        // el.src = "img/play.png";
    // } else {
    // el.src = "img/pause.png";
    // }
    // if(bAudio){
    //     setAudioDecoder(1) //mse 0 contex
    //     playAudio();
    // }
    startDeviceSession(player);
    if(!bDecodeH264){
        player.onmessage = function (evt){
            var objData = evt.data;
            switch (objData.t) {
            case kplayeVideoFrame:
                if(DECODER_TYPE===kDecoder_missile_decoder_js){
                    missle_renderFrame(objData.d)
                }else{
                webgldisplayVideoFrame(objData.d);
                }
                break;
            case kplaterNetStatus:
                netstatus(objData.s)
                break;    
            default:
                break;
            }    
        }
        var req = {
            t: kstartPlayerCoderReq,
            decoder_type: DECODER_TYPE
        };
        player.postMessage(req);
    }
    el.src = "img/pause.png";

}
function netstatus(status){
   if(status==="disconnected"){
    stopVideo();
   }
}
function stopDecoder(){
    if(bDecodeH264) return;
    var req = {
        t: kendPlayerCoderReq,
    };
    player.postMessage(req);
}
function stopVideo(){

    stopDecoder();
    endWebrtc();
    endMqtt();
    var el = document.getElementById("btnPlayVideo");
    // var currentState = self.player.getState();
    // if (currentState == playerStatePlaying) {
    el.src = "img/play.png";
    // } else {
    // el.src = "img/pause.png";
}

function fullscreen(){
    if(bDecodeH264){
        FullScreen();
         return;
    }
    if(!webglPlayer) {
        const canvasId = "playCanvas";
        canvas = document.getElementById(canvasId);
        webglPlayer = new WebGLPlayer(canvas, {
            preserveDrawingBuffer: false
        });
    }
    webglPlayer.fullscreen();
}
//用missle解码器
// var USE_MISSILE = false;
var webt1=new Date().getTime();

function webgldisplayVideoFrame(obj) {
    var data = new Uint8Array(obj.data);
    var width = obj.width;
    var height = obj.height;
    var yLength = width * height;
    var uvLength = (width / 2) * (height / 2);
    if(!webglPlayer) {
        const canvasId = "playCanvas";
        canvas = document.getElementById(canvasId);
        webglPlayer = new WebGLPlayer(canvas, {
            preserveDrawingBuffer: false
        });
    }

    const t2=new Date().getTime()-webt1;
    console.log("display time:"+t2+" width:"+width+" height"+height+" yLength"+yLength+" uvLength"+uvLength);
    webglPlayer.renderFrame(data, width, height, yLength, uvLength);
    webt1 = new Date().getTime()
}
function missle_renderFrame(obj){
/*
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
*/                
    let videoFrameY = obj.data.y;
    let videoFrameB = obj.data.u;
    let videoFrameR = obj.data.v;
    let width = obj.data.width;
    let height = obj.data.height;
    if(!webglPlayer) {
        const canvasId = "playCanvas";
        canvas = document.getElementById(canvasId);
        webglPlayer = new WebGLPlayer(canvas, {
            preserveDrawingBuffer: false
        });
    }

    const t2=new Date().getTime()-webt1;
    console.log("display time:"+t2+" width:"+width+" height"+height);
    webglPlayer.renderFrameyuv(videoFrameY,videoFrameB, videoFrameR,width, height);
    webt1 = new Date().getTime()

    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // gl.clearColor(0.0, 0.0, 0.0, 0.0);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.y.fill(width, height, videoFrameY);
    // gl.u.fill(width >> 1, height >> 1, videoFrameB);
    // gl.v.fill(width >> 1, height >> 1, videoFrameR);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}