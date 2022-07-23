import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { saveNewMeeting } from "../../utils/req";

// add 0 to numbers below ten: 9 -> 09, 12 -> 12, assumes all numbers are positive
const zeroPen = (num) => num < 10? `0${num.toString()}`: num.toString();


export default function CreateMeeting (props) {
    const { token } = props;
    const navigate = useNavigate();
    const [error, setError] = useState(false);

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
        // get the data
        const f = new FormData(event_.target);
        const meetingData = {};
        [...f.entries()].forEach(([key, entry]) => meetingData[key] = key.match(/time/g)? fDate(entry): entry);
        [...event_.target].forEach((el) => el.disabled = true);

        // save data to the backend
        saveNewMeeting(meetingData, token).then((data) => {
            const _id = data['meetingId'];
            _id? navigate(`/conf/${_id}/`): setError(true);
        }).catch(() => setError(true));
    };

    return (
        <div id='vnet-create-meeting'>
            <h2>Schedule a new meeting</h2>

            {error? <div><p>Error creating meeting, please refresh the page and try again</p></div>: void 0}

            <form onSubmit={createMeetingHandler}>
                <div>
                    <label htmlFor="title-input">Meeting Title</label>
                    <input type="text" name='title' id='title-input' placeholder='Enter title here' required={true}/>
                </div>

                <div>
                    <label htmlFor="notes-input">Meeting notes</label>
                    <textarea name="notes" id="notes-input" cols="30" rows="10" placeholder='Helpful notes about what the meeting is about' required={true}/>
                </div>

                <div>
                    <label htmlFor="start_time-input">Start time</label>
                    <input type="datetime-local" name='start_time' id='start_time-input' required={true}/>
                </div>

                <div>
                    <label htmlFor="start_time-input">End time</label>
                    <input type="datetime-local" name='end_time' id='end_time-input' required={true}/>
                </div>

                <input type="submit" value='Schedule meeting'/>
            </form>
        </div>
    );
}