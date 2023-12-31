import { RTCPeerConnection, mediaDevices } from 'react-native-webrtc';

import { post_offer } from '@controller';
import { SettingsType } from '@model';

function createPeerConnection() {
  const pc = new RTCPeerConnection({
    sdpSemantics: 'unified-plan',
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
  });

  return pc;
}
function negotiate(
  pc: RTCPeerConnection,
  server: string,
  skip_ice: boolean = false,
) {
  console.log(`Negotiating with ${server}...`);
  return pc
    .createOffer(null)
    .then(function (offer) {
      return pc.setLocalDescription(offer);
    })
    .then(() => {
      if (skip_ice) {
        console.warn('Skipping ICE gathering');
        return null;
      }
      new Promise(function (resolve) {
        if (pc.iceGatheringState === 'complete') {
          resolve(null);
        } else {
          function checkState() {
            if (pc.iceGatheringState === 'complete') {
              pc.removeEventListener('icegatheringstatechange', checkState);
              resolve(null);
            }
          }
          pc.addEventListener('icegatheringstatechange', checkState);
        }
      });
    })
    .then(function () {
      var offer = pc.localDescription!!;

      return post_offer(server, {
        sdp: offer.sdp,
        type: offer.type!!,
      });
    })
    .then(function (answer) {
      return pc.setRemoteDescription(answer);
    })
    .catch(function (e) {
      alert(e);
    });
}
export function start(
  settings: SettingsType,
): [RTCPeerConnection, RTCDataChannel, RTCDataChannel] {
  const pc: RTCPeerConnection = createPeerConnection();

  const server = settings.server;
  const wait_ice = !settings.rtc.waitForICEGathering;

  console.log('Created local peer connection object pc');

  var parameters = { ordered: true };

  const textDC = pc.createDataChannel(
    'speech_recognition',
    parameters,
  ) as unknown as RTCDataChannel;

  const confidenceDC = pc.createDataChannel(
    'confidence',
    parameters,
  ) as unknown as RTCDataChannel;

  var constraints = {
    audio: true,
    video: false,
  };

  mediaDevices.getUserMedia(constraints).then(
    (stream) => {
      stream.getTracks().forEach(function (track) {
        pc.addTrack(track, stream);
      });
      return negotiate(pc, server, wait_ice);
    },
    function (err) {
      alert('Could not acquire media: ' + err);
    },
  );

  return [pc, textDC, confidenceDC];
}
export function stop(
  pc?: RTCPeerConnection,
  tdc?: RTCDataChannel,
  cdc?: RTCDataChannel,
) {
  tdc?.close();
  cdc?.close();
  if (pc?.getReceivers()) {
    pc?.getReceivers().forEach(function (receiver) {
      receiver.track?.stop();
    });
  }
  if (pc?.getSenders()) {
    pc?.getSenders().forEach(function (sender) {
      sender.track?.stop();
    });
  }
  setTimeout(() => pc?.close(), 500);
}
