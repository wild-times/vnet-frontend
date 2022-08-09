import { useState, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';

import { saveNewMeeting } from "../../utils/req";
import { zeroPen } from '../../utils/misc';
import reqData from '../../utils/wild';
import '../style/CreateMeeting.css';


const MILLISECONDS_IN_A_MINUTE = 60000;

export default function CreateMeeting (props) {
    const { token } = props;
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const endTimeInput = useRef(null);

    // format a date for the backend
    const fDate = (dateS) => {
        const entDate = new Date(dateS);
        const timezoneOffset = entDate.getTimezoneOffset() / -60;
        const utcP = timezoneOffset < 0;
        const offHours = parseFloat(timezoneOffset).toFixed(1).toString().split('.').map((t) => {
            const t_ = parseInt(t);
            return zeroPen(t_ < 0? -t_: t_);
        });

        const dt = {
            year: entDate.getFullYear(),
            month: zeroPen(entDate.getMonth()+1),
            day: zeroPen(entDate.getDay()+1),
            hour: zeroPen(entDate.getHours()),
            minute: zeroPen(entDate.getMinutes()),
            seconds: zeroPen(entDate.getSeconds()),
            milliseconds: entDate.getMilliseconds(),
            timezone: `${utcP? '-': '+'}${offHours.join(':')}`
        };

        return `${dt.year}-${dt.month}-${dt.day} ${dt.hour}:${dt.minute}:${dt.seconds}.${dt.milliseconds}${dt.timezone}`;
    };

    // when new meeting is schedules
    const createMeetingHandler = (event_) => {
        event_.preventDefault();
        const f = new FormData(event_.target);
        const joinNow = Boolean(f.get('join-now'));
        const meetingData = {};
        [...f.entries()].forEach(([key, entry]) => meetingData[key] = key.match(/time/g)? fDate(entry): entry);
        [...event_.target].forEach((el) => el.disabled = true);

        const handleMeetingRedirection = (meetingDetails) => {
            const _meetingId = meetingDetails['meetingId'];
            const navUrl = joinNow? `/conf/${_meetingId}/`: `/?show=${_meetingId}`;
            navigate(navUrl);
        };

        // save data to the backend
        saveNewMeeting(meetingData, token).then((data) => {
            data['meetingId']? handleMeetingRedirection(data): setError(true);
        }).catch(() => setError(true));
    };

    if (error) {
        return (
            <div>
                <h1 className='center-mix'>Error creating meeting, please refresh the page and try again</h1>
            </div>
        )
    }

    const stampCalc = (obj) => {
        return `${obj.getFullYear()}-${zeroPen(obj.getMonth()+1)}-${zeroPen(obj.getDate())}T${zeroPen(obj.getHours())}:${zeroPen(obj.getMinutes())}`;
    };

    const maxUpdate = (event_) => {
        const stamp = event_.target.value;
        const newMinDate = new Date(new Date(stamp).getTime() + (MILLISECONDS_IN_A_MINUTE * 10));
        const newMaxDate = new Date(new Date(stamp).getTime() + (MILLISECONDS_IN_A_MINUTE * 45));
        endTimeInput.current.min = stampCalc(newMinDate);
        endTimeInput.current.max = stampCalc(newMaxDate);
    };

    return (
        <div className="create-innerbox">
            <div className="create-topbox" style={{backgroundImage: `url(${reqData.vnetBackgroundLarge})`}}>
                <h1>Create Meeting</h1>
            </div>

            <form id="create-meeting-form" onSubmit={createMeetingHandler}>
                <div>
                    <label htmlFor="meeting-title-input">Meeting title</label>
                    <input autoFocus={true} required type="text" name="title" id="meeting-title-input" placeholder="Meeting discussion..." />
                </div>

                <div>
                    <label htmlFor="notes-input">Meeting notes</label>
                    <textarea required name="notes" id="notes-input" cols="30" rows="5" placeholder="Some notes for what the meeting is about" />
                </div>

                <div className="create-meeting-time">
                    <div>
                        <label htmlFor="start-time-input">Choose a start time</label>
                        <input onChange={maxUpdate} min={stampCalc(new Date())} type="datetime-local" required name="start_time" id="start-time-input" />
                    </div>

                    <div>
                        <label htmlFor="end-time-input">Choose an end time</label>
                        <input min={stampCalc(new Date())} ref={endTimeInput} type="datetime-local" required name="end_time" id="end-time-input" />
                    </div>
                </div>

                <div>
                    <label htmlFor="join-now-check">Join Meeting now</label>
                    <input id='join-now-check' type="checkbox" name='join-now'/>
                </div>

                <hr/>
                <div className="form-btns">
                    <div className="create-form-bt">
                        <input type="submit" value="Create" className="wild-buttons" />
                    </div>
                    <div className="create-form-bt">
                        <NavLink className="wild-buttons" to={'/'}>Cancel</NavLink>
                    </div>
                </div>
            </form>
        </div>
    )
}