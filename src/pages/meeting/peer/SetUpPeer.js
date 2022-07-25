import { useEffect, useState, useRef } from 'react';

import reqData from '../../../utils/wild';


function PeerReceive () {
    const status = useRef(null);
    const connectEvent = (event_) => {
        event_.preventDefault();
        const f = new FormData(event_.target);
        const url = `ws://${window.location.hostname}:8000${reqData.signallingServer}${f.get('code')}/`;
        const sig = new WebSocket(url);
        sig.onopen = () => status.current.innerText = 'Connected to signalling server';
        sig.onclose = () => status.current.innerText = 'Not Connected to signalling server';
        sig.onmessage = (event_) => console.log(JSON.parse(event_.data), "RECEIVER");
    };

    return (
        <div>
            <span>Receive</span><br/>
            <span ref={status}>Not Connected to signalling server</span>

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


function PeerShare () {
    const status = useRef(null);
    const randomCode = Math.floor(Math.random() * (1000000 - 100000 + 1) + 100000);

    useEffect(() => {
        const url = `ws://${window.location.hostname}:8000${reqData.signallingServer}${randomCode}/`;
        const sig = new WebSocket(url);

        sig.onopen = () => status.current.innerText = 'Connected to signalling server';
        sig.onclose = () => status.current.innerText = 'Not Connected to signalling server';
        sig.onmessage = (event_) => console.log(JSON.parse(event_.data), "SENDER");

    }, [randomCode]);

    return (
        <div>
            <h2>Copy this code to your peer to host a connection</h2>
            <span>{randomCode}</span><br/>
            <span ref={status}>Not Connected to signalling server</span>
        </div>
    )
}


export default function SetUpPeer () {
    // gen state means what state of a WebRTC connection this is; 0 = no connection, 1 = host peer, 2 = receiving peer
    const [gen, setGen] = useState(0);
    const peerSetter = (stateDigit) => setGen(stateDigit);

    return (
        <div>
            <h2>Set up a peer connection to share or receive feed from a peer on your network</h2>

            {gen === 0?
                <div>
                    <button onClick={() => peerSetter(1)}>Share</button>
                    <button onClick={() => peerSetter(2)}>Receive</button>
                </div>: null
            }

            {gen === 1? <PeerShare />: gen === 2?<PeerReceive/>: null}
        </div>
    )
}