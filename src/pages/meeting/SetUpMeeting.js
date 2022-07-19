import { useState, useEffect } from 'react';
import { LocalVideoStream } from '@azure/communication-calling';

import { MeetingVideo } from './MeetingItems';


function DeviceOption ({ name, index }) {
    return <option value={index}>{name}</option>
}


export default function SetupMeeting (props) {
    const { switchMeeting, callAgent, deviceManager, setLocalStream, localStream } = props;
    const [cameras, setCameras] = useState([]);
    const [mics, setMics] = useState([]);
    const micOptions = mics.map((mic, i) => <DeviceOption key={i} name={mic.name} index={i} />);
    const cameraOptions = cameras.map((cam, i) => <DeviceOption key={i} name={cam.name} index={i}/>);

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

    }, [deviceManager]);

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

        </div>
    )
}