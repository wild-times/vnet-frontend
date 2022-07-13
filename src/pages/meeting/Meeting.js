import { useState } from 'react';
import { useQuery } from "react-query";

import MeetingRoom from './MeetingRoom';
import SetUp from './SetUpMeeting';
import { getUserDetails } from "../../utils/req";


export default function Meeting () {
    const [inMeeting, inMeetingSwitch] = useState(false);
    const { data } = useQuery('user', getUserDetails);

    return (
        <div id="vnet-meeting">
            <h2>Welcome to VNET meeting</h2>

            {inMeeting? <MeetingRoom switchMeeting={inMeetingSwitch}/>: <SetUp switchMeeting={inMeetingSwitch}/>}
        </div>
    )
}