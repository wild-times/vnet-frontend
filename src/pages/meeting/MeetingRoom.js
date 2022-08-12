import { useEffect, useState, useRef } from 'react';
import { MeetingVideo, MeetingPeerVideo } from "./MeetingItems";
import SetUpPeer from "./peer/SetUpPeer";
import '../style/MeetingRoom.css';


function NormalParticipants (props) {
    const { participants, call } = props;
    const [partViews, setPartViews] = useState([]);

    useEffect(() => {
        const loadParts = async () => {
            const parts = [];

            for (const part of participants) {
                const rstream = await part.videoStreams[0];
                const name = part.displayName;
                const id_ = part.identifier;

                parts.push(<MeetingVideo apprName={'person_space'} key={id_} you={false} name={name} stream={rstream}/>)
            }

            return parts;
        };

        const mainViewSetter = () => loadParts().then((p) => setPartViews(p));

        mainViewSetter();

        call.on('remoteParticipantsUpdated', mainViewSetter);
    }, [participants]);

    return <>{partViews}</>;
}


function PeerParticipants (props) {
    const { peerStreams } = props;
    const views = peerStreams.map((peerStream) => {
        const componentArgs = {
            name: peerStream.name,
            stream: peerStream.mediaStream
        };

        return <MeetingPeerVideo key={peerStream.id} {...componentArgs} />
    });

    return <>{views}</>;
}


export default function MeetingRoom (props) {
    const { switchMeeting, callAgent, localStream, meeting, host } = props;
    const [participants, setParticipants] = useState([]);
    const [peerStreams, setPeerStreams] = useState([]);
    const statusText = useRef(null);
    const call = callAgent.calls.length? callAgent.calls[0]: null;

    const leaveMeetingEvent = (event_) => {
        const leaveButton = event_.target;
        leaveButton.innerText = 'Leaving';
        leaveButton.disabled = true;

        call.hangUp().then(() => {
            callAgent && !callAgent.disposed? callAgent.dispose(): void 0;
            switchMeeting(3);
        });
    };

    useEffect(() => {
        const navs = [...document.getElementsByClassName('navbar')];
        navs.forEach((nav) => nav.style.display = 'none');

        if (call) {
            statusText.current.innerText = call.state;
            const participantsChange = () => {
                setParticipants(call.remoteParticipants)
            };

            // initial participants painting
            if (call.remoteParticipants && Array.isArray(call.remoteParticipants) && call.remoteParticipants.length > 0) {
                participantsChange();
            }

            call.on('remoteParticipantsUpdated', participantsChange);
        } else {
            switchMeeting(false);
        }

        return () => {
            navs.forEach((nav) => nav.style.display = '');
        };
    }, [call, localStream]);

    const localS = <MeetingVideo apprName={'person_space'} you={true} name={callAgent.displayName} stream={localStream}/>;

    const getHostDisplayName = () => {
        const meetingHost = meeting['host'];
        let name = meetingHost['username'];
        if (meetingHost['meetingName']) {
            name = meetingHost['meetingName'];
        } else if (meetingHost['firstName'] && meetingHost['lastName']) {
            name = `${meetingHost['firstName']} ${meetingHost['lastName']}`
        }
        return host? `${name} (you)`: name;
    };

    return (
        <div className="meeting_page_main">
            <div className="meeting_space">
                <div className="meeting-details">
                    <div className="meeting-details-content">
                        <h2>{meeting.title}</h2>
                        <hr />
                        <p>{meeting['notes']}</p>
                        <hr />
                        <span>Code: {meeting['meetingId']}</span>
                        <hr />
                        <span>Host: {getHostDisplayName()}</span>
                        <hr />
                        <span>
                            Participants: { call && call.remoteParticipants && Array.isArray(call.remoteParticipants)? call.remoteParticipants.length: 0 }
                        </span>
                        <hr />
                        <span ref={statusText} />
                        <hr />
                    </div>
                </div>

                <div className="people_div">
                    {localS}
                    {peerStreams.length? <PeerParticipants {...{peerStreams}}/>: <NormalParticipants {...{call, participants}}/>}
                </div>
            </div>

            <section className="meeting_actions">
                <div className="meeting_actions_options">
                    <SetUpPeer name={callAgent.displayName} {...{setPeerStreams, call}}/>
                    <button onClick={leaveMeetingEvent} className="meeting_actions_btn">Leave Call</button>
                </div>
            </section>
        </div>
    )
}