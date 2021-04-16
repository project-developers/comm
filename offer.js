
function clickcreateoffer() {
  console.log('clickcreateoffer');
  //document.getElementById('buttonoffer').style.display = "none";
  document.getElementById('spanoffer').classList.toggle('invisible');
  localConnection = createPeerConnection(lasticecandidate);
  /*
  chatChannel = peerConnection.createDataChannel('chat');
  chatChannel.onopen = datachannelopen;
  chatChannel.onmessage = datachannelmessage;
  */
  //sendChannel = localConnection.createDataChannel('sendDataChannel');
  sendChannel = localConnection.createDataChannel('sendDataChannel', {maxPacketLifeTime: 240000}); //, {maxRetransmits: 500});
  //sendChannel = peerConnection.createDataChannel(fileInput.files[0].name + ' | ' + fileInput.files[0].size + ' | ' + fileInput.files[0].type + ' | ' + fileInput.files[0].lastModified);
  
  sendChannel.binaryType = 'arraybuffer';
  console.log('Created send data channel');
  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;
  sendChannel.error = onError;
  createOfferPromise = localConnection.createOffer();
  createOfferPromise.then(createOfferDone, createOfferFailed);
  
}

function createOfferDone(offer) {
  console.log('createOfferDone');
  setLocalPromise = localConnection.setLocalDescription(offer);
  setLocalPromise.then(setLocalDone, setLocalFailed);
}

function createOfferFailed(reason) {
  console.log('createOfferFailed');
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
  textelement = document.getElementById('textoffer');
  offer = localConnection.localDescription;
  textelement.value = JSON.stringify(offer);
  document.getElementById('buttonoffersent').disabled = false;
}

function clickoffersent() {
  console.log('clickoffersent');
  document.getElementById('spananswer').classList.toggle('invisible');
  document.getElementById('buttonoffersent').disabled = true;
  //document.getElementById('spanoffer').style.display = "none";
}

function clickanswerpasted() {
  console.log('clickanswerpasted');
  //document.getElementById('spananswer').style.display = "none";
  //document.getElementById('buttonanswerpasted').style.display = "none";
  textelement = document.getElementById('textanswer');
  textelement.readOnly = true;
  answer = JSON.parse(textelement.value);
  setRemotePromise = localConnection.setRemoteDescription(answer);
  setRemotePromise.then(setRemoteDone, setRemoteFailed);
}

function setRemoteDone() {
  console.log('setRemoteDone');
}

function setRemoteFailed(reason) {
  console.log('setRemoteFailed');
  console.log(reason);
}

