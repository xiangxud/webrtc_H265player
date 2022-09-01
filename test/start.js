
function importScripts(scriptUrl){
  var script= document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", scriptUrl);
  document.body.appendChild(script);
}

importScripts("./common.js")
importScripts("./parameter.js")
importScripts("./mqtt.js")
importScripts("./video.js")
importScripts("./audio.js")
importScripts("./webgl.js")
importScripts("./datachannel.js")
importScripts("./audiodc.js")
importScripts("./h265dc.js")
importScripts("https://cdn.bootcdn.net/ajax/libs/mqtt/2.18.8/mqtt.min.js")
importScripts("adapter-7.4.0.min.js")
importScripts("srs.sdk.p2p.js")
importScripts("http.js")
importScripts("metaRTC.js")
// importScripts("miniAjax.js")
// importScripts("jquery-1.10.2.min.js")

// importScripts("./adapter-latest.js")

function log(msg) {
  console.log(msg);
    // $("#loger").html(msg);
}

function endSession(){
  endMqtt();
  endWebrtc();
}
function stopSession() {
  endMqtt();
  endWebrtc();
}

function startDeviceSession(player){
  bUseWebrtcP2P=true;
  bDevicePull=false;
  WEB_SEQID=uuid();
  media_mode = "h265";
  DEVICE_NAME=document.getElementById("deviceId").value;
  subtopic = "kvmdev/" +DEVICE_NAME+ "/" + WEB_SEQID + "/#";//+"/"+deviceID //Control/00:13:14:01:D9:D5
  pubtopic = "Control" + "/" + DEVICE_NAME;
  initMqtt(player);
}
