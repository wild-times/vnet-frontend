import { useEffect, useState, useRef } from 'react';
import { MeetingVideo } from "./MeetingItems";

export default function MeetingRoom (props) {
    const { switchMeeting, callAgent, localStream } = props;
    const [participants, setParticipants] = useState([]);
    const statusText = useRef(null);
    const call = callAgent.calls.length? callAgent.calls[0]: null;

    const leaveMeetingEvent = async () => {
        await call.hangUp();
    };

    useEffect(() => {
        if (call) {
            statusText.current.innerText = call.state;

            call.on('remoteParticipantsUpdated', ({added, removed}) => {
                if (added || removed) {
                    setParticipants(call.remoteParticipants)
                }
            });

            call.on('stateChanged', () => {
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
            });

        } else {
            switchMeeting(false);
        }
    });

    const localS = <MeetingVideo you={true} name={callAgent.displayName} stream={localStream}/>;

    return (
        <div id="meeting-room">
            <h2>Meeting Room</h2>
            <div>
                <span ref={statusText} />
                <button onClick={leaveMeetingEvent}>Leave call</button>
            </div>

            <div className='room-streams'>
                {localS}
            </div>

        </div>
    )
}