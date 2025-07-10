import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const schema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().matches(/^[0-9]{10}$/, 'Invalid phone number'),
  dob: yup.date().required('Date of birth is required'),
  street: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  pinCode: yup
    .string()
    .matches(/^[0-9]{6}$/, 'Invalid PIN code')
    .required('PIN code is required'),
  bloodGroup: yup.string().required('Blood group is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const OtpForm = memo(({ onVerify, onResend }) => {
  const [otpValue, setOtpValue] = useState('');

  const handleOtpChange = useCallback(e => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpValue(value);
  }, []);

  const handleVerify = useCallback(() => {
    onVerify(otpValue);
  }, [otpValue, onVerify]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-8">
      <h3 className="text-xl font-semibold mb-4">Enter OTP</h3>
      <div>
        <input
          type="text"
          value={otpValue}
          onChange={handleOtpChange}
          maxLength={6}
          placeholder="Enter OTP"
          className="w-full bg-gray-800 rounded-lg px-4 py-3"
        />
      </div>
      <div className="flex space-x-4">
        <button
          onClick={handleVerify}
          className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition"
          disabled={otpValue.length !== 6}
        >
          Verify OTP
        </button>
        <button
          onClick={onResend}
          className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
        >
          Resend OTP
        </button>
      </div>
    </motion.div>
  );
});

OtpForm.displayName = 'OtpForm';

export default function DonorForm({ formStep, setFormStep }) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const [showOtpForm, setShowOtpForm] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const calculateAge = dob => {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const steps = [
    {
      title: 'Personal Information',
      fields: ['fullName', 'email', 'phone', 'dob'],
    },
    {
      title: 'Health Details',
      fields: ['bloodGroup', 'frequency', 'conditions'], // removed location
    },
    { title: 'Account Setup', fields: ['password'] },
  ];

  const getCoordinates = async address => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address,
        )}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
      );

      if (response.data.results && response.data.results[0]) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return [lng, lat];
      }
      return null;
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    }
  };
  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('/api/v1/user/login', {
        email,
        password,
      });

      if (response.data) {
        localStorage.setItem('token', response.data.token);
        toast.success('🎉 Welcome! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/userDashboard');
        }, 1500);
      }
    } catch (error) {
      toast.error('Login failed. Please try logging in manually.');
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await axios.post('/api/v1/user/resend-email-otp', {
        email: email,
      });
      toast.info('✉️ New OTP has been sent to your email!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const handleVerifyOtp = useCallback(
    async otpValue => {
      try {
        const response = await axios.post('/api/v1/user/verify-email', {
          email: email,
          otp: otpValue,
        });
        toast.success('🎉 Registration successful!');
        // Automatically log in the user
        await handleLogin(email, userPassword);
      } catch (error) {
        toast.error(error.response?.data?.message || 'OTP verification failed');
      }
    },
    [email, userPassword],
  );

  const onSubmit = async data => {
    try {
      const formattedData = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        dateOfBirth: data.dob,
        phone: data.phone,
        bloodGroup: data.bloodGroup,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          pinCode: data.pinCode,
          coordinates: [77.5946, 12.9716],
        },
        frequency: data.frequency,
        conditions: data.conditions || [],
      };

      const response = await axios.post('/api/v1/user/register', formattedData);

      if (response.data) {
        setEmail(data.email);
        setUserPassword(data.password); // Store password for auto-login
        setShowOtpForm(true);
        toast.success('📧 OTP has been sent to your email!', {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <motion.div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8 flex gap-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full ${
              index <= formStep ? 'bg-red-500' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {formStep === 0 && (
          <motion.div className="space-y-4">
            <div>
              <input
                {...register('fullName')}
                placeholder="Full Name"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              {errors.fullName && (
                <p className="text-red-400 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <input
                {...register('email')}
                type="email"
                placeholder="Email"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <input
                {...register('phone')}
                placeholder="Phone Number"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <input
                {...register('dob')}
                type="date"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              {watch('dob') && (
                <p className="text-gray-400 mt-1">Age: {calculateAge(watch('dob'))}</p>
              )}
            </div>

            <div>
              <input
                {...register('street')}
                placeholder="Street Address"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                {...register('city')}
                placeholder="City"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              <input
                {...register('state')}
                placeholder="State"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <input
                {...register('pinCode')}
                placeholder="PIN Code"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
            </div>
          </motion.div>
        )}

        {formStep === 1 && (
          <motion.div className="space-y-4">
            <div>
              <select
                {...register('bloodGroup')}
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              >
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                {...register('frequency')}
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              >
                <option value="">Donation Frequency</option>
                {['Once', 'Monthly', 'Quarterly', 'Bi-Yearly', 'Yearly'].map(freq => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-gray-300">Health Conditions</label>
              {['None', 'HIV+', 'Hepatitis', 'Diabetes', 'Heart Condition'].map(cond => (
                <label key={cond} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={cond}
                    {...register('conditions')}
                    className="bg-gray-800"
                  />
                  <span>{cond}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}

        {formStep === 2 && (
          <motion.div className="space-y-4">
            <div>
              <input
                {...register('password')}
                type="password"
                placeholder="Password"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              <p className="text-gray-400 text-sm mt-1">Minimum 8 characters</p>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" required className="bg-gray-800" />
              <span>I agree to the blood donation guidelines</span>
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex justify-between">
          {formStep > 0 && (
            <button
              type="button"
              onClick={() => setFormStep(formStep - 1)}
              className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
            >
              Back
            </button>
          )}

          {formStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setFormStep(formStep + 1)}
              className="ml-auto px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="ml-auto px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition"
            >
              Get OTP
            </button>
          )}
        </div>
      </form>
      {showOtpForm && <OtpForm onVerify={handleVerifyOtp} onResend={handleResendOtp} />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </motion.div>
  );
}
