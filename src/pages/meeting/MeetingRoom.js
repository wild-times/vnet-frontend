export default function MeetingRoom (props) {
    const { switchMeeting } = props;

    return (
        <div id="meeting-room">
            <h2>Meeting Room</h2>
            <button onClick={() => switchMeeting(false)}>Leave meeting</button>
        </div>
    )
}