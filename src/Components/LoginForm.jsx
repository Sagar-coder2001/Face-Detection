import './LoginForm.css'
import Data from '../Components/Data.json';
import { useState } from 'react';
import Screen1 from './Screen';

let leftlogo = `${Data.leftlogo}`

const LoginForm = () => {
  const [userdetails, setUserDetails] = useState({
    fname: '',
    lname: '',
    mobileno: '',
    email: ''
  })
  const [nameError, setNameError] = useState('');
  const [LastnameError, setLastNameError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submited, setSubmited] = useState(false)
  const [modal, Setshowmodal] = useState(false)
  const [userexists, setUserExistsError] = useState('')
  const [zealid, setZealid] = useState('')
  const [qrimg, setQrimg] = useState('')
  const [IsModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false)


  // Validate user inputs
  const validateName = (name) => {
    if (name.length < 2) {
      setNameError('Please enter the valid name.');
      return false;
    } else {
      setNameError('');
      return true;
    }
  };

  const validateLastName = (lname) => {
    if (lname.length < 2) {
      setLastNameError('Please enter a valid last name.');
      return false;
    } else {
      setLastNameError('');
      return true;
    }
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      setMobileError('Please enter a valid mobile number.');
      return false;
    } else {
      setMobileError('');
      return true;
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value
    }));
    if (name === 'fname') validateName(value);
    if (name === 'lname') validateLastName(value); // Validate last name
    if (name === 'mobileno') validateMobile(value);
    if (name === 'email') validateEmail(value);
  };

  const formSubmit = async (e) => {

    e.preventDefault();

    const isNameValid = validateName(userdetails.fname);
    const isLastNameValid = validateLastName(userdetails.lname);
    const isMobileValid = validateMobile(userdetails.mobileno);
    const isEmailValid = validateEmail(userdetails.email);

    if (isNameValid && isLastNameValid && isMobileValid && isEmailValid) {
      try {
        const eid = `${Data.eid}`;
        const formData = new FormData();
        formData.append('first_name', userdetails.fname);
        formData.append('last_name', userdetails.lname);
        formData.append('contact', userdetails.mobileno);
        formData.append('email', userdetails.email);
        formData.append('eid', eid);
        formData.append('type', 'val');

        const response = await fetch('https://www.eventsapp.co.in/registration/API/register.php', {
          method: 'POST',
          body: formData, // FormData automatically sets the correct content type
        });

        const data = await response.json();
        console.log('Response data:', data);
        setZealid(data.Zeal_id);
        console.log(data)

        if (data.Exists === true) {
          // Show error if user already exists
          setUserExistsError('User with this email and mobile already exists. Please use different credentials.');
          Setshowmodal(false); // Ensure modal is closed
        } else {
          // Proceed if user does not exist
          Setshowmodal(true); // Show confirmation modal

        }

      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  const handleConfirm = () => {
    setSubmited(true);
    Setshowmodal(false)
  }


  const normalRegister = async () => {
    setIsLoading(true);
    try {
      const eid = `${Data.eid}`;
      const formData = new FormData();
      formData.append('first_name', userdetails.fname);
      formData.append('last_name', userdetails.lname);
      formData.append('contact', userdetails.mobileno);
      formData.append('email', userdetails.email);
      formData.append('eid', eid);
      formData.append('type', 'all');

      const response = await fetch('http://192.168.1.25/Zeal_Event/API/register.php', {
        method: 'POST',
        body: formData, // FormData automatically sets the correct content type
      });

      const data = await response.json();
      console.log('Response data:', data);
      setZealid(data.Zeal_id);
      console.log(data)
      setQrimg(data.QR_FilePath);
      if (data.Store === true) {
        setIsModalVisible(true);
        setIsLoading(false);
      }

    } catch (error) {
      console.error('Error:', error);
    }
  }
  const showform = () => {
    setUserExistsError(false);
  }


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
      <div>
        <div className="logo-container" style={{ backgroundImage: `url(${Data.backgroundImage})` }}>
          <img src={leftlogo} />
          {
            !userexists && !modal && !submited && (
              <div className="card ms-3 col-12 col-sm-10 col-md-8 col-lg-6">
                <form className="row card-body">
                  <h3 className="text-center">Facial Form</h3>
                  <div className="mb-3 col-md-12">
                    <label htmlFor="fname" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="f-name" name="fname" onChange={handleChange} />
                    {nameError && <span className="error text-danger">{nameError}</span>}
                  </div>
                  <div className="mb-3 col-md-12">
                    <label htmlFor="l-name" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="lname" name="lname" onChange={handleChange} />
                    {LastnameError && <span className="error text-danger">{LastnameError}</span>}
                  </div>
                  <div className="mb-3 col-md-12">
                    <label htmlFor="mobile-no" className="form-label">Mobile No</label>
                    <input type="tel" className="form-control" id="mobileno" name="mobileno" onChange={handleChange} />
                    {mobileError && <span className="error text-danger">{mobileError}</span>}
                  </div>
                  <div className="mb-3 col-md-12">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email" name="email" onChange={handleChange} />
                    {emailError && <span className="error text-danger">{emailError}</span>}
                  </div>
                  <div className="mb-2 col-md-12 text-center">
                    <button type="submit" className="btn btn-info text-center col-6" onClick={formSubmit}>Submit</button>
                  </div>
                </form>
              </div>
            )
          }
        </div>


        {/* user already exists */}

        {
          userexists && (
            <>
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Error!</strong> Your Email and Mobile No are Already Used.
                <div className="user-existsbtn text-center">
                  <button type="button" className="btn btn-danger mt-2" onClick={showform}>Ok</button>
                </div>
              </div>
            </>
          )
        }

        {
          modal && !IsModalVisible && (
            <div className='modal-container'>
              <h2>We would like your permission to take your photo for Registration. Do you consent to this?</h2>
              <div className="btn-container">
                <button onClick={handleConfirm} className='btn btn-info'>ok</button>
                <button onClick={normalRegister} className='btn btn-info'>cancel</button>
              </div>
            </div>

          )
        }

        {IsModalVisible && (
          <div className="modal-container text-center">
            <h2 className='text-success'><span>Congratulations!</span> Thank you for your response...</h2>
            <img src={` http://192.168.1.25/Zeal_Event/API/${qrimg}`} style={{ width: '150px', height: '150px' }} alt="QRCode " />
            <div className="btn-container">
              <button className='btn btn-info' onClick={downloadQr}>Download</button>
              <button className='btn btn-info' onClick={shareQRCode}>Share</button>
            </div>
          </div>
        )}

        {
          isLoading && (
            <div className="loader"></div>
          )
        }

        {
          submited && (
            <>
              <Screen1 userdetails={userdetails} zealid={zealid} />
            </>
          )
        }

      </div>
    </>
  )
}

export default LoginForm
