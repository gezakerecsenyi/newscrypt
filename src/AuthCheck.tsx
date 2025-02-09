import {useCallback, useEffect, useRef, useState} from "react";
import * as faceapi from 'face-api.js';
import {generateHyperplanes, LSH} from "./encryptLSH";
import {User} from "./types";

interface Props {
    closeModal: () => void;
    authState?: [User | null, (state: User | null) => void]
}

async function sha256(message: string) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AuthCheck(
    {
        closeModal,
        authState,
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

        if (!videoEl || !canvas || videoEl.paused || videoEl.ended || !faceapi.nets.tinyFaceDetector.params) {
            setTimeout(() => onPlay());
            return;
        }

        const options = new faceapi.TinyFaceDetectorOptions({inputSize: 32 * 8, scoreThreshold: 0.2});
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
                .getUserMedia({video: {}})
                .then(stream => {
                    videoRef.current!.srcObject = stream;
                });
        }
    }, [videoRef]);

    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [showUsernamePage, setShowUsernamePage] = useState(false);
    const [faceHash, setFaceHash] = useState<string | null>(null);
    const handleSubmit = useCallback(async () => {
        setLoading(true);
        setError(false);

        const videoEl = videoRef.current;
        const canvas = canvasRef.current;
        if (!videoEl || !canvas || videoEl.paused || videoEl.ended || !faceapi.nets.tinyFaceDetector.params || currentSuccess < 0.75) {
            return;
        }

        const options = new faceapi.TinyFaceDetectorOptions({inputSize: 32 * 8, scoreThreshold: 0.75});
        const result = await faceapi.detectSingleFace(videoEl, options);

        if (!result) {
            setCurrentSuccess(0.05);
            return;
        }

        const faces = await faceapi.extractFaces(faceapi.createCanvasFromMedia(videoEl), [result]);
        const descriptor = await faceapi.computeFaceDescriptor(faces[0]);

        const hyperplanes = generateHyperplanes(16, 12345);
        const lsh = new LSH(hyperplanes);
        const bin = lsh.hash(descriptor as Float32Array);

        const digest = await sha256(`${password}_${bin}`);
        setFaceHash(digest);

        const resp = await (await fetch(
            '/auth',
            {
                method: 'POST',
                body: JSON.stringify(
                    {
                        password,
                        faceHash: digest,
                    }
                )
            }
        )).json();

        setLoading(false);
        if (resp.success && authState) {
            authState[1](resp.user);
        } else if (resp.userExists) {
            setPassword('');
            setError(true);
        } else {
            setShowUsernamePage(true);
        }
    }, [videoRef, currentSuccess, videoRef, canvasRef, password]);

    const [noSubmit, setNoSubmit] = useState(false);
    useEffect(() => {
        const videoEl = videoRef.current;
        const canvas = canvasRef.current;

        if (
            showUsernamePage ? (
                username.length <= 4 ||
                username.length >= 16 ||
                !username.match(/^[a-zA-Z0-9_\-!]$/g)
            ) : (
                !videoEl ||
                !canvas ||
                videoEl.paused ||
                videoEl.ended ||
                !faceapi.nets.tinyFaceDetector.params ||
                currentSuccess < 0.75 ||
                password.length < 8
            )
        ) {
            setNoSubmit(true);
        } else {
            setNoSubmit(false);
        }
    }, [videoRef, canvasRef, currentSuccess, showUsernamePage]);

    const currentLevel = currentSuccess > 0.4 ? currentSuccess > 0.75 ? 2 : 1 : 0;

    const [username, setUsername] = useState('');
    const submitUsername = useCallback(async () => {
        setError(false);
        setLoading(true);

        if (username.length > 4 && username.length < 16 && username.match(/^[a-zA-Z0-9_\-!]$/g)) {
            const resp = await (await fetch(
                '/create',
                {
                    method: 'POST',
                    body: JSON.stringify(
                        {
                            password,
                            faceHash,
                            username
                        }
                    )
                }
            )).json();

            setLoading(false);
            if (resp.success && authState) {
                authState[1](resp.user);
                closeModal();
            } else {
                setUsername('');
                setError(true);
            }
        }
    }, [username, faceHash]);

    return (
        <div className='modal face-check-modal'>
            <div className="modal-content">
                <span className="close" onClick={closeModal}>&times;</span>

                {
                    showUsernamePage ? (
                        <>
                            <h2>
                                Welcome! Choose your display name.
                            </h2>

                            <p>
                                Choose any name you feel comfortable using publicly.
                            </p>

                            <div className='input-block'>
                                <input
                                    className={error ? 'error' : ''}
                                    placeholder='Enter your username.'
                                    value={username}
                                    onInput={(e) => setUsername(e.currentTarget.value)}
                                    disabled={loading}
                                />
                                <button
                                    className='submit'
                                    onClick={submitUsername}
                                    disabled={loading || noSubmit}
                                >
                                    Submit
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
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
                                <canvas id="overlay" ref={canvasRef}/>
                                <div
                                    className={`success-bar level-${currentLevel}`}
                                    style={{
                                        width: `${Math.round(currentSuccess * 8) / 8 * 100}%`,
                                        backgroundColor: currentLevel === 2 ?
                                                         '#1c5e13' :
                                                         currentLevel === 1 ?
                                                         '#c56700' :
                                                         '#790000'
                                    }}
                                ></div>
                            </div>

                            <div className='input-block'>
                                <input
                                    className={error ? 'error' : ''}
                                    type='password'
                                    placeholder='Enter or choose your passphrase...'
                                    value={password}
                                    onInput={(e) => setPassword(e.currentTarget.value)}
                                    disabled={loading}
                                />
                                <button
                                    className='submit'
                                    onClick={handleSubmit}
                                    disabled={loading || noSubmit}
                                >
                                    Submit
                                </button>
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    )
}