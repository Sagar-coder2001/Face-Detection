import { useRef, useEffect, useState } from 'react';
import './Screen.css';

function Screen({zealid}) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [CapturedFace, setCapturedFace] = useState(null);
    const [captureCount, setCaptureCount] = useState(0);
    const [recapture, setRecapture] = useState(false);
    const [IsModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [faceborder, showfaceborder] = useState(false);
    const [moreface, setMoreface] = useState(false);
    const [base64img, setBase64Image] = useState('')

    useEffect(() => {
        if (videoRef.current) {
            startVideo();
        }
    }, [videoRef]); // Only runs when videoRef is available

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((currentStream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = currentStream; // Set the video stream
                    showfaceborder(true);
                }
            })
            .catch((err) => {
                console.error("Error accessing camera: ", err);
            });
    };

    const handleCaptureClick = () => {
        if (isLoading) return; // Prevent additional clicks while loading

        setIsLoading(true); // Show loader and disable button

        if (captureCount >= 3) {
            alert('You can only capture up to three images.');
            return;
        }

        if (videoRef.current) {
            const videoWidth = videoRef.current.videoWidth;
            const videoHeight = videoRef.current.videoHeight;

            const fullFrameCanvas = document.createElement('canvas');
            fullFrameCanvas.width = videoWidth;
            fullFrameCanvas.height = videoHeight;

            const fullFrameCtx = fullFrameCanvas.getContext('2d');
            fullFrameCtx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);


            fullFrameCanvas.toBlob((blob) => {
                const fullFrameImageFile = new File([blob], 'captured_full_image.png', { type: 'image/png' });

                // const imageUrl = URL.createObjectURL(fullFrameImageFile);
                // setCapturedFace(imageUrl);

                const formData = new FormData();
                formData.append('Subject_id', zealid);
                formData.append('file', fullFrameImageFile,); // Attach the image file

                fetch(`http://192.168.1.25/Zeal_Event/API/kairos.php`, {
                    method: "POST",
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log("Response data", data);

                        if (data.Response.face_id) {
                            setMoreface(true);
                            setCaptureCount(prevCount => {
                                const newCount = prevCount + 1;
                                if (newCount === 1) {
                                    setCaptureCount(1);

                                } else if (newCount === 2) {
                                    setCaptureCount(2);

                                } else if (newCount === 3) {
                                    setCaptureCount(3);
                                }
                                return newCount;
                            });
                        } else if (!data.Response.face_id) {
                            setRecapture(true);
                        }
                    })
                    .catch(error => console.error('An error occurred:', error))
                    .finally(() => {
                        setIsLoading(false);
                    });
            }, 'image/png');
        }
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
                    ) : !isLoading &&(
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                crossOrigin="anonymous"
                                style={{ transform: 'scaleX(-1)' }}
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
