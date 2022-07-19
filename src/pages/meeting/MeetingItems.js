import { useState, useEffect } from 'react';
import { VideoStreamRenderer } from '@azure/communication-calling';


export function MeetingVideo (props) {
    const { you, name, stream } = props;
    const finalName = `${name}${you? ' (you)': ''}`;
    const [view, setView] = useState(null);

    useEffect(() => {
        if (stream) {
            const render = new VideoStreamRenderer(stream);
            render.createView().then((el) => setView(el));
        }
    }, [stream]);

    if (!view) {
        return <div>Loading preview...</div>
    }

    return (
        <div className='video-stream' id={stream['id']}>
            <div id='video-stream-home' ref={ref => ref.appendChild(view.target)} />
            <span>{finalName}</span>
        </div>
    )
}