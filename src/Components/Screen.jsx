import { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import Data from '../Components/Data.json';
import './Screen.css';

let eid = `${Data.eid}`;

function Screen({ userdetails, zealid }) {

    const webcamRef = useRef();
    const canvasRef = useRef();
    const [CapturedFace, setCapturedFace] = useState(null);
    const [captureCount, setCaptureCount] = useState(0);
    const [uuid1, setUuid1] = useState(null);
    const [uuid2, setUuid2] = useState(null);
    const [uuid3, setUuid3] = useState(null);
    const [recapture, setRecapture] = useState(false);
    const [IsModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [faceborder, showfaceborder] = useState(false);
    const [moreface, setMoreface] = useState(false);
    const [qrimg, setQrimg] = useState('');

    useEffect(() => {
        showfaceborder(true);
    })

    const handleCaptureClick = () => {
        if (isLoading) return; // Prevent additional clicks while loading

        setIsLoading(true); // Show loader and disable button

        if (captureCount >= 3) {
            alert('You can only capture up to three images.');
            return;
        }

        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setCapturedFace(imageSrc);

            // Convert data URL to blob
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const fullFrameImageFile = new File([blob], 'captured_full_image.png', { type: 'image/png' });
                    const files = {
                        "photos": fullFrameImageFile,
                    };
                    const data = {
                        "zeal_id": zealid,
                        "event_id": eid
                    }

                    const url = " http://192.168.1.25/Zeal_Event/API/enrollPerson.php";
                    const formData = new FormData();
                    Object.keys(files).forEach(key => formData.append(key, files[key]));
                    Object.keys(data).forEach(key => formData.append(key, data[key]));


                    fetch(url, {
                        method: "POST",
                        body: formData
                    })
                        .then(response => response.json())
                        .then(data => {
                            console.log("Response data", data);
                            if (data.status === 'success' && data.faces && data.faces.length > 0) {
                                setIsLoading(false);
                                const newUuid = data.uuid;
                                setMoreface(true);
                                setCaptureCount(prevCount => {
                                    const newCount = prevCount + 1;
                                    if (newCount === 1) {
                                        setUuid1(newUuid);
                                        console.log('UUID 1:', newUuid);
                                    } else if (newCount === 2) {
                                        setUuid2(newUuid);
                                        console.log('UUID 2:', newUuid);
                                    } else if (newCount === 3) {
                                        setUuid3(newUuid);
                                        console.log('UUID 3:', newUuid);
                                    }
                                    return newCount;
                                });
                            } else if (data.response.status === 'failure') {
                                setIsLoading(false);
                                setRecapture(true);
                            }
                        })
                        .catch(error => console.error('An error occurred:', error))
                        .finally(() => {
                            setIsLoading(false);
                        });
                });
        }
    };

    useEffect(() => {
        if (zealid && uuid1 && uuid2 && uuid3) {
            const eid = `${Data.eid}`;
            const finalUrl = ` http://192.168.1.25/Zeal_Event/API/register.php`;
            const formData = new FormData();
            formData.append('first_name', userdetails.fname);
            formData.append('last_name', userdetails.lname);
            formData.append('contact', userdetails.mobileno);
            formData.append('email', userdetails.email);
            formData.append('zeal_id', zealid);
            formData.append('eid', eid);
            formData.append('type', 'str');
            formData.append('uuid1', uuid1);
            formData.append('uuid2', uuid2);
            formData.append('uuid3', uuid3);

            fetch(finalUrl, {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(finalData => {
                    console.log('Final API Response:', finalData);
                    setQrimg(finalData.QR_FilePath);
                    if (finalData.Store == true) {
                        setIsModalVisible(true);
                    }
                })
                .catch(error => console.error('Error posting final data:', error));
        }
    }, [zealid, uuid1, uuid2, uuid3]);


    const downloadQr = () => {
        if (qrimg) {
            const link = document.createElement('a');
            link.href = `http://192.168.1.25/Zeal_Event/API/${qrimg}`;
            link.download = 'qrcode.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    const shareQRCode = () => {
        // const qrcodeimg = generateQRCode();
        if (navigator.share) {
            fetch(`http://192.168.1.25/Zeal_Event/API/${qrimg}`)
                .then((res) => res.blob())
                .then((blob) => {
                    navigator.share({
                        title: 'My Zeal ID QR Code',
                        files: [new File([blob], 'qrcode.png', { type: 'image/png' })],
                    })
                        .then(() => console.log('QR code shared successfully!'))
                        .catch((error) => console.error('Error sharing QR code:', error));
                })
                .catch((error) => console.error('Error creating QR code file:', error));
        } else if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
            // const whatsappUrl = `https://wa.me/?te=${encodeURIComponent('Here is your QR code: ' + qrimg)}`;
            // window.open(whatsappUrl, '_blank');
            setShowShareButtons(true);
        }
    };

    return (
        <>
            <div className="myapp">
                <div className='username'>
                    <h1>Face Detection</h1>
                    <p>{userdetails.fname}</p>
                </div>

                {!IsModalVisible && (
                    <div className="appvide">
                        {isLoading ? (
                            CapturedFace && <img src={CapturedFace} alt="Captured face" style={{ transform: 'scaleX(-1)' }} />
                        ) : !isLoading && (
                            <>
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/png"
                                    videoConstraints={{ facingMode: "user" }}
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
                            {isLoading ? (
                                <div>
                                    <span></span>Capturing...
                                </div>
                            ) : 'Capture'}
                        </button>
                    </div>
                )}

                {IsModalVisible && (
                    <div className="showmassageface text-center">
                        <h2 className='text-success'><span>Congratulations!</span> Thank you for your response...</h2>
                        <img src={` http://192.168.1.25/Zeal_Event/API/${qrimg}`} style={{ width: '150px', height: '150px' }} alt="QRCode " />
                        <div className="btn-container">
                            <button className='btn btn-info' onClick={downloadQr}>Download</button>
                            <button className='btn btn-info' onClick={shareQRCode}>Share</button>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="loader"></div>
                )}

                {moreface && (
                    <div className='modal-capture'>
                        <h3><span>Congratulations!!</span> Your face {captureCount} image is stored successfully</h3>
                        <button onClick={() => setMoreface(false)}>OK</button>
                    </div>
                )}

                {recapture && !isLoading && (
                    <div className='showrecapture'>
                        <h3>Your face was not captured properly, please recapture again</h3>
                        <button onClick={() => setRecapture(false)}>Recapture</button>
                    </div>
                )}
            </div>
        </>
    );
}

export default Screen;
