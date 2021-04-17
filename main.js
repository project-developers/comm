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
let remoteConnection;
let sendChannel;
let receiveChannel;
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
  //downloadAnchor.textContent = '';
  //bitrateDiv.innerHTML = '';
  
  
  if (sendChannel.readyState == "open") {
  //sendChannel.close();
  //sendChannel = peerConnection.createDataChannel(fileInput.files[0].name + ' | ' + fileInput.files[0].size + ' | ' + fileInput.files[0].type + ' | ' + fileInput.files[0].lastModified);
    sendData();
  }else if(sendChannel && localConnection){
    sendChannel.close();
    sendChannel = localConnection.createDataChannel('sendDataChannel', {maxPacketLifeTime: 4096}, {maxRetransmits: 16});
    sendData();
  }else{
    clickcreateoffer();
    sendData();
  };
  //localConnection = peerConnection;
  //sendChannel = dataChannel;

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
    await remoteConnection.addIceCandidate(event.candidate);
  });
*/
  //remoteConnection = peerConnection;
  //receiveChannel = dataChannel;
  
  /*
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
  //fileInput.disabled = true;
}

function sendData() {
  const file = fileInput.files[0];
  //console.log(`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`);
  
  //var details = JSON.stringify({name: fileInput.files[0], size: Number(fileInput.files[1]), type: fileInput.files[2], lastModified: Number(fileInput.files[3])});
  
  var pacer = 1;
  var paceSetter = 1;

  // Handle 0 size files.
  statusMessage.textContent = '';
  downloadAnchor.textContent = '';
  if (file.size === 0) {
    bitrateDiv.innerHTML = '';
    statusMessage.textContent = 'File is empty, please select a non-empty file';
    //closeDataChannels();
    return;
  }
  sendProgress.max = file.size;
  //receiveProgress.max = file.size;
  var details = `${[file.name, file.size, file.type, file.lastModified].join('~')}`;
  
  if(file.size <= 16777216){
    const chunkSize = 16384;
  }else{
    const chunkSize = 1024;
  }
     
  //const chunkSize = 1024;
  //const chunkSize = 16384;
  //const chunkSize = 65535;
  fileReader = new FileReader();
  let offset = 0;
  //var details = JSON.stringify({name: fileInput.files[0], size: Number(fileInput.files[1]), type: fileInput.files[2], lastModified: Number(fileInput.files[3])});
  
 // handleChunk(details);
  sendChannel.send(details);
 /* sendChannel.send(fileInput.files[1].size);
  sendChannel.send(fileInput.files[2].type);
  sendChannel.send(fileInput.files[3].lastModified);*/
  fileReader.addEventListener('error', error => console.error('Error reading file:', error));
  fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
  fileReader.addEventListener('load', sendChunk);
                              
    async function sendChunk(event) {
    //console.log('FileRead.onload ', e);
    sendChannel.send(event.target.result);
      
    //handleChunk(`${event.target.result}`);
      /*if(file.size > 10000000){
       
      await sleep(50);
      
      }
      /*if(offset == pacer * chunkSize){
        if (pacer == 1){pacer = 10};
      await sleep(1000);
      pacer = pacer + 10;
      }*//*
      if((pacer * paceSetter) == 100){
      await sleep(3000);
      pacer = 1;
      paceSetter = 1;
      }
      pacer++;*/
    offset += event.target.result.byteLength;
    sendProgress.value = offset;
    if (offset < file.size) {
      readSlice(offset);
    }
  };
  
  /*
  const handleChunk = (chunk) => {
    return new Promise(resolve => sendChannel.send(resolve, chunk))
  }
  */
  const readSlice = o => {
      //console.log('readSlice ', o);
      const slice = file.slice(offset, o + chunkSize);
      fileReader.readAsArrayBuffer(slice);
  };
  readSlice(0);
  //sendChannel.close();
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}


/*
const list = [1, 2, 3, 4]
const doSomething = async () => {
  for (const item of list) {
    await sleep(1000)
    console.log('waiting...')    
  }
}

doSomething()
*/
function closeDataChannels() {
  console.log('Closing data channels');
  if (sendChannel) {
  sendChannel.close();
  console.log(`Closed data channel with label: ${sendChannel.label}`);
  sendChannel = null;
  localConnection.close();
  localConnection = null;
  }
  if (receiveChannel) {
    receiveChannel.close();
    console.log(`Closed data channel with label: ${receiveChannel.label}`);
    receiveChannel = null;
    remoteConnection.close();
    remoteConnection = null;
  }
  
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

//var fileDetails;
//var parts;
//var info;

function receiveChannelCallback(event) {
  console.log('Receive Channel Callback');
  chatlog('Connected');
  
  receiveChannel = event.channel;
  receiveChannel.binaryType = 'arraybuffer';
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;

  receivedSize = 0;
  bitrateMax = 0;
  downloadAnchor.textContent = '';
  bitrateDiv.innerHTML = '';
  downloadAnchor.removeAttribute('download');
  if (downloadAnchor.href) {
    URL.revokeObjectURL(downloadAnchor.href);
    downloadAnchor.removeAttribute('href');
  }
}
//const re = /\s*(?:;|$)\s*/;
function onReceiveMessageCallback(event) {
  /*
  var fileDetails = `${sendChannel.label}`
  var parts = fileDetails.split(' ')
  var info = {name: parts[0], size: Number(parts[1]), type: parts[2], lastModified: Number(parts[3])};
  */

  
  //console.log(receiveChannel.label);
  //fileDetails = JSON.parse(receiveBuffer[0]);
  //parts = fileDetails.split(' | ');
  //info = {name: receiveBuffer[0], size: Number(receiveBuffer[1]), type: receiveBuffer[2], lastModified: Number(receiveBuffer[3])};
  //receiveProgress.max = fileDetails.size;
  
  
  //console.log(`Received Message ${event.data.byteLength}`);
  receiveBuffer.push(event.data);
  //console.log(receivedSize);
  //fileDetails = JSON.parse(receiveBuffer[0]);
  var fileDetails = receiveBuffer[0];
  
  //let parts = fileDetails.split(re);
  var parts = fileDetails.split('~');
  var info = {name: parts[0], size: Number(parts[1]), type: parts[2], lastModified: Number(parts[3])};
  //receiveProgress.max = info.size;
  
  receiveProgress.max = info.size;
  if (receiveBuffer.length == 1) {
    
  }else{
  receivedSize += Number(`${event.data.byteLength}`);
    //console.log(receivedSize.value);
  receiveProgress.value = receivedSize;
    //console.log(receiveProgress.value);
  }
  //console.log(receiveProgress.value);

  // we are assuming that our signaling protocol told
  // about the expected file size (and name, hash, etc).
  
  //const file = info;
  
  //const file = fileInput.files[0];
  
  //console.log(fileInput.files[0]);
  let file = info;
 // if (receivedSize === (file.size + receiveBuffer[0] + receiveBuffer[1] + receiveBuffer[2] + receiveBuffer[3])) {
   
  if (receivedSize === file.size) {
    receiveBuffer.shift();
  /*  receiveBuffer.shift();
    receiveBuffer.shift();
    receiveBuffer.shift();*/
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

    //closeDataChannels();
    /*URL.revokeObjectURL(downloadAnchor.href);
    receiveBuffer.length = 0;
    receivedSize = 0;*/
 fileDetails = '';
  receiveBuffer.length = 0;
    receivedSize = 0;
  parts.length = 0;
  info = '';
  }
}

function onSendChannelStateChange() {
  if (sendChannel) {
    const {readyState} = sendChannel;
    console.log(`Send channel state is: ${readyState}`);
    if (readyState === 'open') {
      chatlog('Connected');
      //sendData();
    }else{
    chatlog('Disconnected');
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

async function onReceiveChannelStateChange() {
  if (receiveChannel) {
    const readyState = receiveChannel.readyState;
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
  if (remoteConnection && remoteConnection.iceConnectionState === 'connected') {
    const stats = await remoteConnection.getStats();
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
