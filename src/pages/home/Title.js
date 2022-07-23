export default function Title (props) {
    const { user } = props;

    return (
        <div id="vnet-title">
            <h1>This is VNET Calling Page ({user.username})</h1>
        </div>
    )
}