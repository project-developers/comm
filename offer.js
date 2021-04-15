
function clickcreateoffer() {
  console.log('clickcreateoffer');
  //document.getElementById('buttonoffer').style.display = "none";
  document.getElementById('spanoffer').classList.toggle('invisible');
  peerConnection = createPeerConnection(lasticecandidate);
  
  chatChannel = peerConnection.createDataChannel('chat');
  chatChannel.onopen = datachannelopen;
  chatChannel.onmessage = datachannelmessage;
  
  dataChannel = peerConnection.createDataChannel('name, ' + fileInput.files[0].name + ' | size, ' + fileInput.files[0].size + ' | type, ' + fileInput.files[0].type + ' | lastModified, ' + fileInput.files[0].lastModified);
  dataChannel.binaryType = 'arraybuffer';
  console.log('Created send data channel');
  dataChannel.onopen = onSendChannelStateChange;
  dataChannel.onclose = onSendChannelStateChange;
  dataChannel.error = onError;
  createOfferPromise = peerConnection.createOffer();
  createOfferPromise.then(createOfferDone, createOfferFailed);
  
}

function createOfferDone(offer) {
  console.log('createOfferDone');
  setLocalPromise = peerConnection.setLocalDescription(offer);
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
  offer = peerConnection.localDescription;
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
  setRemotePromise = peerConnection.setRemoteDescription(answer);
  setRemotePromise.then(setRemoteDone, setRemoteFailed);
}

function setRemoteDone() {
  console.log('setRemoteDone');
}

function setRemoteFailed(reason) {
  console.log('setRemoteFailed');
  console.log(reason);
}

function onSendChannelStateChange() {
  if (dataChannel) {
    const {readyState} = dataChannel;
    console.log(`Send channel state is: ${readyState}`);
    if (readyState === 'open') {
      //chatlog('connected');
      sendData();
    }
  }
}
