

function CreateVideoDiv(el){
    var parentDiv = document.createElement("div");//创建父div
    // var parentDiv = document.getElementById('playCanvas')
    parentDiv.className="webrtcPlayer";//给父div设置class属性
    // parentDiv.offsetTop=parentDiv.offsetTop+50;
    el.className="video";
    // el.offsetTop=parentDiv.offsetTop+50;
    el.setAttribute("id","remote-video");
    parentDiv.appendChild(el);
    body = document.getElementsByClassName("canvasDiv")[0]
    // window.document.body.appendChild(parentDiv);
    body.appendChild(parentDiv);
}
function CreateCanvas(){
    var parentDiv = document.createElement("canvas");//创建父div
    parentDiv.setAttribute("width",1920)
    parentDiv.setAttribute("height",1080)
    parentDiv.id = "playCanvas"
    body = document.getElementsByClassName("canvasDiv")[0]
    body.appendChild(parentDiv);
}

function FullScreen() {

        var ele = document.getElementById("remote-video");

        if (ele.requestFullscreen) {

            ele.requestFullscreen();
            ele.controls = false;
            ele.controlsList = "nodownload noplaybackrate nofullscreen noremoteplayback";

        } else if (ele.mozRequestFullScreen) {

            ele.mozRequestFullScreen();

        } else if (ele.webkitRequestFullScreen) {

            ele.webkitRequestFullScreen();
            ele.controls = false;
            ele.controlsList = "nodownload noplaybackrate nofullscreen noremoteplayback";

        }

        ele.controls = false;

}

//退出全屏

function exitFullscreen() {

    var de =document.getElementById("remote-video");
    if (de.isFullScreen) {
        return
    }
    if (de.exitFullscreen) {

        de.exitFullscreen();

    } else if (de.mozCancelFullScreen) {

        de.mozCancelFullScreen();

    } else if (de.webkitCancelFullScreen) {

        de.webkitCancelFullScreen();

    }
    return false;
}