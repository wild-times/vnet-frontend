import { useState, useEffect } from 'react';
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
        <div className='video-stream' id={stream['id']}>
            <div id='video-stream-home' ref={ref => ref? ref.appendChild(view.target): void 0} />
            <span>{finalName}</span>
        </div>
    )
}