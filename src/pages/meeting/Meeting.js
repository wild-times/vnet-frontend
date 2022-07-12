import { useState } from 'react';

import MeetingRoom from './MeetingRoom';
import SetUp from './SetUpMeeting';


export default function Meeting () {
    const [inMeeting, inMeetingSwitch] = useState(false);

    return (
        <div id="vnet-meeting">
            <h2>Welcome to VNET meeting</h2>

            {inMeeting? <MeetingRoom switchMeeting={inMeetingSwitch}/>: <SetUp switchMeeting={inMeetingSwitch}/>}
        </div>
    )
}