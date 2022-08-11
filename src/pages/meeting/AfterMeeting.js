import { NavLink } from 'react-router-dom';


export default function LeftMeeting (props) {
    const { meeting } = props;
    return (
        <div className='center-mix'>
            <h1>You have left the meeting "{ meeting.title }"</h1>
            <NavLink style={{width: '30%', margin: 'auto'}} className='wild-buttons' to={'/'}>Go back home</NavLink>
        </div>
    )
}