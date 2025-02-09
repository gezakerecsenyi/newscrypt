import {useCallback, useEffect, useRef} from "react";

interface Props {
    closeModal: () => void;
}

export default function AuthCheck(
    {
        closeModal
    }: Props
) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const onPlay = useCallback(async () => {

    }, [videoRef]);

    useEffect(() => {
        if (videoRef) {
            navigator
                .mediaDevices
                .getUserMedia({ video: {} })
                .then(stream => {
                    videoRef.current!.srcObject = stream;
                });
        }
    }, [videoRef]);
    
    return (
        <div className='modal face-check-modal'>
            <div className="modal-content">
                <span className="close" onClick={closeModal}>&times;</span>

                <h2>
                    Sign in with your face.
                </h2>

                <video
                    onLoadedMetadata={onPlay}
                    id="inputVideo"
                    autoPlay
                    muted
                    playsInline
                    ref={videoRef}
                ></video>
                <div className='input-block'>
                    <input className='password' type='password' placeholder='Enter or choose your passphrase...'/>
                    <button className='submit'>Submit</button>
                </div>
            </div>
        </div>
    )
}