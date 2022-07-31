import { useEffect, useRef } from "react";

export default function PeerShare (props) {
    const { signalling, name, signalTypes } = props;
    const status = useRef(null);
    const statusPeer = useRef(null);
    const randomCode = Math.floor(Math.random() * (1000000 - 100000 + 1) + 100000);

    useEffect(() => {
        const streamIds = [];

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

            // save stream id and name
            streamIds.splice(0, streamIds.length, ...filteredStreamHomes.map((el) => ({
                name: el.id,
                id: el['firstElementChild']['firstElementChild'].srcObject.getTracks()[0].id
            })));

            return filteredStreamHomes.map((el) => el['firstElementChild']['firstElementChild'].srcObject);
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
                    streams: streamIds
                }));
            });

            // close signalling server connection when connected
            peerConnection.addEventListener('connectionstatechange', () => {
                if (peerConnection.connectionState === 'connected') {
                    statusPeer.current.innerText = 'Connected to peer';
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
                    await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidates))
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

    }, [randomCode]);

    return (
        <div>
            <h2>Copy this code to your peer to host a connection</h2>
            <span>{randomCode}</span><br/>
            <span ref={status}>Not Connected to signalling server</span>
            <br />
            <span ref={statusPeer} />
        </div>
    )
}