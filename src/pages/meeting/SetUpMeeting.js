import { useState, useEffect, useRef } from 'react';
import { LocalVideoStream } from '@azure/communication-calling';

import { MeetingVideo } from './MeetingItems';


function DeviceOption ({ name, index }) {
    return <option value={index}>{name}</option>
}


export default function SetupMeeting (props) {
    const { switchMeeting, meeting, callAgent, deviceManager, setLocalStream, localStream } = props;
    const [cameras, setCameras] = useState([]);
    const [mics, setMics] = useState([]);
    const joinButton = useRef(null);
    const joinText = useRef(null);
    const micOptions = mics.map((mic, i) => <DeviceOption key={i} name={mic.name} index={i} />);
    const cameraOptions = cameras.map((cam, i) => <DeviceOption key={i} name={cam.name} index={i}/>);

    // join call button
    const joinCallEventHandler = () => {
        // join call here
        const callOptions = {
            videoOptions: {localVideoStreams: [localStream]}
        };

        const _call = callAgent.join({
            groupId: meeting['meetingUuid']
        }, callOptions);

        _call.on('stateChanged', () => {
            switch (_call.state) {
                case 'Connecting':
                    joinText.current.innerText = 'Connecting to call';
                    break;

                case 'Connected':
                    switchMeeting(true);
                    break;

                case 'Disconnected':
                    joinText.current.innerText = 'Disconnected from call';
                    break;

                default:
                    break;
            }
        });
    };

    useEffect(() => {
        // load devices and display local stream
        const devices = async () => {
            const _cameras = await deviceManager.getCameras();
            const _mics = await deviceManager.getMicrophones();
            const lStream = new LocalVideoStream(_cameras[0]);
            return [_cameras, _mics, lStream];
        };

        devices().then(([cameras, mics, _localStream]) => {
            setCameras(cameras);
            setMics(mics);
            setLocalStream(_localStream);
        }).catch((e) => console.log(e));

    }, [deviceManager, setLocalStream]);

    useEffect(() => {
        if (cameras.length && mics.length) {
            joinButton.current.disabled = false;
            joinButton.current.addEventListener('click', joinCallEventHandler);
            joinText.current.style.display = 'block';
        }
    }, [cameras, mics, joinButton]);

    const switchCamera = async (switchEvent) => {
        await localStream.switchSource(cameras[switchEvent.target.value]);
    };

    const switchMic = async (switchEvent) => {
        await deviceManager.selectMicrophone(mics[switchEvent.target.value]);
    };

    return (
        <div id='meeting-setup'>
            <h2>Set up meeting</h2>

            <div id='local-stream-preview'>
                <MeetingVideo name={callAgent.displayName} you={true} stream={localStream}/>
            </div>

            <div id='choose-devices'>
                <form>
                    <select onChange={switchCamera}>{cameraOptions}</select>
                    <select onChange={switchMic}>{micOptions}</select>
                </form>
            </div>

            <div className='join-call-options'>
                <span ref={joinText} style={{display: 'none'}}>Waiting to join</span>
                <button ref={joinButton} disabled={true}>Join call</button>
            </div>

        </div>
    )
}