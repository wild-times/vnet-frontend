import { useState, useEffect, useRef } from 'react';
import { VideoStreamRenderer } from '@azure/communication-calling';


export function MeetingVideo (props) {
    const { you, name, stream } = props;
    const finalName = `${name}${you? ' (you)': ''}`;
    const [view, setView] = useState(null);

    useEffect(() => {
        let render;
        if (stream) {
            render = new VideoStreamRenderer(stream);
            render.createView().then((el) => setView(el));
        }

        return () => render && render.dispose? render.dispose(): void 0;
    }, [stream]);

    if (!view) {
        return <div>Loading preview...</div>
    }

    return (
        <div className='video_box video-stream'>
            <div className='video-stream-home' id={name} ref={ref => ref? ref.appendChild(view.target): void 0} />
            <p className="stream-name">{finalName}</p>
        </div>
    )
}


export function MeetingPeerVideo (props) {
    const { stream, name } = props;
    const videoElement = useRef(null);

    useEffect(() => {
        videoElement.current.srcObject = stream;
    });

    return (
        <div className='peer-video-stream'>
            <div className='peer-video-stream-home' id={`peer-${name}`}>
                <div>
                    <video autoPlay={true} ref={videoElement}/>
                </div>
            </div>
            <span>{name}</span>
        </div>
    )
}