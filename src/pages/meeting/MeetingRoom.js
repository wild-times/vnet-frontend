import { useEffect, useState, useRef } from 'react';
import { MeetingVideo } from "./MeetingItems";
import SetUpPeer from "./peer/SetUpPeer";


function NormalParticipants (props) {
    const { participants } = props;
    const [partViews, setPartViews] = useState([]);

    useEffect(() => {
        const loadParts = async () => {
            const parts = [];

            for (const part of participants) {
                const rstream = await part.videoStreams[0];
                const name = part.displayName;
                const id_ = part.identifier;

                parts.push(<MeetingVideo key={id_} you={false} name={name} stream={rstream}/>)
            }

            return parts;
        };

        loadParts().then((p) => setPartViews(p));
    }, [participants]);

    return (
        <div>{partViews}</div>
    )
}

export default function MeetingRoom (props) {
    const { switchMeeting, callAgent, localStream } = props;
    const [participants, setParticipants] = useState([]);
    const [peer, setPeer] = useState(false);
    const statusText = useRef(null);
    const call = callAgent.calls.length? callAgent.calls[0]: null;

    const leaveMeetingEvent = () => {
        call.hangUp().then(() => switchMeeting(3));
    };

    useEffect(() => {
        if (call) {
            statusText.current.innerText = call.state;

            const sc = () => {
                switch (call.state) {
                    case 'Disconnecting':
                        statusText.current.innerText = 'Leaving call';
                        break;

                    default:
                        break;
                }
            };

            const participantsChange = () => {
                setParticipants(call.remoteParticipants)
            };

            call.on('totalParticipantCountChanged', participantsChange);

            call.on('stateChanged', sc);
            call.off('stateChanged', sc);

        } else {
            switchMeeting(false);
        }
    }, [call, localStream]);

    const localS = <MeetingVideo you={true} name={callAgent.displayName} stream={localStream}/>;

    return (
        <div id="meeting-room">
            <h2>Meeting Room</h2>
            <div>
                <span ref={statusText} />
                <button onClick={leaveMeetingEvent}>Leave call</button>
            </div>

            <SetUpPeer/>

            <div className='room-streams'>
                {localS}

                {peer? null: <NormalParticipants participants={participants}/>}
            </div>

        </div>
    )
}