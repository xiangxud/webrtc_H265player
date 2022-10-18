var bReAudio=false;
var audioDC=null;

const AUDIO_START_STR="audio start";
const AUDIO_END_STR="audio end"
const AUDIO_DECODEC_TYPE_STR="decodctype";
// const PACKET_LEN_STR="Packetslen";
// const PACKET_COUNT_STR="packets";
// const AUDIO_PACKET_PTS="audiopts";
// const AUDIO_PACKET_REM_STR="rem";
var decodctype="";
var audiopts=0;
var audiodata=null;
var audiodatalen=0;
var audiopacket=0;
var audioreceivet1=new Date().getTime();
function initAudioDC(pc) {
    console.log("initAACDC",Date());
    audioDC = pc.createDataChannel("audiodc");
    
    audioDC.onmessage = function (event) {
        // console.log(bReAudio,":",event.data)
        if(bReAudio){
            if(isString(event.data)) {
                console.log("reveive: "+event.data)
                if(event.data.indexOf(AUDIO_END_STR)!=-1){
                    bReAudio=false;
                    console.log("frame ok",":",event.data," len:"+audiodatalen)
                    if(audiodatalen>0){
                        // const framepacket=new Uint8Array(audiodata) 
                        const audiot2 = new Date().getTime()-audioreceivet1;
                        console.log("receive time:"+audiot2+" len:"+audiodatalen);
                        mseCallback(audiodata);
                        //scriptNodeCallback(audiodata,len);
                        // var data={
                        //     audiopts: audiopts,
                        //     size: audiodatalen,
                        //     decodctype: decodctype,
                        //     packet: audiodata
                        // };
                        // var req = {
                        //     t: ksendPlayerAudioFrameReq,
                        //     l: audiodatalen,
                        //     d: data
                        // };
                        // player.postMessage(req,[req.d.packet]);

                        audiodata=null; 
                        audiodatalen=0;
                        audiopacket=0;    
                        audioreceivet1=new Date().getTime();
                    }
          
                    return;
                }
            }else{
                if (audiodata != null) {

                    audiodata=appendBuffer(audiodata,event.data);
                } else if (event.data.byteLength < expectLength) {
                    audiodata = event.data.slice(0);

                } else {

                    audiodata=event.data;

                }

                audiodatalen+=event.data.byteLength;
                audiopacket++;
                console.log("packet: "+audiopacket+": t len"+audiodatalen)
                return;
            }

        }
        if(isString(event.data)) {
            let startstring = event.data
            console.log("reveive: "+startstring)
            if(startstring.indexOf(AUDIO_START_STR)!=-1){
            // console.log(event.data );
            const startarray=startstring.split(",");
            //	startstr := "audio start ,decodctype:" + decodctypestr + ",Packetslen:" + strconv.Itoa(glength) + ",packets:" + strconv.Itoa(count) + ",rem:" + strconv.Itoa(rem)

            for(let i=0;i<startarray.length;i++){
                const parakv=startarray[i].split(":");
                if(parakv!==null){
                    switch(parakv[0]){
                        case AUDIO_START_STR:
                           break;
                        case PACKET_PTS:
                            audiopts=parseInt(parakv[1])
                            break;   
                        case AUDIO_DECODEC_TYPE_STR:
                            decodctype=parakv[1]
                            break;
             
                    }

                }
            }
		// string.split(":")
            bReAudio=true;
            audiopacket=0;
            return; 
            }
        }
    };

    audioDC.onopen = function () {
        console.log("audio datachannel open");
        // setAudioDecoder(1) //mse 0 contex
        // playAudio();
        // var req = {
        //     t: kInitPlayerReq,
        // };
        // player.postMessage(req);

        bWorking = true;

    };

    audioDC.onclose = function () {
        console.log("audio datachannel close");
        bWorking=false;

    };
}
