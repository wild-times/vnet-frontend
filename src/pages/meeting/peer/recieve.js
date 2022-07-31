import { useRef } from "react";


export default function PeerReceive (props) {
    const { signalling, name, signalTypes, setPeerStreams } = props;
    const status = useRef(null);
    const statusPeer = useRef(null);
    const streamIds = [];

    const connectEvent = (event_) => {
        event_.preventDefault();
        const f = new FormData(event_.target);
        const sig = signalling(f.get('code'), status.current);
        [...event_.target].forEach((element) => element.disabled = true);

        const makeConnectionReceive = async (signal) => {
            const peerConnection = new RTCPeerConnection();

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
                    buildStreams();
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
        <div>
            <span>Receive</span><br/>
            <span ref={status}>Not Connected to signalling server</span>
            <br />
            <span ref={statusPeer} />

            <form onSubmit={connectEvent}>
                <div>
                    <label htmlFor="codeCon">Peer code</label>
                    <input type="number" name="code" id="codeCon" required={true}/>
                </div>

                <input type="submit" value="connect"/>
            </form>
        </div>
    )
}
