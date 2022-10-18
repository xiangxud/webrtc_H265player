// var controlDC;
// var bcontrolopen = false;
function initControl() {
    controlDC = pc.createDataChannel("Control");

    controlDC.onmessage = function (event) {
        console.log("received: " + event.data);
        document.getElementById("control_output").value=event.data;
        // $("#control_output").val(event.data);
    };

    controlDC.onopen = function () {
        // $("#control-send").attr("disabled", false);
        bcontrolopen = true;
        console.log("datachannel open");
    };

    controlDC.onclose = function () {
        // $("#control-send").attr("disabled", true);
        bcontrolopen = false;
        console.log("datachannel close");
    };
}
function controlClose() {
    if (bcontrolopen) {
        controlDC.close();
    }
}
function controlSend() {
    if (bcontrolopen) {
        var msg = document.getElementById("controlInput").value;//$("#controlInput").val();
        controlDC.send(msg);
        console.log("datachannel send",msg);
    }
}