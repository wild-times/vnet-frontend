import { useState } from 'react';
import PeerReceive from './recieve';
import PeerShare from './send';
import reqData from '../../../utils/wild';


export default function SetUpPeer (props) {
    const { name } = props;
    // gen state means what state of a WebRTC connection this is; 0 = no connection, 1 = host peer, 2 = receiving peer
    const [gen, setGen] = useState(0);
    const peerSetter = (stateDigit) => setGen(stateDigit);

    const rtcOptions = {
        signalling: (code, statusDiv) => {
            const url = `ws://${window.location.hostname}:8000${reqData.signallingServer}${code}/`;
            const socket = new WebSocket(url);
            socket.onopen = () => statusDiv.innerText = 'Connected to signalling server';
            socket.onclose = () => statusDiv.innerText = 'Not Connected to signalling server';
            return socket;
        },
        signalTypes: {
            SIGNAL_CONNECTED: 'signal_connected',
            SIGNAL_DISCONNECTED: 'signal_disconnected',
            OFFER: 'offer',
            ANSWER: 'answer',
            CANDIDATE: 'candidate'
        },
        name
    };

    return (
        <div>
            <h2>Set up a peer connection to share or receive feed from a peer on your network</h2>

            {gen === 0?
                <div>
                    <button onClick={() => peerSetter(1)}>Share</button>
                    <button onClick={() => peerSetter(2)}>Receive</button>
                </div>: null
            }

            {gen === 1? <PeerShare {...rtcOptions} />: gen === 2?<PeerReceive {...rtcOptions} />: null}
        </div>
    )
}