var pc;
var mqttclient;
var WEB_SEQID;
var suuid;
var local;
var localStream;
var MqttServer="ws://192.168.0.18:8083/mqtt";
var SERVER_NAME=""//
var DEVICE_NAME="";
var kvs=true;
if(SERVER_NAME===""){
    SERVER_NAME="";
}
let startTime;
var receiverStreams;
var transceiver ;
var kvmstream = "KVMStream1";
var h265DC=null;

function suuid() {
     
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
     
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "-";
	
	var uuid1 = s.join("");
	return uuid1;
}
function uuid() {
    var temp_url = URL.createObjectURL(new Blob());
    var uuid = temp_url.toString(); // blob:https://xxx.com/b250d159-e1b6-4a87-9002-885d90033be3
    URL.revokeObjectURL(temp_url);
    return uuid.substr(uuid.lastIndexOf("/") + 1);
}
 WEB_SEQID=uuid();
 suuid=suuid();
var subtopic = "server_cmd/" +SERVER_NAME+ "/"+ WEB_SEQID + "/#";//+"/"+deviceID //Control/00:13:14:01:D9:D5
var pubtopic = "server_control" + "/" + SERVER_NAME;
let bVideo=true;
let bAudio=true;
let bDecodeH264 = false; //H264直接用webrtc
var bmqttStarted=false; 
var bWebrtc = false;
var bUseWebrtcP2P =true;//启动webrtc p2p 模式
var bSendCmdMsg = false;
var bUseMesg=false; //发送cmd msg 
var bDevicePull=false; //设备推流 true 客户端拉流false
var cmd_topic;
var cmd_msgtype;
var cmd_deviceid;
var cmd_msg;
var cmd_cmdmsg;
var controlDC;
var bcontrolopen = false;
const CMDMSG_OFFER = "offer"
const CMDMSG_ANSWER = "answer"
var STREAMNAME=document.getElementById("streamId").value;
if(STREAMNAME===""){
    STREAMNAME="kvs";
}
let media_mode = "h265"//"rtmp";

var ICEServer =[
    {
        urls: ["stun:192.168.0.18:3478"]
        // url: "stun:39.98.198.244:3478"
        //url:"stun:stun.l.google.com:19302"

    }, {
        urls: ["turn:192.168.0.18:3478"],
        // url: "turn:39.98.198.244:3478",
        username: "media",
        credential: "123456"
    }
];
var ICEServerkvm = [
    {
        //urls:["stun:stun.l.google.com:19302"]
        urls: ["stun:192.168.0.18:3478"]
        //urls: ["stun:192.168.0.20:3478"]
    }, {
        urls: ["turn:192.168.0.18:3478"],
        //urls: ["turn:192.168.0.20:3478"],
        username: "media",
        credential: "123456"
    }
];
var ICEServermetaRTC = [
    {
        //urls:["stun:stun.l.google.com:19302"]
        urls: ["stun:192.168.0.18:3478"]
        //urls: ["stun:192.168.0.20:3478"]
    }, {
        urls: ["turn:192.168.0.18:3478"],
        //urls: ["turn:192.168.0.20:3478"],
        username: "media",
        credential: "123456"
    }
];
