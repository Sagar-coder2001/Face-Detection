import './LoginForm.css'
import Data from '../Components/Data.json';
import { useState } from 'react';
import Screen from './Screen';

const LoginForm = () => {
  const [userdetails, setUserDetails] = useState({
    fname: '',
    lname: '',
    mobileno: '',
    email: ''
  })
  const [nameError, setNameError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submited, setSubmited] = useState(false)
  const [modal, Setshowmodal] = useState(false)
  const [userexists, setUserExistsError] = useState('')


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
    if (name === 'mobileno') validateMobile(value);
    if (name === 'email') validateEmail(value);
  };

  const formSubmit = async (e) => {
    e.preventDefault();

    const isNameValid = validateName(userdetails.fname);
    const isMobileValid = validateMobile(userdetails.mobileno);
    const isEmailValid = validateEmail(userdetails.email);

    if (isNameValid && isMobileValid && isEmailValid) {
      try {
        const formData = new FormData();
        formData.append('first_name', userdetails.fname);
        formData.append('last_name', userdetails.lname);
        formData.append('contact', userdetails.mobileno);
        formData.append('email', userdetails.email);
        formData.append('eid', 'test');
        formData.append('type', 'val');

        const response = await fetch('http://192.168.1.25/Zeal_Event/API/index.php', {
          method: 'POST',
          body: formData, // FormData automatically sets the correct content type
        });

        const data = await response.json();
        console.log('Response data:', data);

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


  return (
    <>
      <div>
        {/* login htmlForm start here  */}
        <div style={{ backgroundImage: `url(${Data.leftlogo})` }}>

        </div>

        {
          !userexists && !modal && !submited && (
            <div className="container" style={{ backgroundImage: `url(${Data.bgimg})` }}>
              <div>
                <form className='row'>
                  <h3 className='text-center'>Facial Form</h3>
                  <div className="mb-3 col-md-12">
                    <label htmlFor="fname" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="f-name" name='fname' onChange={handleChange} />
                    {nameError && <span className="error">{nameError}</span>}
                  </div>
                  <div className="mb-3 col-md-12">
                    <label htmlFor="l-name" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="lname" name='lname' onChange={handleChange} />
                  </div>
                  <div className="mb-3 col-md-12">
                    <label htmlFor="mobile-no" className="form-label">Mobile No</label>
                    <input type="tel" className="form-control" id="mobileno" name='mobileno' onChange={handleChange} />
                    {mobileError && <span className="error">{mobileError}</span>}
                  </div>
                  <div className="mb-3 col-md-12">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email" name='email' onChange={handleChange} />
                    {emailError && <span className="error">{emailError}</span>}
                  </div>
                  <button type="submit" className="btn btn-primary text-center" onClick={formSubmit}>Submit</button>
                </form>
              </div>
            </div>
          )
        }

        {/* user already exists */}
        {
          userexists && (
            <>
              <div className="modal">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Modal title</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <p>{userexists}</p>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                      <button type="button" className="btn btn-primary">Save changes</button>
                    </div>
                  </div>
                </div>
              </div>

            </>
          )
        }

        {
          modal && (
            <>
              <div>consent</div>
              <button onClick={handleConfirm}>Ok</button>
            </>
          )
        }

        {
          submited && (
            <>
              <Screen userdetails={userdetails} />
            </>
          )
        }

      </div>
    </>
  )
}

export default LoginForm
