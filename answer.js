
function clickofferpasted() {
  console.log('clickremoteoffer');
  document.getElementById('buttonofferpasted').disabled = true;
  remoteConnection = createPeerConnection(lasticecandidate);
  //peerConnection.ondatachannel = handledatachannel;
  remoteConnection.ondatachannel = receiveChannelCallback;
  textelement = document.getElementById('textoffer');
  textelement.readOnly = true;
  offer = JSON.parse(textelement.value);
  setRemotePromise = remoteConnection.setRemoteDescription(offer);
  setRemotePromise.then(setRemoteDone, setRemoteFailed);
  //document.getElementById('buttonoffer').style.display = "none";
}

function setRemoteDone() {
  console.log('setRemoteDone');
  createAnswerPromise = remoteConnection.createAnswer();
  createAnswerPromise.then(createAnswerDone, createAnswerFailed);
}

function setRemoteFailed(reason) {
  console.log('setRemoteFailed');
  console.log(reason);
}

function createAnswerDone(answer) {
  console.log('createAnswerDone');
  setLocalPromise = remoteConnection.setLocalDescription(answer);
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
  remoteChannel = event.channel;
  remoteChannel.onopen = datachannelopen;
  remoteChannel.onmessage = datachannelmessage;
}

