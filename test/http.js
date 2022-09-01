// https://qxbjz-20210528.blog.csdn.net/article/details/101430551
// 常用工具函数
var tools = {


	/* ajax请求get
     * @param url     string   请求的路径
     * @param query   object   请求的参数query
     * @param succCb  function 请求成功之后的回调
     * @param failCb  function 请求失败的回调
     * @param isJson  boolean  true： 解析json  false：文本请求  默认值true
     */
    ajaxGet: function (url, query, succCb, failCb, isJson) {
        // 拼接url加query
        if (query) {
            var parms = tools.formatParams(query);
            url += '?' + parms;
            // console.log('-------------',url);
        }

        // 1、创建对象
        var ajax = new XMLHttpRequest();
        // 2、建立连接
        // true:请求为异步  false:同步
        ajax.open("GET", url, true);
        // ajax.setRequestHeader("Origin",STATIC_PATH); 

        // ajax.setRequestHeader("Access-Control-Allow-Origin","*");   
        // // 响应类型    
        // ajax.setRequestHeader('Access-Control-Allow-Methods', '*');    
        // // 响应头设置    
        // ajax.setRequestHeader('Access-Control-Allow-Headers', 'x-requested-with,content-type');  
        // ajax.withCredentials = true;
        // 3、发送请求
        ajax.send(null);

        // 4、监听状态的改变
        ajax.onreadystatechange = function () {
            if (ajax.readyState === 4) {
                if (ajax.status === 200) {
                    // 用户传了回调才执行
                    // isJson默认值为true，要解析json
                    if (isJson === undefined) {
                        isJson = true;
                    }
                    var res = isJson ? JSON.parse(ajax.responseText == "" ? '{}' : ajax.responseText) : ajax.responseText;
                    succCb && succCb(res);
                } else {
                    // 请求失败
                    failCb && failCb();
                }

            }
        }


    },
    
    
    	/* ajax请求post
     * @param url     string   请求的路径
     * @param data   object   请求的参数query  
     * @param succCb  function 请求成功之后的回调
     * @param failCb  function 请求失败的回调
     * @param isJson  boolean  true： 解析json  false：文本请求  默认值true
     */
    ajaxPost: function (url, data, succCb, failCb, isJson) {
    
        var formData = new FormData();
        for (var i in data) {
            formData.append(i, data[i]);
        }
        //得到xhr对象
        var xhr = null;
        if (XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");

        }

        xhr.open("post", url, true);
		// 设置请求头  需在open后send前
		// 这里的CSRF需自己取后端获取，下面给出获取代码
        // xhr.setRequestHeader("X-CSRFToken", CSRF);
        xhr.setRequestHeader('Content-Type','application/json');
        xhr.send(formData);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // 判断isJson是否传进来了
                    isJson = isJson === undefined ? true : isJson;
                    succCb && succCb(isJson ? JSON.parse(xhr.responseText) : xhr.responseText);
                }else{
                    isJson = isJson === undefined ? true : isJson;
                    failCb && failCb(isJson ? JSON.parse(xhr.responseText) : xhr.responseText);
                }
            }
        }

    },

	 formatParams: function (data) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        arr.push(("v=" + Math.random()).replace(".", ""));
        return arr.join("&");
    }

}



// // 调用
// // 接口地址
// let url = ""
// // 传输数据 为object
// let data = {}

// tools.ajaxGet(url, data, function(res){
// 	console.log('返回的数据:',res)
// 	// ....
// })

var Ajax = {
    get: function(url,callback){
        // XMLHttpRequest对象用于在后台与服务器交换数据
        var xhr=new XMLHttpRequest();
        xhr.open('GET',url,false);
        xhr.onreadystatechange=function(){
            // readyState == 4说明请求已完成
            if(xhr.readyState==4){
                if(xhr.status==200 || xhr.status==304){
                    console.log(xhr.responseText);
                    callback(xhr.responseText);
                }
            }
        }
        xhr.send();
    },

    // data应为'a=a1&b=b1'这种字符串格式，在jq里如果data为对象会自动将对象转成这种字符串格式
    post: function(url,data,callback){
        var xhr=new XMLHttpRequest();
        xhr.open('POST',url,false);
        // 添加http头，发送信息至服务器时内容编码类型
        //xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded'); ////text/plain application/json
        xhr.setRequestHeader('Content-Type','application/json');
        xhr.onreadystatechange=function(){
            if (xhr.readyState==4){
                if (xhr.status==200 || xhr.status==304){
                    // console.log(xhr.responseText);
                    callback(xhr.responseText);
                }
            }
        }
        xhr.send(data);
    }
    
}
const getJSON = function(url) {
    const promise = new Promise(function(resolve, reject){
        const handler = function() {
            if (this.readyState !== 4) {
                return;
            }
            if (this.status === 200) {
                resolve(this.response);
            } else {
                reject(new Error(this.statusText));
            }
        };
        const client = new XMLHttpRequest();
        client.open("GET", url);
        client.onreadystatechange = handler;
        client.responseType = "json";
        client.setRequestHeader("Accept", "application/json");
        client.send();

    });
    return promise;
};
getJSON("promise.json").then(function(json) {
    console.log('Data: ', json);
}, function(error) {
    console.error('err', error);
});
function initXMLhttp(){
    var e;
    return e=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP")
}

function minAjax(e){
    if(!e.url)return 
    void(1==e.debugLog&&console.log("No Url!"));
    if(!e.type)return 
    void(1==e.debugLog&&console.log("No Default type (GET/POST) given!"));
    e.method||(e.method=!0),e.debugLog||(e.debugLog=!1);
    var o=initXMLhttp();
    o.onreadystatechange=function(){
        4==o.readyState&&200==o.status?(e.success&&e.success(o.responseText,o.readyState),1==e.debugLog&&console.log("SuccessResponse"),1==e.debugLog&&console.log("Response Data:"+o.responseText)):1==e.debugLog&&console.log("FailureResponse --> State:"+o.readyState+"Status:"+o.status)
    };
    var t=[],n=e.data;
    if("string"==typeof n)for(var s=String.prototype.split.call(n,"&"),r=0,a=s.length;a>r;r++){var c=s[r].split("=");t.push(encodeURIComponent(c[0])+"="+encodeURIComponent(c[1]))}else if("object"==typeof n&&!(n instanceof String||FormData&&n instanceof FormData))for(var p in n){var c=n[p];if("[object Array]"==Object.prototype.toString.call(c))for(var r=0,a=c.length;a>r;r++)t.push(encodeURIComponent(p)+"[]="+encodeURIComponent(c[r]));else t.push(encodeURIComponent(p)+"="+encodeURIComponent(c))}t=t.join("&"),"GET"==e.type&&(o.open("GET",e.url+"?"+t,e.method),o.send(),1==e.debugLog&&console.log("GET fired at:"+e.url+"?"+t)),"POST"==e.type&&(o.open("POST",e.url,e.method),o.setRequestHeader("Content-type","application/x-www-form-urlencoded"),o.send(t),1==e.debugLog&&console.log("POST fired at:"+e.url+" || Data:"+t))}