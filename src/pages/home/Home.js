import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from "react-query";
import { fetchMeetings } from "../../utils/req";

// represents meetings already created, and lets you join immediately
function ExistingMeeting (props) {
    const { title, startTime, meetingId } = props;
    const start = new Date(startTime).toString();

    return (
        <div className="ex-meeting">
            <span>{title} starting at {start} | <NavLink to={`/conf/${meetingId}/`}>Join</NavLink></span>
        </div>
    )
}


// this is the initial page
export default function Home () {
    const navigate = useNavigate();
    const { status, data: _meetings } = useQuery('meetings', fetchMeetings);

    // to be replaced with better pages for loading...etc
    if (status === 'loading') {
        return <div>working on meetings</div>
    } else if (status === 'error') {
        return <div>An error occurred fetching meetings</div>
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
        <div id="vnet-join-or-create">
            <h1>Join or create meeting</h1>

            <div id="ex-meetings">
                <h2>Join the meetings below or enter a code meeting code to join</h2>
                <div className="meetings">
                    {meetings.length? meetings: <h3>No meetings scheduled</h3>}
                </div>

                <div id="join-with-code">
                    <form onSubmit={joinFormSubmit}>
                        <div>
                            <label htmlFor="join-code-in">Enter code to join meeting</label>
                            <input type="text" name='join-code' id='join-code-in' required={true} placeholder='Enter code to join a meeting'/>
                        </div>
                        <input type="submit" value='Join with code'/>
                    </form>
                </div>
            </div>

            <div id='create'>
                <h2>Schedule or create a new meeting</h2>
                <NavLink to='/new-meeting/' >Create a new meeting</NavLink>
            </div>
        </div>
    );
};