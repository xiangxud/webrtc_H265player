   // Internal APIs.
   var  __internal = {
    defaultPath: '/rtc/v1/play/',
    // defaultPath: '/api/webrtc/playpro',
    prepareUrl: function (webrtcUrl) {
        var urlObject = self.__internal.parse(webrtcUrl);
        var schema="http:";
        var port = urlObject.port || 1985;
        if (schema === 'https:') {
            port = urlObject.port || 443;
        }

        // @see https://github.com/rtcdn/rtcdn-draft
        var api = urlObject.user_query.play || self.__internal.defaultPath;
        if (api.lastIndexOf('/') !== api.length - 1) {
            api += '/';
        }

        apiUrl = schema + '//' + urlObject.server + ':' + port + api;
        for (var key in urlObject.user_query) {
            if (key !== 'api' && key !== 'play') {
                apiUrl += '&' + key + '=' + urlObject.user_query[key];
            }
        }
        // Replace /rtc/v1/play/&k=v to /rtc/v1/play/?k=v
        var apiUrl = apiUrl.replace(api + '&', api + '?');

        var streamUrl = urlObject.url;

        return {
            apiUrl: apiUrl, streamUrl: streamUrl, schema: schema, urlObject: urlObject, port: port,
            tid: Number(parseInt(new Date().getTime()*Math.random()*100)).toString(16).substr(0, 7)
        };
    },
    parse: function (url) {
        // @see: http://stackoverflow.com/questions/10469575/how-to-use-location-object-to-parse-url-without-redirecting-the-page-in-javascri
        var a = document.createElement("a");
        a.href = url.replace("rtmp://", "http://")
            .replace("webrtc://", "http://")
            .replace("rtc://", "http://");

        var vhost = a.hostname;
        var app = a.pathname.substr(1, a.pathname.lastIndexOf("/") - 1);
        var stream = a.pathname.substr(a.pathname.lastIndexOf("/") + 1);

        // parse the vhost in the params of app, that srs supports.
        app = app.replace("...vhost...", "?vhost=");
        if (app.indexOf("?") >= 0) {
            var params = app.substr(app.indexOf("?"));
            app = app.substr(0, app.indexOf("?"));

            if (params.indexOf("vhost=") > 0) {
                vhost = params.substr(params.indexOf("vhost=") + "vhost=".length);
                if (vhost.indexOf("&") > 0) {
                    vhost = vhost.substr(0, vhost.indexOf("&"));
                }
            }
        }

        // when vhost equals to server, and server is ip,
        // the vhost is __defaultVhost__
        if (a.hostname === vhost) {
            var re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
            if (re.test(a.hostname)) {
                vhost = "__defaultVhost__";
            }
        }

        // parse the schema
        var schema = "rtmp";
        if (url.indexOf("://") > 0) {
            schema = url.substr(0, url.indexOf("://"));
        }

        var port = a.port;
        if (!port) {
            if (schema === 'http') {
                port = 80;
            } else if (schema === 'https') {
                port = 443;
            } else if (schema === 'rtmp') {
                port = 1935;
            }
        }

        var ret = {
            url: url,
            schema: schema,
            server: a.hostname, port: port,
            vhost: vhost, app: app, stream: stream
        };
        self.__internal.fill_query(a.search, ret);

        // For webrtc API, we use 443 if page is https, or schema specified it.
        if (!ret.port) {
            if (schema === 'webrtc' || schema === 'rtc') {
                if (ret.user_query.schema === 'https') {
                    ret.port = 443;
                } else if (window.location.href.indexOf('https://') === 0) {
                    ret.port = 443;
                } else {
                    // For WebRTC, SRS use 1985 as default API port.
                    ret.port = 1985;
                }
            }
        }

        return ret;
    },
    fill_query: function (query_string, obj) {
        // pure user query object.
        obj.user_query = {};

        if (query_string.length === 0) {
            return;
        }

        // split again for angularjs.
        if (query_string.indexOf("?") >= 0) {
            query_string = query_string.split("?")[1];
        }

        var queries = query_string.split("&");
        for (var i = 0; i < queries.length; i++) {
            var elem = queries[i];

            var query = elem.split("=");
            obj[query[0]] = query[1];
            obj.user_query[query[0]] = query[1];
        }

        // alias domain for vhost.
        if (obj.domain) {
            obj.vhost = obj.domain;
        }
    }
};

var datachannel=null;
function StartMetaRTC(url,player){
	//debugger
    var conf = __internal.prepareUrl(url);

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
                 url:"http://192.168.0.71/index/api/webrtc?app=live&stream=test&type=play", 
             //   url:conf.streamUrl,
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

