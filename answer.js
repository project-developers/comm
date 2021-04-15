
function clickofferpasted() {
  console.log('clickremoteoffer');
  document.getElementById('buttonofferpasted').disabled = true;
  peerConnection = createPeerConnection(lasticecandidate);
  //peerConnection.ondatachannel = handledatachannel;
  peerConnection.ondatachannel = dataChannelCallback;
  textelement = document.getElementById('textoffer');
  textelement.readOnly = true;
  offer = JSON.parse(textelement.value);
  setRemotePromise = peerConnection.setRemoteDescription(offer);
  setRemotePromise.then(setRemoteDone, setRemoteFailed);
  //document.getElementById('buttonoffer').style.display = "none";
}

function setRemoteDone() {
  console.log('setRemoteDone');
  createAnswerPromise = peerConnection.createAnswer();
  createAnswerPromise.then(createAnswerDone, createAnswerFailed);
}

function setRemoteFailed(reason) {
  console.log('setRemoteFailed');
  console.log(reason);
}

function createAnswerDone(answer) {
  console.log('createAnswerDone');
  setLocalPromise = peerConnection.setLocalDescription(answer);
  setLocalPromise.then(setLocalDone, setLocalFailed);
  document.getElementById('spananswer').classList.toggle('invisible');
}

function createAnswerFailed(reason) {
  console.log('createAnswerFailed');
  console.log(reason);
}

function setLocalDone() {
  console.log('setLocalDone');
}

function setLocalFailed(reason) {
  console.log('setLocalFailed');
  console.log(reason);
}

function lasticecandidate() {
  console.log('lasticecandidate');
  textelement = document.getElementById('textanswer');
  answer = peerConnection.localDescription
  textelement.value = JSON.stringify(answer);
}

function handledatachannel(event) {
  console.log('handledatachannel');
  dataChannel = event.channel;
  dataChannel.onopen = datachannelopen;
  dataChannel.onmessage = datachannelmessage;
}

function dataChannelCallback(event) {
  console.log('Receive Channel Callback');
  dataChannel = event.channel;
  dataChannel.binaryType = 'arraybuffer';
  dataChannel.onmessage = onRecieveMessageCallback;
  dataChannel.onopen = ondataChannelStateChange;
  dataChannel.onclose = ondataChannelStateChange;

  receivedSize = 0;
  bitrateMax = 0;
  downloadAnchor.textContent = '';
  downloadAnchor.removeAttribute('download');
  if (downloadAnchor.href) {
    URL.revokeObjectURL(downloadAnchor.href);
    downloadAnchor.removeAttribute('href');
  }
}

function onSendChannelStateChange() {
  if (sendChannel) {
    const {readyState} = sendChannel;
    console.log(`Send channel state is: ${readyState}`);
    if (readyState === 'open') {
      sendData();
    }
  }
}
