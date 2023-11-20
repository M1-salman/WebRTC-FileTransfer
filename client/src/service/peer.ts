let peerConnection: RTCPeerConnection | null;
let dataChannel: RTCDataChannel | undefined;

let servers: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun1.1.google.com:19302", "stun:stun2.1.google.com:19302"],
    },
  ],
};

const createPeerConnection = async () => {
  peerConnection = new RTCPeerConnection(servers);

  dataChannel = peerConnection?.createDataChannel("file-channel", {
    negotiated: true,
    id: 0,
  });

  dataChannel!.onopen = () => {
    console.log("datachannel open");
  };

  dataChannel!.onclose = () => {
    console.log("datachannel close");
  };
};

export const getOffer = async () => {
  if (!peerConnection) {
    createPeerConnection();
  }

  let offer: RTCSessionDescriptionInit | undefined =
    await peerConnection?.createOffer();
  await peerConnection?.setLocalDescription(offer);

  return offer;
};

export const getAnswer = async (offer: RTCSessionDescriptionInit) => {
  if (!peerConnection) {
    createPeerConnection();
  }

  await peerConnection?.setRemoteDescription(offer);

  let answer = await peerConnection?.createAnswer();
  await peerConnection?.setLocalDescription(answer);
  return answer;
};

export const addAnswer = (answer: RTCSessionDescriptionInit) => {
  if (!peerConnection?.currentRemoteDescription) {
    peerConnection?.setRemoteDescription(answer);
  }
};

export { peerConnection, dataChannel };
