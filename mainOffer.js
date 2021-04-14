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
//let remoteConnection;
let sendChannel;
//let receiveChannel;
let fileReader;
const bitrateDiv = document.querySelector('div#bitrate');
const fileInput = document.querySelector('input#fileInput');
const abortButton = document.querySelector('button#abortButton');
const downloadAnchor = document.querySelector('a#download');
const sendProgress = document.querySelector('progress#sendProgress');
const receiveProgress = document.querySelector('progress#receiveProgress');
const statusMessage = document.querySelector('span#status');
const sendFileButton = document.querySelector('button#sendFile');

//let receiveBuffer = [];
//let receivedSize = 0;

let bytesPrev = 0;
let timestampPrev = 0;
let timestampStart;
let statsInterval = null;
let bitrateMax = 0;

sendFileButton.addEventListener('click', () => createConnection());
fileInput.addEventListener('change', handleFileInputChange, false);
abortButton.addEventListener('click', () => {
  if (fileReader && fileReader.readyState === 1) {
    console.log('Abort read!');
    fileReader.abort();
  }
});

async function handleFileInputChange() {
  const file = fileInput.files[0];
  if (!file) {
    console.log('No file chosen');
  } else {
    sendFileButton.disabled = false;
  }
}

async function createConnection() {
  abortButton.disabled = false;
  sendFileButton.disabled = true;
  //localConnection = new RTCPeerConnection();
 
  localConnection = peerConnection;
  console.log('Created local peer connection object localConnection');

  sendChannel = dataChannel;
  /*
  sendChannel = localConnection.createDataChannel('sendDataChannel');
  sendChannel.binaryType = 'arraybuffer';
  console.log('Created send data channel');

  sendChannel.addEventListener('open', onSendChannelStateChange);
  sendChannel.addEventListener('close', onSendChannelStateChange);
  sendChannel.addEventListener('error', onError);
/*
  localConnection.addEventListener('icecandidate', async event => {
    console.log('Local ICE candidate: ', event.candidate);
    await remoteConnection.addIceCandidate(event.candidate);
  });
*//*
  remoteConnection = new RTCPeerConnection();
  console.log('Created remote peer connection object remoteConnection');

  remoteConnection.addEventListener('icecandidate', async event => {
    console.log('Remote ICE candidate: ', event.candidate);
    await localConnection.addIceCandidate(event.candidate);
  });
  remoteConnection.addEventListener('datachannel', receiveChannelCallback);

  try {
    const offer = await localConnection.createOffer();
    await gotLocalDescription(offer);
  } catch (e) {
    console.log('Failed to create session description: ', e);
  }
*/
  fileInput.disabled = false;
}

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

function closeDataChannels() {
  console.log('Closing data channels');
  sendChannel.close();
  console.log(`Closed data channel with label: ${sendChannel.label}`);
  sendChannel = null;
  if (receiveChannel) {
    receiveChannel.close();
    console.log(`Closed data channel with label: ${receiveChannel.label}`);
    receiveChannel = null;
  }
  localConnection.close();
  //remoteConnection.close();
  localConnection = null;
  //remoteConnection = null;
  console.log('Closed peer connections');

  // re-enable the file select
  fileInput.disabled = false;
  abortButton.disabled = true;
  sendFileButton.disabled = false;
}

async function gotLocalDescription(desc) {
  await localConnection.setLocalDescription(desc);
  console.log(`Offer from localConnection\n ${desc.sdp}`);
  await remoteConnection.setRemoteDescription(desc);
  try {
    const answer = await remoteConnection.createAnswer();
    await gotRemoteDescription(answer);
  } catch (e) {
    console.log('Failed to create session description: ', e);
  }
}

async function gotRemoteDescription(desc) {
  await remoteConnection.setLocalDescription(desc);
  console.log(`Answer from remoteConnection\n ${desc.sdp}`);
  await localConnection.setRemoteDescription(desc);
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

function onError(error) {
  if (sendChannel) {
    console.error('Error in sendChannel:', error);
    return;
  }
  console.log('Error in sendChannel which is already closed:', error);
}

