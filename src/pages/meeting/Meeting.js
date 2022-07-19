import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from "react-query";

import MeetingRoom from './MeetingRoom';
import SetUp from './SetUpMeeting';
import { fetchMeeting, getUserDetails } from "../../utils/req";


export default function Meeting () {
    const { meetingCode } = useParams();
    const [inMeeting, inMeetingSwitch] = useState(false);
    const { data: userData } = useQuery('user', getUserDetails);
    const { status, data: meetingData } = useQuery(['meeting', userData, meetingCode], () => fetchMeeting(meetingCode));

    // to be replaced with better pages for loading...etc
    if (status === 'loading') {
        return <div>working on meeting</div>
    } else if (status === 'error') {
        return <div>An error occurred while fetching meeting</div>
    }

    const meetingNotFound = (() => meetingData && meetingData.hasOwnProperty('message') && meetingData.message === 'Meeting not found')();
    const mainView = inMeeting? <MeetingRoom switchMeeting={inMeetingSwitch}/>: <SetUp switchMeeting={inMeetingSwitch}/>;

    return (
        <div id="vnet-meeting">
            <h2>Welcome to VNET meeting</h2>

            {meetingNotFound? <h3>Could not find the meeting with code "{meetingCode}"</h3>: mainView}
        </div>
    )
}