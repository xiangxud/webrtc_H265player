
//webrtc datachannel send h265 jpeg
var h265DC;
var bWorking=false;
var h265data=null;
var h265datalen=0;
var packet=0;
var expectLength = 4;
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
function initH265DC(pc,player) {

    h265DC = pc.createDataChannel("h265");
    let bRecH265=false;
    // var ctx = canvas.getContext("2d");
    
    h265DC.onmessage = function (event) {

        if(bRecH265){
            if(isString(event.data)) {
                if(event.data.indexOf("h265 end")!=-1){
                    bRecH265=false;
               
                    if(h265datalen>0){

                        const t2 = new Date().getTime()-receivet1;
                        console.log("receive time:"+t2+" len:"+h265datalen);
                        var req = {
                            t: ksendPlayerVideoFrameReq,
                            l: h265datalen,
                            d: h265data
                        };
                        player.postMessage(req,[req.d]);

                        h265data=null; 
                        h265datalen=0;
                        packet=0;    
                        receivet1=new Date().getTime();
                    }
          
                    return;
                }
            }else{
                if (h265data != null) {

                    h265data=appendBuffer(h265data,event.data);
                } else if (event.data.byteLength < expectLength) {
                    h265data = event.data.slice(0);

                } else {

                    h265data=event.data;

                }

                h265datalen+=event.data.byteLength;
                packet++;
                // console.log("reveive: "+packet+": t len"+h265datalen)
                return;
            }

        }
        if(isString(event.data)) {
            if(event.data.indexOf("h265 start")!=-1){
            // console.log(event.data );
            bRecH265=true;
            packet=0;
            return; 
            }
        }
    };

    h265DC.onopen = function () {
        console.log("h265 datachannel open");

        var req = {
            t: kInitPlayerReq,
        };
        player.postMessage(req);

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

