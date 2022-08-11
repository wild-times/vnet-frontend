import { useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from "react-query";
import { zeroPen } from '../../utils/misc';
import { fetchMeetings } from "../../utils/req";
import LoadingScreen from "./LoadingScreen";
import '../style/Home.css';


function ExistingMeetingDetails (props) {
    const { title, startTimeDisplay, endTimeDisplay, dayDisplay, notes, meetingId, theModal } = props;
    const closeDetails = () => {
        theModal.current.style.display = ''
    };

    return (
        <div id="details-modal-1" className="vnet-modal" ref={theModal}>
            <div className="vnet-modal-content meeting-dash-meeting-details">
                <div className="vnet-modal-header">
                    <span onClick={closeDetails} className="vnet-modal-close">&times;</span>
                    <h2>{ title } | <small>{ meetingId }</small></h2>
                </div>
                <div className="vnet-modal-body">
                    <p>{ notes }</p>
                    <hr/>
                    <NavLink style={{width: '5%', height: '0.3em'}} className="wild-buttons" to={`/conf/${meetingId}/`}>Join</NavLink>
                </div>
                <div className="vnet-modal-footer">
                    <h3>{ dayDisplay } at { startTimeDisplay }{endTimeDisplay? ` to ${endTimeDisplay}`: null} by you</h3>
                </div>
            </div>
        </div>
    )
}

// represents meetings already created, and lets you join immediately
function ExistingMeeting (props) {
    const months = [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];
    const { title, startTime, endTime, meetingId } = props;
    const details = useRef(null);
    const start = new Date(startTime);
    const end = endTime? new Date(endTime): null;
    const meetingInfo = {
        ...props,
        startTimeDisplay: `${zeroPen(start.getHours())}:${zeroPen(start.getMinutes())}`,
        endTimeDisplay: end? `${zeroPen(end.getHours())}:${zeroPen(end.getMinutes())}`: null,
        dayDisplay: `${months[start.getMonth()]} ${zeroPen(start.getDate())}, ${start.getFullYear()}`
    };

    const expandDetails = () => {
        details.current.style.display = 'block'
    };

    return (
        <div className="meeting-dash-meeting">
            <div className="meeting-dash-meeting-title meeting-dash-meeting-items">
                <h2>{ title }</h2>
            </div>

            <div className="meeting-dash-meeting-time meeting-dash-meeting-items">
                <span>{ meetingInfo.dayDisplay }</span>
                <br/>
                <span>{ meetingInfo.startTimeDisplay }{meetingInfo.endTimeDisplay? ` to ${meetingInfo.endTimeDisplay}`: null}</span>
            </div>

            <div className="meeting-dash-meeting-actions meeting-dash-meeting-items">
                <div>
                    <button onClick={expandDetails} className="wild-buttons meeting-dash-expand">details</button>
                </div>
                <div>
                    <NavLink to={`/conf/${meetingId}/`} className="meeting-dash-join-now wild-buttons">Join</NavLink>
                </div>
            </div>

            <ExistingMeetingDetails theModal={details} {...meetingInfo}/>
        </div>
    )
}

// this is the initial page
export default function Home (props) {
    const { token } = props;
    const navigate = useNavigate();
    const { status, data: _meetings } = useQuery('meetings', () => fetchMeetings(token));

    if (status === 'loading') {
        return <LoadingScreen message='Getting your meetings' />
    } else if (status === 'error') {
        return <h2 className='center-mix'>An error occurred getting your meetings</h2>
    }

    // the real work begins
    const meetings = _meetings.map((meeting, k) => <ExistingMeeting key={k} {...meeting}/>);

    // when the code is entered
    const joinFormSubmit = (event_) => {
        event_.preventDefault();
        const f = new FormData(event_.target);
        const code = f.get('join-code');
        navigate(`/conf/${code}/`)
    };

    return (
        <div className="meeting-dash">
            <div className="meeting-dash-scheduled">
                <h1 className="meeting-dash-headings">Your Scheduled Meetings</h1>

                <div className="meeting-dash-meetings">
                    { meetings.length? meetings: <h2 className='center-mix'>No meetings scheduled</h2> }
                </div>
            </div>

            <div className="meeting-dash-join">
                <h1 className="meeting-dash-headings">Join Meeting with Code</h1>

                <form id="meeting-dash-join-form" onSubmit={joinFormSubmit}>
                    <div>
                        <label htmlFor="meeting-code-input">Enter meeting code</label>
                        <input autoFocus={true} autoComplete="off" type="text" name="join-code" id="meeting-code-input" placeholder="Meeting code..." required />
                    </div>

                    <div id="submit-meeting-div">
                        <input type="submit" value="Join with code" className="wild-buttons" />
                    </div>
                </form>

                <div id="create-meeting">
                    <hr />
                    <div className="bt">
                        <NavLink to={'/new-meeting/'} className='wild-buttons'>Create Meeting</NavLink>
                    </div>
                </div>
            </div>
        </div>
    )
};