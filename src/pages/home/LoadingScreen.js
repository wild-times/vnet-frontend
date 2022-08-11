import '../style/Loading.css';

export default function LoadingScreen (props) {
    const { message } = props;

    return (
        <div>
            <div className="spinner-home">
                {message? <h1 className='center-mix'>{ message }</h1>: null}
                <div className="loading-spinner" />
            </div>
        </div>
    )
}