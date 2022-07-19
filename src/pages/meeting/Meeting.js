import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from "react-query";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { CallClient } from '@azure/communication-calling';

import MeetingRoom from './MeetingRoom';
import SetUp from './SetUpMeeting';
import { fetchMeeting, getUserDetails } from "../../utils/req";


function MeetingLite (props) {
    const { user, meeting } = props;
    const [inMeeting, inMeetingSwitch] = useState(false);
    const [tokenCredential, setTokenCredential] = useState(null);
    const [callClient, setCallClient] = useState(null);
    const [callAgent, setCallAgent] = useState(null);
    const [deviceManager, setDeviceManager] = useState(null);
    const [devicePermissions, setDevicePermissions] = useState(null);
    const [localStream, setLocalStream] = useState(null);


    useEffect(() => {
        //  name to be used in the display
        const getDisplayName = () => {
            let name = user['username'];
            if (user['meetingName']) {
                name = user['meetingName'];
            } else if (user['firstName'] && user['lastName']) {
                name = `${user['firstName']} ${user['lastName']}`
            }
            return name;
        };

        // create acs variables
        const acs = async () => {
            const _tokenCredential = new AzureCommunicationTokenCredential(user['acsToken']);
            const _callClient = new CallClient();
            const _callAgent = await _callClient.createCallAgent(_tokenCredential, {
                displayName: getDisplayName()
            });

            const _deviceManager = await _callClient.getDeviceManager();
            const _devicePermission = await _deviceManager.askDevicePermission({
                audio: true,
                video: true
            });

            return [_tokenCredential, _callClient, _callAgent, _deviceManager, _devicePermission]
        };

        acs().then((_args) => {
            setTokenCredential(_args[0]);
            setCallClient(_args[1]);
            setCallAgent(_args[2]);
            setDeviceManager(_args[3]);
            setDevicePermissions(_args[4]);
        }).catch((e) => console.error(e));

        return () => callAgent? callAgent.dispose(): void 0;
    }, [meeting, user]);

    const toShow = (() => {
        let comp = <div>Setting up</div>;

        if (tokenCredential && callClient && callAgent && deviceManager && devicePermissions.audio && devicePermissions.video) {
            const dep = {
                switchMeeting: inMeetingSwitch,
                host: user['username'] === meeting['host']['username'],
                localStream,
                setLocalStream,
                callAgent,
                callClient,
                deviceManager,
                meeting,
                user,
            };

            comp = inMeeting? <MeetingRoom {...dep}/>: <SetUp {...dep} />
        }

        return comp;
    })();

    return (
        <div>
            {toShow}
        </div>
    )
}


export default function Meeting () {
    const { meetingCode } = useParams();
    const { data: userData } = useQuery('user', getUserDetails, {
        refetchOnWindowFocus: false
    });
    const { status, data: meetingData } = useQuery(['meeting', userData, meetingCode], () => fetchMeeting(meetingCode), {
        refetchOnWindowFocus: false
    });

    // TODO: to be replaced with better pages for loading...etc
    if (status === 'loading') {
        return <div>working on meeting</div>
    } else if (status === 'error') {
        return <div>An error occurred while fetching meeting</div>
    }

    const meetingNotFound = (() => meetingData && meetingData.hasOwnProperty('message') && meetingData.message === 'Meeting not found')();

    return (
        <div id="vnet-meeting">
            <h2>Welcome to VNET meeting</h2>

            {meetingNotFound? <h3>Could not find the meeting with code "{meetingCode}"</h3>: <MeetingLite meeting={meetingData} user={userData}/>}
        </div>
    )
}