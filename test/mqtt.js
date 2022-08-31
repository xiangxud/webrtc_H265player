



var t = Date.now();
 
function sleep(d){
	while(Date.now - t <= d);
}
var bisOntrack = false;
function OnTrack(pc){
    if(bisOntrack) return;
    bisOntrack=true;
    pc.ontrack = function (event) {
        console.log("ontrack", event.track.kind)
        var el = document.createElement(event.track.kind);
        el.srcObject = event.streams[0];
        el.autoplay = true;
        // document.getElementById("remote-video").appendChild(el);
        el.controls = false; // 显示
        // el.autoplay = true;
        }
}
function getStreamWebrtc(player) {


    pc = new RTCPeerConnection({
            iceServers: ICEServerkvm,//ICEServer
    });
    // initH265Transfer(pc,player);
    if(bVideo) {
        if(!bDecodeH264){
           initH265DC(pc,player);
        }else{
            const { receivervideo } = pc.addTransceiver('video', { direction: 'recvonly' });
            OnTrack(pc)
        }
    }
    if(bAudio) {
    // initAudioDC(pc);
        const { receiveraudio } = pc.addTransceiver('audio', { direction: 'recvonly' });
        OnTrack(pc)
    }
	// Populate SDP field when finished gathering
	pc.oniceconnectionstatechange = e => {
        log(pc.iceConnectionState)

                var state ={
                    t: kconnectStatusResponse,
                    s: pc.connectionState
                }
                player.postMessage(state)

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
