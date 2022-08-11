import { useState, useEffect, useRef } from 'react';
import { NavLink } from "react-router-dom";
import { LocalVideoStream } from '@azure/communication-calling';
import { MeetingVideo } from './MeetingItems';
import '../style/SetUpRoom.css';


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
                        switchMeeting(2);
                        break;

                    default:
                        break;
                }
            });
        };

        if (cameras.length && mics.length && joinButton.current) {
            joinButton.current.disabled = false;
            joinButton.current.addEventListener('click', joinCallEventHandler);
            joinText.current.style.display = 'block';
        }
    }, [cameras, mics, joinButton, callAgent, localStream, meeting, switchMeeting]);

    const switchCamera = async (switchEvent) => {
        await localStream.switchSource(cameras[switchEvent.target.value]);
    };

    const switchMic = async (switchEvent) => {
        await deviceManager.selectMicrophone(mics[switchEvent.target.value]);
    };

    return (
        <div className="main-setup">
            <h1>Set up to join: {meeting.title}</h1>
            <div className="set-up">
                <div className="camera_check">
                    <MeetingVideo apprName={'video_box'} name={callAgent.displayName} you={true} stream={localStream}/>
                    <hr />

                    <div className="setup-devices">
                        <div>
                            <label htmlFor="cameras">Select camera</label>
                            <select onChange={switchCamera} id="cameras">{cameraOptions}</select>
                        </div>

                        <div>
                            <label htmlFor="mics">Select microphone</label>
                            <select onChange={switchMic} id="mics">{micOptions}</select>
                        </div>
                    </div>
                </div>

                <div className="user_ready">
                    <div className="user_ready_details">
                        <h1 ref={joinText} style={{display: 'none'}}>Ready To Join</h1>
                        <h2 className='center-mix'>{meeting['meetingId']}</h2>
                        <div className="alert">
                            <p>{meeting['notes']}</p>
                        </div>

                        <div className="setup-buttons-div">
                            <div>
                                <button ref={joinButton} disabled={true} className="wild-buttons">Proceed to Meeting</button>
                            </div>
                            <div>
                                <NavLink className="wild-buttons" to='/'>Cancel</NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}