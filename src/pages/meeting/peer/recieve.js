import { useRef } from "react";


export default function PeerReceive (props) {
    const { signalling } = props;
    const status = useRef(null);

    const connectEvent = (event_) => {
        event_.preventDefault();
        const f = new FormData(event_.target);
        const sig = signalling(f.get('code'), status.current);
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
