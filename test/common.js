//Decoder request.
const kInitDecoderReq       = 0;
const kUninitDecoderReq     = 1;
const kOpenDecoderReq       = 2;
const kCloseDecoderReq      = 3;
const kFeedDataReq          = 4;
const kStartDecodingReq     = 5;
const kPauseDecodingReq     = 6;
const kSeekToReq            = 7;

//Decoder response.
const kInitDecoderRsp       = 0;
const kUninitDecoderRsp     = 1;
const kOpenDecoderRsp       = 2;
const kCloseDecoderRsp      = 3;
const kVideoFrame           = 4;
const kAudioFrame           = 5;
const kStartDecodingRsp     = 6;
const kPauseDecodingRsp     = 7;
const kDecodeFinishedEvt    = 8;
const kRequestDataEvt       = 9;
const kSeekToRsp            = 10;
const kVideoParameters      = 11;
const kVideoFrame_Missle    = 12;
const kprodVideoFrame       = 13;

//WebrtcPlayer states.
const playerStateIdle           = 0;
const playerStatePlaying        = 1;
const playerStatePausing        = 2;
//Player request
const kInitPlayerReq            = 0;
const kstartPlayerCoderReq      = 1;
const ksendPlayerVideoFrameReq  = 2;

const kplayeVideoFrame          = 3;
const kendPlayerCoderReq        = 4;

//H265Transferreq
const kstartH265TransferReq     = 0;
const kendH265TransferReq       = 1;

//WASM decoder types
const kDecoder_decodeer_js      = 0;
const kDecoder_prod_h265_wasm_combine_js   = 1;
const kDecoder_missile_decoder_js   =2;

const MAX_FRAME_SIZE=10; 

const DECODER_TYPE = kDecoder_decodeer_js;
// const DECODER_TYPE = kDecoder_missile_decoder_js;
// const DECODER_TYPE = kDecoder_prod_h265_wasm_combine_js;

