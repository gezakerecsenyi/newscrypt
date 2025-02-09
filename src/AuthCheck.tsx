import {useCallback, useEffect, useRef, useState} from "react";
import * as faceapi from 'face-api.js';
import lsh from "@agtabesh/lsh";

interface Props {
    closeModal: () => void;
}

export default function AuthCheck(
    {
        closeModal
    }: Props
) {
    useEffect(() => {
        faceapi.nets.tinyFaceDetector.loadFromUri('/');
        faceapi.nets.faceRecognitionNet.loadFromUri('/');
    }, []);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentSuccess, setCurrentSuccess] = useState(0)
    const onPlay = useCallback(async (): Promise<void> => {
        const videoEl = videoRef.current;
        const canvas = canvasRef.current;

        if(!videoEl || !canvas || videoEl.paused || videoEl.ended || !faceapi.nets.tinyFaceDetector.params) {
            setTimeout(() => onPlay());
            return;
        }

        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 32 * 8, scoreThreshold: 0.2 });
        const result = await faceapi.detectSingleFace(videoEl, options);

        /*if (result) {
            const dims = faceapi.matchDimensions(canvas, videoEl, true);
            faceapi.draw.drawDetections(canvas, faceapi.resizeResults(result, dims))
        } else {
            canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
        }*/

        if (result) {
            setCurrentSuccess(result.classScore);
        } else {
            setCurrentSuccess(0.05);
        }

        setTimeout(() => onPlay())
    }, [videoRef]);

    const [loading, setLoading] = useState(false);
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

    const [password, setPassword] = useState('');
    const handleSubmit = useCallback(async () => {
        setLoading(true);

        const videoEl = videoRef.current;
        const canvas = canvasRef.current;
        if (!videoEl || !canvas || videoEl.paused || videoEl.ended || !faceapi.nets.tinyFaceDetector.params || currentSuccess < 0.75) {
            return;
        }

        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 32 * 8, scoreThreshold: 0.75 });
        const result = await faceapi.detectSingleFace(videoEl, options);

        if (!result) {
            setCurrentSuccess(0.05);
            return;
        }

        const faces = await faceapi.extractFaces(faceapi.createCanvasFromMedia(videoEl), [result]);
        const descriptor = await faceapi.computeFaceDescriptor(faces[0]);



        setLoading(false);
    }, [videoRef, currentSuccess, videoRef, canvasRef]);

    const [noSubmit, setNoSubmit] = useState(false);
    useEffect(() => {
        const videoEl = videoRef.current;
        const canvas = canvasRef.current;

        if (!videoEl || !canvas || videoEl.paused || videoEl.ended || !faceapi.nets.tinyFaceDetector.params || currentSuccess < 0.75) {
            setNoSubmit(true);
        } else {
            setNoSubmit(false);
        }
    }, [videoRef, canvasRef, currentSuccess]);

    const currentLevel = currentSuccess > 0.4 ? currentSuccess > 0.75 ? 2 : 1 : 0;

    return (
        <div className='modal face-check-modal'>
            <div className="modal-content">
                <span className="close" onClick={closeModal}>&times;</span>

                <h2>
                    Sign in with your face.
                </h2>

                <div className='video-container'>
                    <video
                        onLoadedMetadata={onPlay}
                        id="inputVideo"
                        autoPlay
                        muted
                        playsInline
                        ref={videoRef}
                    ></video>
                    <canvas id="overlay" ref={canvasRef} />
                    <div
                        className={`success-bar level-${currentLevel}`}
                        style={{
                            width: `${Math.round(currentSuccess * 8) / 8 * 100}%`,
                            backgroundColor: currentLevel === 2 ? '#1c5e13' : currentLevel === 1 ? '#c56700' : '#790000'
                        }}
                    ></div>
                </div>

                <div className='input-block'>
                    <input
                        className='password'
                        type='password'
                        placeholder='Enter or choose your passphrase...'
                        value={password}
                        onInput={(e) => setPassword(e.currentTarget.value)}
                        disabled={loading}
                    />
                    <button className='submit' onClick={handleSubmit} disabled={loading || noSubmit}>Submit</button>
                </div>
            </div>
        </div>
    )
}