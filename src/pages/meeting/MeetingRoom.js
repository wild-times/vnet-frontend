import { useEffect, useState, useRef } from 'react';
import { MeetingVideo, MeetingPeerVideo } from "./MeetingItems";
import SetUpPeer from "./peer/SetUpPeer";
import '../style/MeetingRoom.css';


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
        <div className='stream-cover'>{partViews}</div>
    )
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

    return (
        <div className='stream-cover'>{views}</div>
    )
}


export default function MeetingRoom (props) {
    const { switchMeeting, callAgent, localStream, meeting, host } = props;
    const [participants, setParticipants] = useState([]);
    const [peerStreams, setPeerStreams] = useState([]);
    const statusText = useRef(null);
    const call = callAgent.calls.length? callAgent.calls[0]: null;

    const leaveMeetingEvent = () => {
        call.hangUp().then(() => switchMeeting(3));
    };

    useEffect(() => {
        const navs = [...document.getElementsByClassName('navbar')];
        navs.forEach((nav) => nav.style.display = 'none');

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

        return () => {
            navs.forEach((nav) => nav.style.display = '');
        };
    }, [call, localStream]);

    const localS = <MeetingVideo you={true} name={callAgent.displayName} stream={localStream}/>;

    // return (
    //     <div id="meeting-room">
    //         <h2>Meeting Room</h2>
    //         <div>
    //             <span ref={statusText} />
    //             <button onClick={leaveMeetingEvent}>Leave call</button>
    //         </div>
    //
    //         <SetUpPeer name={callAgent.displayName} {...{setPeerStreams}}/>
    //
    //         <div className='room-streams'>
    //             {localS}
    //
    //             {peerStreams.length? <PeerParticipants {...{peerStreams}}/>: <NormalParticipants participants={participants}/>}
    //         </div>
    //
    //     </div>
    // )
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
                        <span>Code: {meeting['meetingId']}-</span>
                        <hr />
                        <span>Host: {getHostDisplayName()}</span>
                        <hr />
                        <span>Participants: {call['totalParticipantCount']}</span>
                        <hr />
                        <span ref={statusText} />
                        <hr />
                    </div>
                </div>

                <div className="people_div">
                    {/*<div className="person_space"></div>*/}
                    {/*<div className="person_space"></div>*/}
                    {/*<div className="person_space"></div>*/}
                    {/*<div className="person_space"></div>*/}
                    {/*<div className="person_space"></div>*/}
                    {/*<div className="person_space"></div>*/}
                </div>
            </div>

            <section className="meeting_actions">
                <div className="meeting_actions_options">
                    <SetUpPeer name={callAgent.displayName} {...{setPeerStreams}}/>
                    <button onClick={leaveMeetingEvent} className="meeting_actions_btn">Leave Call</button>
                </div>
            </section>
        </div>
    )
}