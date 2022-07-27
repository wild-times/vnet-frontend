import { useEffect, useRef } from "react";

export default function PeerShare (props) {
    const { signalling } = props;
    const status = useRef(null);
    const randomCode = Math.floor(Math.random() * (1000000 - 100000 + 1) + 100000);

    useEffect(() => {
        // connect to signalling server
        const sig = signalling(randomCode, status.current);
        sig.onmessage = (event_) => console.log(JSON.parse(event_.data), "SENDER");

        // collect all streams
        function collectStreams () {
            const streamHomes = [...document.getElementsByClassName('video-stream-home')];
            return streamHomes.filter((el) => {
                return el['firstElementChild'] && el['firstElementChild']['firstElementChild'] && el['firstElementChild']['firstElementChild'].nodeName === 'VIDEO';
            }).map((el) => el['firstElementChild']['firstElementChild'].srcObject);
        }

    }, [randomCode]);

    return (
        <div>
            <h2>Copy this code to your peer to host a connection</h2>
            <span>{randomCode}</span><br/>
            <span ref={status}>Not Connected to signalling server</span>
        </div>
    )
}
