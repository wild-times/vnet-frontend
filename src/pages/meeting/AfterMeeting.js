import { NavLink } from 'react-router-dom';


export default function LeftMeeting (props) {
    return (
        <div>
            <h2>You have left the meeting</h2>
            <NavLink to={'/'}>Go back home</NavLink>
        </div>
    )
}