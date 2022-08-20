
var webglPlayer, canvas, videoWidth, videoHeight, yLength, uvLength;
var player=null;

function handleVideo() {
    player = new Worker("Player.js");
    // H265transferworker = new Worker ("")

    startDeviceSession(player);
    player.onmessage = function (evt){
        var objData = evt.data;
        switch (objData.t) {
        case kplayeVideoFrame:
            webgldisplayVideoFrame(objData.d);
            break;
        default:
            break;
        }    
    }
    var req = {
        t: kstartPlayerCoderReq,
    };
    player.postMessage(req);

}
function stopDecoder(){
    var req = {
        t: kendPlayerCoderReq,
    };
    player.postMessage(req);
}
function stopVideo(){
    stopDecoder();
    endWebrtc();
    endMqtt();
}

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