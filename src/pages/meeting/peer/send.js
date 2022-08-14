import { useRef, useState } from "react";


export default function PeerShare (props) {
    const { call, signalling, name, signalTypes, shareModal } = props;
    const [randomCode, setRandomCode] = useState(0);
    const status = useRef(null);
    const statusPeer = useRef(null);

    const closeShareModal = () => {
        shareModal.current.style.display = '';
    };

    const initSharing = () => {
        const streamIds = [];
        const streamsOG = [];

        // collect all streams
        function collectStreams () {
            const streamHomes = [...document.getElementsByClassName('video-stream-home')];

            // filter elements to ensure they are videos
            const filteredStreamHomes = streamHomes.filter((el) => {
                return [
                    el['firstElementChild'],
                    el['firstElementChild']['firstElementChild'],
                    el['firstElementChild']['firstElementChild'].nodeName === 'VIDEO'
                ].every(Boolean)
            });
            const collectedStreams = [];

            streamIds.splice(0, streamIds.length, ...filteredStreamHomes.map((el) => {
                const lStream = el['firstElementChild']['firstElementChild'].srcObject.clone();
                collectedStreams.push(lStream);
                streamsOG.push(lStream);

                return {
                    name: el['id'],
                    id: lStream.getTracks()[0].id
                }
            }));

            return collectedStreams;
        }

        // make an RTCPeerConnection
        const makeConnectionSend = async (signal) => {
            const peerConnection = new RTCPeerConnection();

            // add streams
            collectStreams().forEach((stream) => {
                stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream))
            });

            // create a data channel to send stream IDs to peer
            const channel = peerConnection.createDataChannel('streams');

            // send stream ids once channel is open
            channel.addEventListener('open', () => {
                channel.send(JSON.stringify({
                    type: 'stream_ids',
                    streams: streamIds,
                    act: false
                }));
            });

            channel.addEventListener('message', async (channelEvent) => {
                const channelMessage = JSON.parse(channelEvent.data);

                if (channelMessage.type === 'streams_query') {
                    const newStreams = collectStreams();

                    // find the difference in streams
                    const peerStreamIds = channelMessage.streams.map((stream) => stream.id);
                    const localStreamIds = streamIds.map((stream) => stream.id);

                    if ((peerStreamIds.findIndex((id) => !localStreamIds.includes(id)) > -1) || (localStreamIds.findIndex((id) => !peerStreamIds.includes(id)) > -1)) {
                        peerConnection.getSenders().forEach((sender) => {
                            if (sender.track) {
                                peerConnection.removeTrack(sender);
                            }
                        });

                        newStreams.forEach((stream) => {
                            stream.getTracks().forEach((track) => {
                                try {
                                    peerConnection.addTrack(track, stream);
                                } catch (e) {
                                    console.log(e);
                                }
                            });
                        });

                        channel.send(JSON.stringify({
                            type: 'stream_ids',
                            streams: streamIds,
                        }));
                    }
                }
            });

            // close signalling server connection when connected
            peerConnection.addEventListener('connectionstatechange', () => {
                if (peerConnection.connectionState === 'connected') {
                    statusPeer.current.innerText = 'Connected to peer';
                    closeShareModal();

                    // close the peer connection when the call ends
                    call.on("stateChanged", () => {
                        if (call.state === 'Disconnected') {
                            peerConnection.close();
                            streamsOG.forEach((streamOG) => streamOG.getTracks().forEach((track) => track.stop()));
                        }
                    });

                } else if (peerConnection.connectionState === 'connecting') {
                    statusPeer.current.innerText = 'Connecting to peer';
                } else {
                    statusPeer.current.innerText = 'Not Connected to peer';
                }
            });

            // send candidates
            peerConnection.addEventListener('icecandidate', (event_) => {
                if (event_.candidate) {
                    signal.send(JSON.stringify({
                        type: signalTypes.CANDIDATE,
                        content: event_.candidate,
                        name
                    }));
                }
            });

            // send offer
            peerConnection.addEventListener('negotiationneeded', async () => {
                await peerConnection.setLocalDescription(await peerConnection.createOffer());

                signal.send(JSON.stringify({
                    type: signalTypes.OFFER,
                    content: {
                        descriptionMessage: peerConnection.localDescription,
                        metaData: streamIds
                    },
                    name
                }));
            });

            signal.addEventListener('message', async (event_) => {
                // this being the sender, it only expects messages for ANSWER and ICECANDIDATE
                const message = JSON.parse(event_.data);

                if (message.type === signalTypes.ANSWER) {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(message.description));

                } else if (message.type === signalTypes.CANDIDATE) {
                    try {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(message['candidates']));
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
        };

        // connect to signalling server
        const sig = signalling(randomCode, status.current);
        sig.onmessage = async (event_) => {
            const data = JSON.parse(event_.data);

            if (data['type'] === signalTypes.SIGNAL_CONNECTED && data['peers_count'] === 2) {
                await makeConnectionSend(sig);
            }
        };
    };

    const startSharing = () => setRandomCode(Math.floor(Math.random() * (1000000 - 100000 + 1) + 100000));

    if (randomCode) {
        initSharing();
    }

    return (
        <div className="vnet-modal" id="host-peer" ref={shareModal}>
            <div className="vnet-modal-content peer-modal">
                <div className="vnet-modal-header">
                    <span onClick={closeShareModal} className="vnet-modal-close">&times;</span>
                    <h2>Share with peer</h2>
                </div>
                <div className="vnet-modal-body">
                    {
                        randomCode? (
                            <>
                                <p>Copy this code to the network peer to host a connection</p>
                                <span>{ randomCode }</span>
                            </>
                        ): (
                            <div style={{width: '30%', margin: 'auto', marginTop: '2em', marginBottom: '2em'}}>
                                <button onClick={startSharing} style={{background: 'azure', color: '#432943'}} className="wild-buttons">
                                    Start sharing
                                </button>
                            </div>
                        )
                    }
                </div>
                <div className="vnet-modal-footer">
                    <h3><span ref={status}>Not connected to signalling server</span> • <span ref={statusPeer}>Not connected to peer</span></h3>
                </div>
            </div>
        </div>
    )
}
