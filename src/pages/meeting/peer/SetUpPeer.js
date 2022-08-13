import { useRef } from 'react';
import PeerReceive from './recieve';
import PeerShare from './send';
import reqData from '../../../utils/wild';


export default function SetUpPeer (props) {
    const { name, setPeerStreams, call } = props;
    const shareModal = useRef(null);
    const receiveModal = useRef(null);

    // noinspection JSUnusedGlobalSymbols
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
        call,
        name,
        shareModal,
        receiveModal
    };

    const openShareModal = () => {
        shareModal.current.style.display = 'block';
    };

    const openReceiveModal = () => {
        receiveModal.current.style.display = 'block';
    };

    return (
        <>
            <button onClick={openShareModal} className="meeting_actions_btn">Share with peer</button>
            <button onClick={openReceiveModal} className="meeting_actions_btn">Receive from peer</button>
            <PeerShare {...rtcOptions} />
            <PeerReceive {...rtcOptions} {...{setPeerStreams}}/>
        </>
    )
}