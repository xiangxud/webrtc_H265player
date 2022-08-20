
function importScripts(scriptUrl){
  var script= document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", scriptUrl);
  document.body.appendChild(script);
}
importScripts("./parameter.js")
importScripts("./common.js")
importScripts("./mqtt.js")
// importScripts("./webrtc.js")
importScripts("./datachannel.js")
importScripts("./h265.js")
importScripts("https://cdn.bootcdn.net/ajax/libs/mqtt/2.18.8/mqtt.min.js")
// importScripts("./adapter-latest.js")
{/* <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script> */}
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
