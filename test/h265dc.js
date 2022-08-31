
//webrtc datachannel send h265 jpeg

// var packetkv={
//     key
// }
// func GetFrameTypeName(frametype uint16) (string, error) {
// 	switch frametype {
// 	case NALU_H265_VPS:
// 		return "H265_FRAME_VPS", nil
// 	case NALU_H265_SPS:
// 		return "H265_FRAME_SPS", nil
// 	case NALU_H265_PPS:
// 		return "H265_FRAME_PPS", nil
// 	case NALU_H265_SEI:
// 		return "H265_FRAME_SEI", nil
// 	case NALU_H265_IFRAME:
// 		return "H265_FRAME_I", nil
// 	case NALU_H265_PFRAME:
// 		return "H265_FRAME_P", nil
// 	default:
// 		return "", errors.New("frametype unsupport")
// 	}
// }
const START_STR="h265 start";
const FRAME_TYPE_STR="FrameType";
const PACKET_LEN_STR="Packetslen";
const PACKET_COUNT_STR="packets";
const PACKET_PTS="pts";
const PACKET_REM_STR="rem";
const KEY_FRAME_TYPE="H265_FRAME_I"
var frameType="";
var isKeyFrame=false;
var pts=0;
var h265DC;
// var h265DC=new Array();
// var h265DC2;
// var h265DC3;
// var h265DC4;
var bWorking=false;
var h265dataFrame=[];
var h265data=null;
// var h265data2=null;
// var h265data3=null;
// var h265data4=null;
var dataIndex=0;

var h265datalen=0;
var packet=0;
var expectLength = 4;
var bFindFirstKeyFrame=false;
//var packetLens=0;


            //	startstr := "h265 start ,FrameType:" + frametypestr + ",Packetslen:" + strconv.Itoa(glength) + ",packets:" + strconv.Itoa(count) + ",rem:" + strconv.Itoa(rem)
// var bserialopen = false
function isString(str){
    return (typeof str=='string')&&str.constructor==String;
}
// function reportData  (len, seq, data) {
//     var objData = {
//         t: kFileData,
//         s: start,
//         e: end,
//         d: data,
//         q: seq
//     };
//     postMessage(objData, [objData.d]);
// };
function hexToStr(hex,encoding) {
    var trimedStr = hex.trim();
    var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
    var len = rawStr.length;
    if (len % 2 !== 0) {
      alert("Illegal Format ASCII Code!");
      return "";
    }
    var curCharCode;
    var resultStr = [];
    for (var i = 0; i < len; i = i + 2) {
      curCharCode = parseInt(rawStr.substr(i, 2), 16);
      resultStr.push(curCharCode);
    }
    // encoding为空时默认为utf-8
    var bytesView = new Uint8Array(resultStr);
    var str = new TextDecoder(encoding).decode(bytesView);
    return str;
  }
  function deepCopy(arr) {
    const newArr = []
    for(let i in arr) {
        console.log(arr[i])
        if (typeof arr[i] === 'object') {
            newArr[i] = deepCopy(arr[i])
        } else {
            newArr[i] = arr[i]
        }
    }
    console.log(newArr)
    return newArr
    
}
 
function dump_hex(h265data,h265datalen){
    // console.log(h265data.toString());
    var str="0x"
    for (var i = 0; i < h265datalen; i ++ ) {
        var byte =h265data.slice(i,i+1)[0];

        str+=byte.toString(16)
        str+=" "
    //   console.log((h265datalen+i).toString(16)+" ");
    }
    console.log(str);
}
function appendBuffer (buffer1, buffer2) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
};
function reportStream(size){

}

function stopH265(){
    if(h265DC!==null){
    h265DC.close();
    }
}
var receivet1=new Date().getTime();
var bRecH265=false;
function initH265DC(pc,player) {
    console.log("initH265DC",Date());
    bFindFirstKeyFrame=false;
    bRecH265=false;
    isKeyFrame=false;
    receivet1=new Date().getTime();
    h265DC = pc.createDataChannel("h265");
  
    // var ctx = canvas.getContext("2d");
    
    h265DC.onmessage = function (event) {
        // console.log(bRecH265,":",event.data)
        if(bRecH265){
            if(isString(event.data)) {
                console.log("reveive: "+event.data)
                if(event.data.indexOf("h265 end")!==-1){
                    bRecH265=false;
                    // console.log("frame ok",":",event.data," len:"+h265datalen)
                    if(h265datalen>0){
                        // const framepacket=new Uint8Array(h265data) 
                        const t2 = new Date().getTime()-receivet1;
                        /*
                        		return "H265_FRAME_VPS", nil
	case NALU_H265_SPS:
		return "H265_FRAME_SPS", nil
	case NALU_H265_PPS:
		return "H265_FRAME_PPS", nil
	case NALU_H265_SEI:
		return "H265_FRAME_SEI", nil
	case NALU_H265_IFRAME:
		return "H265_FRAME_I", nil
	case NALU_H265_PFRAME:
		return "H265_FRAME_P", nil 
                        */
                        if(frameType==="H265_FRAME_VPS"||frameType==="H265_FRAME_SPS"||frameType==="H265_FRAME_PPS"||frameType==="H265_FRAME_SEI"||frameType==="H265_FRAME_P")
                        console.log("receive time:"+t2+" len:"+h265datalen);
                        if(frameType==="H265_FRAME_P"&&!bFindFirstKeyFrame){
                            return
                        }
                        bFindFirstKeyFrame=true;
                       // h265dataFrame.push(new Uint8Array(h265data))
                        var dataFrame=new Uint8Array(h265data)//deepCopy(h265data)//h265dataFrame.shift()
                        var data={
                            pts: pts,
                            size: h265datalen,
                            iskeyframe: isKeyFrame,
                            packet: dataFrame//
                            // new Uint8Array(h265data)//h265data//new Uint8Array(h265data)
                        };
                        var req = {
                            t: ksendPlayerVideoFrameReq,
                            l: h265datalen,
                            d: data
                        };
                        player.postMessage(req,[req.d.packet.buffer]);

                        h265data=null; 
                        h265datalen=0;
                        packet=0;    
                        receivet1=new Date().getTime();
                    }
          
                    return;
                }
            }else{
                if (h265data !== null) {

                    h265data=appendBuffer(h265data,event.data);
                } else if (event.data.byteLength < expectLength) {
                    h265data = event.data.slice(0);

                } else {

                    h265data=event.data;

                }

                h265datalen+=event.data.byteLength;
                packet++;
                console.log("packet: "+packet+": t len"+h265datalen)
                return;
            }

        }
        if(isString(event.data)) {
            let startstring = event.data
            // console.log("reveive: "+startstring)
            if(startstring.indexOf("h265 start")!==-1){
            console.log(event.data );
            const startarray=startstring.split(",");
            //	startstr := "h265 start ,FrameType:" + frametypestr + ",Packetslen:" + strconv.Itoa(glength) + ",packets:" + strconv.Itoa(count) + ",rem:" + strconv.Itoa(rem)

            for(let i=0;i<startarray.length;i++){
                const parakv=startarray[i].split(":");
                if(parakv!==null){
                    switch(parakv[0]){
                        case START_STR:
                           break;
                        case PACKET_PTS:
                            pts=parseInt(parakv[1])
                            break;   
                        case FRAME_TYPE_STR:
                            frameType=parakv[1]
                            if(frameType.indexOf(KEY_FRAME_TYPE)!==-1){
                                isKeyFrame=true;
                            }else{
                                isKeyFrame=false;
                            }
                            break;
                        case PACKET_LEN_STR:
                            break;
                        case PACKET_COUNT_STR:
                            break;
                        case PACKET_REM_STR:
                            break;                
                    }

                }
            }
		// string.split(":")
            bRecH265=true;
            packet=0;
            return; 
            }
        }
    };

    h265DC.onopen = function () {
        console.log("h265 datachannel open");

        // var req = {
        //     t: kInitPlayerReq,
        // };
        // player.postMessage(req);

        bWorking = true;

    };

    h265DC.onclose = function () {
        console.log("h265 datachannel close");
        bWorking=false;
       
    };
}

function handleUpdates(canvas, dc) {
    setInterval(function () {
        if (bWorking){
        dc.send(JSON.stringify({ type: "h265" })); // frame update request
        }
    }, 500);
};



