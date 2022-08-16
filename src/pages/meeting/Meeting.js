import { useState, useEffect, useRef } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useQuery } from "react-query";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { CallClient } from '@azure/communication-calling';

import MeetingRoom from './MeetingRoom';
import SetupMeeting from './SetUpMeeting';
import LeftMeeting from "./AfterMeeting";
import LoadingScreen from "../home/LoadingScreen";
import { fetchMeeting, getUserDetails } from "../../utils/req";


function MeetingLite (props) {
    const { user, meeting } = props;
    const [inMeeting, inMeetingSwitch] = useState(1); // 1 = set up, 2 = meeting room/in meeting, 3 = left meeting, 4 = poor connection
    const [tokenCredential, setTokenCredential] = useState(null);
    const [callClient, setCallClient] = useState(null);
    const [callAgent, setCallAgent] = useState(null);
    const [deviceManager, setDeviceManager] = useState(null);
    const [devicePermissions, setDevicePermissions] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const callItems = useRef([callClient, callAgent, deviceManager]);

    useEffect(() => {
        callItems.current = [callClient, callAgent, deviceManager];
    }, [callClient, callAgent, deviceManager]);

    useEffect(() => {
        const connectionTimeOutCallBack = () => {
            if (!callItems.current.every(Boolean)) {
                inMeetingSwitch(4); // after 75 seconds and none of the items above, then poor connection detected
            }
        };

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
            setTimeout(connectionTimeOutCallBack, 75000);
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
            if (_args) {
                setTokenCredential(_args[0]);
                setCallClient(_args[1]);
                setCallAgent(_args[2]);
                setDeviceManager(_args[3]);
                setDevicePermissions(_args[4]);
            }
        }).catch((e) => console.error(e));

        return () => {
            clearTimeout(connectionTimeOutCallBack);

            if (inMeeting === 1 && callAgent && !callAgent.disposed) {
                callAgent.dispose();
            }
        };
    }, [meeting, user]);

    const toShow = (() => {
        let comp = <LoadingScreen message={`Preparing to set up ${meeting['title']}`} />;

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

            if (inMeeting === 1) {
                comp = <SetupMeeting {...dep}/>
            } else if (inMeeting === 2) {
                comp = <MeetingRoom {...dep} />
            } else if (inMeeting === 3) {
                comp = <LeftMeeting {...dep} />
            }
        }

        if (inMeeting === 4) {
            comp = <h1 className="center-mix">You seem to have a poor internet connection</h1>
        }

        return comp;
    })();

    return (
        <div>
            {toShow}
        </div>
    )
}


export default function Meeting (props) {
    const { token } = props;
    const { meetingCode } = useParams();
    const { data: userData } = useQuery('user', () => getUserDetails(token), {
        refetchOnWindowFocus: false
    });
    const { status, data: meetingData } = useQuery(['meeting', userData, meetingCode], () => fetchMeeting(meetingCode, userData['authToken']), {
        refetchOnWindowFocus: false
    });

    if (status === 'loading') {
        return <LoadingScreen message='Getting meeting details'/>
    } else if (status === 'error') {
        return (
            <div className="center-mix">
                <h1>Could not load meeting details for "{meetingCode}"</h1>
                <NavLink style={{width: '5em', margin: 'auto'}} to='/' className="wild-buttons">Home</NavLink>
            </div>
        )

    }
    const meetingNotFound = (() => meetingData && meetingData.hasOwnProperty('message') && meetingData.message === 'Meeting not found')();

    return (
        <div id="vnet-meeting">
            {
                meetingNotFound? (
                    <div className="center-mix">
                        <h1>Could not find the meeting with code "{meetingCode}"</h1>
                        <NavLink style={{width: '5em', margin: 'auto'}} to='/' className="wild-buttons">Home</NavLink>
                    </div>
                ): <MeetingLite meeting={meetingData} user={userData}/>
            }
        </div>
    )
}