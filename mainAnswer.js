

// Define and add behavior to buttons.

// Define action buttons.
//const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');

// Set up initial action buttons status: disable call and hangup.
//callButton.disabled = true;
hangupButton.disabled = true;

// Add click event handlers for buttons.
//startButton.addEventListener('click', startAction);
callButton.addEventListener('click', callAction);
hangupButton.addEventListener('click', hangupAction);



// Set up to exchange only video.
const offerOptions = {
  offerToReceiveVideo: 1,
};

// Define initial start time of the call (defined as connection between peers).
let startTime = null;

// Define peer connections, streams and video elements.
const remoteVideo = document.getElementById('remoteVideo');

let remoteStream;

// Handles remote MediaStream success by adding it as the remoteVideo src.
function gotRemoteMediaStream(event) {
  const mediaStream = event.stream;
  remoteVideo.srcObject = mediaStream;
  remoteStream = mediaStream;
  trace('Remote peer connection received remote stream.');
}

// Add behavior for video streams.

// Logs a message with the id and size of a video element.
function logVideoLoaded(event) {
  const video = event.target;
  trace(`${video.id} videoWidth: ${video.videoWidth}px, ` +
        `videoHeight: ${video.videoHeight}px.`);
}

// Logs a message with the id and size of a video element.
// This event is fired when video begins streaming.
function logResizedVideo(event) {
  logVideoLoaded(event);

  if (startTime) {
    const elapsedTime = window.performance.now() - startTime;
    startTime = null;
    trace(`Setup time: ${elapsedTime.toFixed(3)}ms.`);
  }
}
  
remoteVideo.addEventListener('loadedmetadata', logVideoLoaded);
remoteVideo.addEventListener('onresize', logResizedVideo);

// Handles call button action: creates peer connection.
function callAction() {
  callButton.disabled = true;
  hangupButton.disabled = false;

  trace('Starting call.');
  startTime = window.performance.now();

  
  peerConnection.addEventListener('addstream', gotRemoteMediaStream);
}

// Handles hangup action: ends up call, closes connections and resets peers.
function hangupAction() {
  //localPeerConnection.close();
  peerConnection.close();
  //localPeerConnection = null;
  peerConnection = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
  trace('Ending call.');
}


// Logs an action (text) and the time when it happened on the console.
function trace(text) {
  text = text.trim();
  const now = (window.performance.now() / 1000).toFixed(3);

  console.log(now, text);
}
