  
function StartMetaRTC(url,player){
	//debugger
    var conf = {};
    conf.streamUrl = url;

    pc = new RTCPeerConnection(null);

    // if(bAudio) {

    //     const { receiveraudio } = pc.addTransceiver('audio', { direction: 'recvonly' });
    //     OnTrack(pc)
    // }
    if(bVideo) {
        initH265DC(pc,player);
        if(!bDecodeH264){
            media_mode= "h265";
            // H265transferworker = new Worker ("")
        }else{
            media_mode= "h264";            
        }
        const { receivervideo } = pc.addTransceiver('audio', { direction: 'recvonly' });
        // OnTrack(pc)

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
        if (event.candidate === null) {}
    }
    
    	pc.createOffer().then((offer) => {
			console.log(offer.sdp);
			// 设置本地描述
			pc.setLocalDescription(offer).then(() => {
			
            var data = {
                api: conf.apiUrl, 
                tid: conf.tid, 
                streamurl: conf.streamUrl,
                clientip: null, 
                sdp: offer.sdp,
                // type: "answer"
                type: "offer"
            };
            console.log("offer: ", offer.sdp);
           // console.log("Generated conf: ", conf);

            ajax({ 
                type:"POST", 
                 // url:"http://192.168.0.71/index/api/webrtc?app=live&stream=test&type=play", 
               url:conf.streamUrl,
                dataType:"json", 
                data:offer.sdp, 
               //  data:JSON.stringify(data), 
                beforeSend:function(){ 
                  //some js code 
                }, 
                success:function(msg){ 
                	//debugger;
                	 msg.isH265 = true;
                  if(!msg.isH265){
                     media_mode= "h264";
                     bDecodeH264 = true
                     stopH265()
                     OnTrack(pc)
                  }else{
                    CreateCanvas()
                  }
                  console.log("answer" + msg.sdp) 
                  pc.setRemoteDescription(new RTCSessionDescription({type: 'answer', sdp: msg.sdp}));
                }, 
                error:function(){ 
                  console.log("error") 
                } 
              }) 

        
				
				
				
			});
		})


    
    
   


}

