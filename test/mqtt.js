



var t = Date.now();
 
function sleep(d){
	while(Date.now - t <= d);
}
// function CreateVideoDiv(el){
// var parentDiv = document.createElement("div");//创建父div
// // var parentDiv = document.getElementById('playCanvas')
// parentDiv.className="webrtcPlayer";//给父div设置class属性
// el.className="video";
// el.setAttribute("id","remote-video");
// parentDiv.appendChild(el);
// window.document.body.appendChild(parentDiv);
// }
var bisOntrack = false;
function OnTrack(pc){
    if(bisOntrack) return;
    bisOntrack=true;
    pc.ontrack = function (event) {
        console.log("ontrack", event.track.kind)
        var el = document.createElement(event.track.kind);
        // document.body.appendChild(el);

//属性width height autoplay id type src，也可以通过userVideo.setAttribute('type','video/mp4');来设置
        if(event.track.kind==="video"){
            CreateVideoDiv(el);
            // window.document.body.appendChild(el);
        }else if(event.track.kind==="audio"){
            window.document.body.appendChild(el);
        }
        el.srcObject = event.streams[0];
        el.autoplay = true;
        // document.getElementById("remote-video").appendChild(el);
        el.controls = false; // 显示
        // el.autoplay = true;
        }
}
// function OnTrack(pc){
//     if(bisOntrack) return;
//     bisOntrack=true;
//     pc.ontrack = function (event) {
//         console.log("ontrack", event.track.kind)
//         if(event.track.kind==="video"){
//         trackCache = event.track;
    
//         var el = document.getElementById('playCanvas')
//         resStream = event.streams[0].clone()
//         resStream.addTrack(trackCache)
//         el.srcObject = resStream
//         // KeyMouseCtrl()
        
//         }else{
//         var el = document.createElement(event.track.kind);
//         el.srcObject = event.streams[0];
//         el.autoplay = true;
//         document.getElementById("playCanvas").appendChild(el);
        
//           if (el.nodeName === "AUDIO") {
//             el.oncanplay = () => {
//                 el.controls = false; // 显示
//                 el.autoplay = true;
//             };
//         }
//     }   
//   }
// }

function getStreamWebrtc(player) {


    pc = new RTCPeerConnection({
            iceServers: ICEServerkvm,//ICEServer
    });
    // initH265Transfer(pc,player);
    if(bAudio) {
    // initAudioDC(pc);
        pc.addTransceiver('audio', { direction: 'recvonly' });
        OnTrack(pc)
    }
    if(bVideo) {
        if(!bDecodeH264){
            media_mode= "h265";
           initH265DC(pc,player);
        }else{
            media_mode= "h264";
            pc.addTransceiver('video', { direction: 'recvonly' });
            // receivervideo.playoutDelayHint = 0;
            OnTrack(pc)
        }
    }
	// Populate SDP field when finished gathering
	pc.oniceconnectionstatechange = e => {
        log(pc.iceConnectionState)
        if(!bDecodeH264){
                var state ={
                    t: kconnectStatusResponse,
                    s: pc.connectionState
                }
                player.postMessage(state)
        }

    }

    pc.onicecandidate = event => {
            if (event.candidate === null) {
                //pc.setLocalDescription(offer)
                var msgdata = new Object();
                //var localSessionDescription =btoa(JSON.stringify(pc.localDescription));

                msgdata["seqid"] = WEB_SEQID;
                if (bVideo) {
                    msgdata["video"] = true;
                    msgdata["mode"] = media_mode;
                    if (media_mode == "rtsp") {
                        let rtsp = document.getElementById("rtspId");
                        let rtspaddr = rtsp.value;
                        if (rtspaddr == "") {
                            rtspaddr = KVMRTSPADDR;
                            rtsp.value = KVMRTSPADDR;
                        }
                        msgdata["rtspaddr"] = rtspaddr;//document.getElementById("rtspId").value //KVMRTSPADDR;
                    }
                    msgdata["resolution"]=p_Resolution;//document.getElementById("resolutionId").value;
                    
                }
                if (bAudio) {
                    msgdata["audio"] = true;
                    msgdata["mode"] = media_mode;
                }

                msgdata["serial"] = false;//true;
                msgdata["ssh"] = false;//true;
                msgdata["iceserver"] = ICEServerkvm;
                msgdata["offer"] = pc.localDescription;//localSessionDescription;
                msgdata["suuid"] = kvmstream;


                var content = new Object();

                content["type"] = CMDMSG_OFFER;
                content["msg"] = "webrtc offer";
                content["device_id"] = document.getElementById("deviceId").value;
                content["data"] = btoa(JSON.stringify(msgdata));
                mqttclient.publish(pubtopic, JSON.stringify(content));

                console.log("localDescription:", btoa(JSON.stringify(pc.localDescription)));
            }
        }
	
	pc.createOffer().then(d => pc.setLocalDescription(d)).catch(log)   

};
initMqtt = function(player) {
    if(bmqttStarted){
        console.log("mqtt is connect");
        return;
    }
    var ClientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)
  
    mqttclient = mqtt.connect(MqttServer,
        {
            clientId: ClientId,
   
            username: 'admin',
            password: 'password',
            // port: 8084
        });
    mqttclient.on('connect', function () {
        mqttclient.subscribe(subtopic, function (err) {
            if (!err) {
                //成功连接到服务器
                console.log("connected to server");
                bmqttStarted=true;

                getStreamWebrtc(player);
 
            }
        })
    })
    mqttclient.on('message', function (topic, message,) {
        // message is Buffer
        console.log("topic:",topic)
        console.log("message:",message)

        let input = JSON.parse(message)
        console.log("input:",input)
        switch (input.type) {
            case 'offer': 
              getRemoteOffer(input);
              break;
            case "error":
                console.log("msg:",input.msg);
                // stopSession();
                break;
            case "answer":
                var remoteSessionDescription = input.data;
                if (remoteSessionDescription === '') {
                    alert('Session Description must not be empty');
                }
                try {
                    let answerjsonstr=atob(remoteSessionDescription);
                    console.log("atob1:",answerjsonstr);

                    let answer = JSON.parse(answerjsonstr);
                    console.log("answer:",answer);
                    for (const receiver of pc.getReceivers()) {
                        receiver.playoutDelayHint = 0;
                      }
                    pc.setRemoteDescription(new RTCSessionDescription(answer));
                    // btnOpen();
                } catch (e) {
                    alert(e);
                }
                break;

            case "heart":
                console.log(JSON.parse(atob(input.data)));
                break;
            case "cmdFeedback":
                console.log(JSON.parse(atob(input.data)));
                break;

        }
    })
}

function endMqtt() {
    if(!bmqttStarted) return;
    mqttclient.end()
    bmqttStarted=false;
}
function endWebrtc(){
    stopH265();
    // endH265Transfer();
    pc.close();
}
function sendCmdMsg(topic,cmdmsgtype,deviceid,msg,cmdmsg){

    var content = new Object();
    content["type"] = cmdmsgtype;//CMDMSG_OFFER;
    content["msg"] = msg;//"webrtc offer";
    content["device_id"] =deviceid;//document.getElementById("serverId").value //$("#dropdown_menu_link").attr("value");
    content["data"] = btoa(JSON.stringify(cmdmsg));
    mqttclient.publish(topic, JSON.stringify(content));
    console.log("mqttpublish:",topic, cmdmsg);
 
}
