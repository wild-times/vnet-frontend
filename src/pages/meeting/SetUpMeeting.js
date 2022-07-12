export default function SetupMeeting (props) {
    const { switchMeeting } = props;

    return (
        <div id='meeting-setup'>
            <h2>Set up meeting</h2>
            <button onClick={() => switchMeeting(true)}>Join meeting</button>
        </div>
    )
}