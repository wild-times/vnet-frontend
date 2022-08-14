import { useRef } from "react";


export default function PeerReceive (props) {
    const { call, signalling, name, signalTypes, setPeerStreams, receiveModal } = props;
    const status = useRef(null);
    const statusPeer = useRef(null);
    const streamIds = [];

    const closeReceiveModal = () => {
        receiveModal.current.style.display = '';
    };

    const connectEvent = (event_) => {
        event_.preventDefault();
        const f = new FormData(event_.target);
        const sig = signalling(f.get('code'), status.current);
        [...event_.target].forEach((element) => element.disabled = true);


        const makeConnectionReceive = async (signal) => {
            const peerConnection = new RTCPeerConnection();
            let streamQuery;

            const buildStreams = () => {
                const tracks = peerConnection.getReceivers().map((receiver) => receiver.track);

                const streams = tracks.map((track) => {
                    const details = streamIds.find((rStream) => rStream.id === track.id);

                    return details && details.name !== name? Object.assign(
                        details,
                        {
                            mediaStream: new MediaStream([track])
                        }
                    ): null;

                }).filter(Boolean);

                setPeerStreams(streams);
            };

            peerConnection.addEventListener('connectionstatechange', () => {
                if (peerConnection.connectionState === 'connected') {
                    statusPeer.current.innerText = 'Connected to peer';
                    closeReceiveModal();
                    buildStreams();

                    // close peer connection when the call ends & stop query
                    call.on("stateChanged", () => {
                        if (call.state === 'Disconnected') {
                            peerConnection.close();
                            clearInterval(streamQuery);
                        }
                    });

                    peerConnection.addEventListener('track', () => {
                        buildStreams();
                    });

                } else if (peerConnection.connectionState === 'connecting') {
                    statusPeer.current.innerText = 'Connecting to peer';
                } else {
                    statusPeer.current.innerText = 'Not Connected to peer';
                    setPeerStreams([]);
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

            // listen for data channel to receive info about the stream IDs
            peerConnection.addEventListener('datachannel', (event_) => {
                if (peerConnection.connectionState === 'connected') {
                    const channel = event_.channel;

                    channel.addEventListener('message', (channelEvent) => {
                        const channelMessage = JSON.parse(channelEvent.data);

                        // save stream IDs
                        if (channelMessage.type === 'stream_ids' && Array.isArray(channelMessage.streams)) {
                            streamIds.splice(0, streamIds.length, ...channelMessage.streams)
                        }
                    });

                    // query the sender when, if they have new streams
                    streamQuery = () => {
                        if (channel.readyState === 'open') {
                            channel.send(JSON.stringify({
                                type: 'streams_query',
                                streams: streamIds
                            }));
                        }
                    };
                    setInterval(streamQuery, 15000);
                }
            });

            // listen for messages
            signal.addEventListener('message', async (event_) => {
                const message = JSON.parse(event_.data);

                if (message.type === signalTypes.OFFER) {
                    // set offer and return answer
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(message.description.descriptionMessage));
                    await peerConnection.setLocalDescription(await peerConnection.createAnswer());
                    streamIds.splice(0, streamIds.length, ...message.description.metaData);

                    signal.send(JSON.stringify({
                        type: signalTypes.ANSWER,
                        content: peerConnection.localDescription,
                        name
                    }));

                } else if (message.type === signalTypes.CANDIDATE) {
                    // set ice candidate
                    await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidates));
                }
            });
        };

        sig.onmessage = async (event_) => {
            const data = JSON.parse(event_.data);

            if (data['type'] === signalTypes.SIGNAL_CONNECTED && data['peers_count'] === 2) {
                await makeConnectionReceive(sig);
            }
        };
    };

    return (
        <div className="vnet-modal" id="receive-peer" ref={receiveModal}>
            <div className="vnet-modal-content peer-modal">
                <div className="vnet-modal-header">
                    <span onClick={closeReceiveModal} className="vnet-modal-close">&times;</span>
                    <h2>Receive from peer</h2>
                </div>
                <div className="vnet-modal-body">
                    <p>Enter the code from the peer you wish to connect to</p>
                    <form onSubmit={connectEvent}>
                        <div className="code-peer">
                            <label htmlFor="code-input">Code</label>
                            <input required={true} type="number" name="code" id="code-input" placeholder="Enter code from peer"/>
                        </div>
                        <div className="code-peer-submit">
                            <input type="submit" value="Connect" className="wild-buttons"/>
                        </div>
                    </form>
                </div>
                <div className="vnet-modal-footer">
                    <h3><span ref={status}>Not connected to signalling server</span> • <span ref={statusPeer}>Not connected to peer</span></h3>
                </div>
            </div>
        </div>
    )
}
