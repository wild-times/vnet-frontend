import { NavLink, useNavigate } from 'react-router-dom';

// represents meetings already created, and lets you join immediately
function ExistingMeeting (props) {
    const { title, startTime, meetingId } = props;

    return (
        <div className="ex-meeting">
            <span>{title} starting at {startTime} | <NavLink to={`/conf/${meetingId}/`}>Join</NavLink></span>
        </div>
    )
}


// this is the initial page
export default function Home () {
    const _meetings = [
        {
            title: 'When was yesterday',
            startTime: new Date('2022-09-09 19:00:00.0+03:00').toString(),
            meetingId: 'edklkl4l42m'
        },
        {
            title: 'When is yesterday',
            startTime: new Date('2022-11-09 19:00:00.0+03:00').toString(),
            meetingId: 'HHsaswdjwjk2m'
        },
        {
            title: 'DOuble tr',
            startTime: new Date('2022-10-09 19:00:00.0+03:00').toString(),
            meetingId: 'edklkl4l42m'
        },
        {
            title: 'Fudge',
            startTime: new Date('2022-06-09 19:00:00.0+03:00').toString(),
            meetingId: 'edklkl4l42m'
        },
        {
            title: 'New Era',
            startTime: new Date('2023-09-09 19:00:00.0+03:00').toString(),
            meetingId: '342lkl4l42m'
        }
    ];

    // TODO: Every thing below this line is to be preserved. This line and everything above is to be replaced finally.
    const meetings = _meetings.map((meeting, k) => <ExistingMeeting key={k} {...meeting}/>);

    // when the code is entered
    const navigate = useNavigate();
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
                    {meetings}
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