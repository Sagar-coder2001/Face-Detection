import { useRef, useEffect, useState } from 'react';
import './Screen.css';
import Webcam from 'react-webcam';

function Screen() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const [CapturedFace, setCapturedFace] = useState(null);
    const [captureCount, setCaptureCount] = useState(0);
    const [recapture, setRecapture] = useState(false);
    const [facingMode, setFacingMode] = useState('user');
    const [isMirrored, setIsMirrored] = useState(true);
    const [IsModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [faceborder, showfaceborder] = useState(false);
    const [moreface, setMoreface] = useState(false);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: facingMode, audio: false }).catch((err) => {
            alert('Error accessing the camera. Please allow camera access.');
            console.error('Error accessing the camera:', err);
        });
        showfaceborder(true);
    }, [facingMode]);

    const handleCaptureClick = () => {
        if (isLoading) return; // Prevent additional clicks while loading

        setIsLoading(true); // Show loader and disable button

        if (captureCount >= 3) {
            alert('You can only capture up to three images.');
            return;
        }

        const imageSrc = webcamRef.current.getScreenshot();
        const video = webcamRef.current.video;

        // Set the canvas size to match the video dimensions
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;

        const context = canvasRef.current.getContext('2d');
        const img = new Image();

        // Load the image source and draw it on the canvas
        img.onload = () => {
            context.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);

            // Convert the canvas content to a data URL and set it as the captured image
            const dataUrl = canvasRef.current.toDataURL('image/png');
            setCapturedFace(dataUrl);
            console.log(CapturedFace);
            setCaptureCount(prevCount => prevCount + 1);
        };
        img.src = imageSrc;

        // Convert the canvas content to a Blob
        canvasRef.current.toBlob((blob) => {
            const fullFrameImageFile = new File([blob], 'captured_full_image.png', { type: 'image/png' });

            const formData = new FormData();
            formData.append('Subject_id', '3434343434343343');
            formData.append('file', fullFrameImageFile);

            fetch('http://192.168.1.25/Zeal_Event/API/kairos.php', {
                method: "POST",
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Response data", data);
                    if (data.status === 'success' && data.faces && data.faces.length > 0) {
                        setMoreface(true);
                        setCaptureCount(prevCount => {
                            const newCount = prevCount + 1;
                            if (newCount === 3) {
                                // Handle completion of three captures
                            }
                            return newCount;
                        });
                    } else if (data.status === 'failure') {
                        setRecapture(true);
                    }
                })
                .catch(error => console.error('An error occurred:', error))
                .finally(() => {
                    setIsLoading(false);
                });
        }, 'image/png');
    };

    return (
        <div className="myapp">
            <div className='username'>
                <h1>Face Detection</h1>
                <p>sagar shinde</p>
            </div>

            {!IsModalVisible && (
                <div className="appvide">
                    {isLoading ? (
                        CapturedFace && <img src={CapturedFace} alt="Captured face" style={{ transform: 'scaleX(-1)' }} />
                    ) : (
                        <>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/png"
                                videoConstraints={{ facingMode }}
                                className="video-element"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    transform: isMirrored ? 'scaleX(-1)' : 'scaleX(1)',
                                }}
                            />
                            <canvas ref={canvasRef} className="appcanvas" />
                            {faceborder && (
                                <div className='face-border'>
                                    <svg width="200" height="250">
                                        <circle cx="200" cy="225" r="280" />
                                    </svg>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {!IsModalVisible && (
                <div className="capturebtn">
                    <button onClick={handleCaptureClick} disabled={isLoading}>
                        {isLoading ? <div><span></span>Capturing...</div> : 'Capture'}
                    </button>
                </div>
            )}

            {IsModalVisible && (
                <div className="showmassageface">
                    <h2><span>Congratulations!</span> Thank you for your response....</h2>
                </div>
            )}

            {isLoading && <div className="loader"></div>}

            {moreface && (
                <div className='modal-capture'>
                    <h3><span>Congratulations!!</span> Your face image {captureCount} is stored successfully </h3>
                    <button onClick={() => setMoreface(false)}>Ok</button>
                </div>
            )}

            {recapture && !isLoading && (
                <div className='showrecapture'>
                    <h3>Your face is not captured properly. Please recapture again.</h3>
                    <button onClick={() => setRecapture(false)}>Recapture</button>
                </div>
            )}
        </div>
    );
}

export default Screen;
