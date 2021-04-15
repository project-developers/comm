/* eslint no-unused-expressions: 0 */
/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';

let localConnection;
//let peerConnection;
let sendChannel;
let dataChannel;
let fileReader;
const bitrateDiv = document.querySelector('div#bitrate');
const fileInput = document.querySelector('input#fileInput');
const abortButton = document.querySelector('button#abortButton');
const downloadAnchor = document.querySelector('a#download');
const sendProgress = document.querySelector('progress#sendProgress');
const receiveProgress = document.querySelector('progress#receiveProgress');
const statusMessage = document.querySelector('span#status');
const sendFileButton = document.querySelector('button#sendFile');

let receiveBuffer = [];
let receivedSize = 0;

let bytesPrev = 0;
let timestampPrev = 0;
let timestampStart;
let statsInterval = null;
let bitrateMax = 0;

sendFileButton.addEventListener('click', () => createConnection());
//fileInput.addEventListener('change', handleFileInputChange, false);
abortButton.addEventListener('click', () => {
  if (fileReader && fileReader.readyState === 1) {
    console.log('Abort read!');
    fileReader.abort();
  }
});
/*
async function handleFileInputChange() {
  const file = files;
  if (!file) {
    console.log('No file chosen');
  } else {
    sendFileButton.disabled = false;
  }
}

async function createConnection() {
  abortButton.disabled = false;
  sendFileButton.disabled = true;

  clickcreateoffer();

/*
  localConnection = new RTCPeerConnection();
  console.log('Created local peer connection object localConnection');

  sendChannel = localConnection.createDataChannel('sendDataChannel');
  sendChannel.binaryType = 'arraybuffer';
  console.log('Created send data channel');

  sendChannel.addEventListener('open', onSendChannelStateChange);
  sendChannel.addEventListener('close', onSendChannelStateChange);
  sendChannel.addEventListener('error', onError);

  localConnection.addEventListener('icecandidate', async event => {
    console.log('Local ICE candidate: ', event.candidate);
    await peerConnection.addIceCandidate(event.candidate);
  });

  peerConnection = new RTCPeerConnection();
  console.log('Created remote peer connection object peerConnection');

  peerConnection.addEventListener('icecandidate', async event => {
    console.log('Remote ICE candidate: ', event.candidate);
    await localConnection.addIceCandidate(event.candidate);
  });
  peerConnection.addEventListener('datachannel', dataChannelCallback);

  try {
    const offer = await localConnection.createOffer();
    await gotLocalDescription(offer);
  } catch (e) {
    console.log('Failed to create session description: ', e);
  }

  fileInput.disabled = true;
}
/*
function sendData() {
  const file = fileInput.files[0];
  console.log(`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`);

  // Handle 0 size files.
  statusMessage.textContent = '';
  downloadAnchor.textContent = '';
  if (file.size === 0) {
    bitrateDiv.innerHTML = '';
    statusMessage.textContent = 'File is empty, please select a non-empty file';
    closeDataChannels();
    return;
  }
  sendProgress.max = file.size;
  receiveProgress.max = file.size;
  const chunkSize = 16384;
  fileReader = new FileReader();
  let offset = 0;
  fileReader.addEventListener('error', error => console.error('Error reading file:', error));
  fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
  fileReader.addEventListener('load', e => {
    console.log('FileRead.onload ', e);
    sendChannel.send(e.target.result);
    offset += e.target.result.byteLength;
    sendProgress.value = offset;
    if (offset < file.size) {
      readSlice(offset);
    }
  });
  const readSlice = o => {
    console.log('readSlice ', o);
    const slice = file.slice(offset, o + chunkSize);
    fileReader.readAsArrayBuffer(slice);
  };
  readSlice(0);
}
*/
function closeDataChannels() {
  console.log('Closing data channels');
  //sendChannel.close();
  //console.log(`Closed data channel with label: ${sendChannel.label}`);
  //sendChannel = null;
  if (dataChannel) {
    dataChannel.close();
    console.log(`Closed data channel with label: ${dataChannel.label}`);
    dataChannel = null;
  }
  //localConnection.close();
  peerConnection.close();
  //localConnection = null;
  peerConnection = null;
  console.log('Closed peer connections');

  // re-enable the file select
  fileInput.disabled = false;
  abortButton.disabled = true;
  sendFileButton.disabled = false;
}
/*
async function gotLocalDescription(desc) {
  await localConnection.setLocalDescription(desc);
  console.log(`Offer from localConnection\n ${desc.sdp}`);
  await peerConnection.setRemoteDescription(desc);
  try {
    const answer = await peerConnection.createAnswer();
    await gotRemoteDescription(answer);
  } catch (e) {
    console.log('Failed to create session description: ', e);
  }
}
*/
async function gotRemoteDescription(desc) {
  await peerConnection.setLocalDescription(desc);
  console.log(`Answer from peerConnection\n ${desc.sdp}`);
  //await localConnection.setRemoteDescription(desc);
}

function dataChannelCallback(event) {
  console.log('Receive Channel Callback');
  dataChannel = `${event.dataChannel}`;
  dataChannel.binaryType = `${event.dataChannel.binaryType}`;
  dataChannel.onmessage = onReceiveMessageCallback;
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

var fileDetails;
var info;
var file;

function onReceiveMessageCallback(event) {
  fileDetails = `${dataChannel.label}`
  var parts = fileDetails.split(' ')
  info = {name: parts[0], size: Number(parts[1]), type: parts[2], lastModified: Number(parts[3])};

  console.log(`Received Message ${event.data.byteLength}`);
  receiveBuffer.push(`${event.data}`);
  receivedSize += Number(`${event.data.byteLength}`);
  receiveProgress.value = receivedSize;

  // we are assuming that our signaling protocol told
  // about the expected file size (and name, hash, etc).
  file = info;
  if (receivedSize === file.size) {
    const received = new Blob(receiveBuffer);
    receiveBuffer = [];

    downloadAnchor.href = URL.createObjectURL(received);
    downloadAnchor.download = file.name;
    downloadAnchor.textContent =
      `Click to download '${file.name}' (${file.size} bytes)`;
    downloadAnchor.style.display = 'block';

    const bitrate = Math.round(receivedSize * 8 /
      ((new Date()).getTime() - timestampStart));
    bitrateDiv.innerHTML =
      `<strong>Average Bitrate:</strong> ${bitrate} kbits/sec (max: ${bitrateMax} kbits/sec)`;

    if (statsInterval) {
      clearInterval(statsInterval);
      statsInterval = null;
    }

    closeDataChannels();
  }
}
/*
function onSendChannelStateChange() {
  if (sendChannel) {
    const {readyState} = sendChannel;
    console.log(`Send channel state is: ${readyState}`);
    if (readyState === 'open') {
      sendData();
    }
  }
}
*/
function onError(error) {
  if (sendChannel) {
    console.error('Error in sendChannel:', error);
    return;
  }
  console.log('Error in sendChannel which is already closed:', error);
}

async function ondataChannelStateChange() {
  if (dataChannel) {
    const readyState = dataChannel.readyState;
    console.log(`Receive channel state is: ${readyState}`);
    if (readyState === 'open') {
      timestampStart = (new Date()).getTime();
      timestampPrev = timestampStart;
      statsInterval = setInterval(displayStats, 500);
      await displayStats();
    }
  }
}

// display bitrate statistics.
async function displayStats() {
  if (peerConnection && peerConnection.iceConnectionState === 'connected') {
    const stats = await peerConnection.getStats();
    let activeCandidatePair;
    stats.forEach(report => {
      if (report.type === 'transport') {
        activeCandidatePair = stats.get(report.selectedCandidatePairId);
      }
    });
    if (activeCandidatePair) {
      if (timestampPrev === activeCandidatePair.timestamp) {
        return;
      }
      // calculate current bitrate
      const bytesNow = activeCandidatePair.bytesReceived;
      const bitrate = Math.round((bytesNow - bytesPrev) * 8 /
        (activeCandidatePair.timestamp - timestampPrev));
      bitrateDiv.innerHTML = `<strong>Current Bitrate:</strong> ${bitrate} kbits/sec`;
      timestampPrev = activeCandidatePair.timestamp;
      bytesPrev = bytesNow;
      if (bitrate > bitrateMax) {
        bitrateMax = bitrate;
      }
    }
  }
}
