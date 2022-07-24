import { useEffect, useState, useRef } from 'react';
import { MeetingVideo } from "./MeetingItems";

export default function MeetingRoom (props) {
    const { switchMeeting, callAgent, localStream } = props;
    const [participants, setParticipants] = useState([]);
    const [partViews, setPartViews] = useState([]);
    const statusText = useRef(null);
    const call = callAgent.calls.length? callAgent.calls[0]: null;

    const leaveMeetingEvent = async () => {
        await call.hangUp();
    };

    useEffect(() => {
        if (call) {
            statusText.current.innerText = call.state;

            const sc = () => {
                switch (call.state) {
                    case 'Disconnecting':
                        statusText.current.innerText = 'Leaving call';
                        break;

                    case 'Disconnected':
                        switchMeeting(3);
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
    });

    const localS = <MeetingVideo you={true} name={callAgent.displayName} stream={localStream}/>;

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

    return (
        <div id="meeting-room">
            <h2>Meeting Room</h2>
            <div>
                <span ref={statusText} />
                <button onClick={leaveMeetingEvent}>Leave call</button>
            </div>

            <div className='room-streams'>
                {localS}

                {partViews}
            </div>

        </div>
    )
}