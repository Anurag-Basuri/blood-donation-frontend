import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const schema = yup.object().shape({
  ngoName: yup.string().required("NGO Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  contactPerson: yup.object().shape({
    name: yup.string().required("Contact person name is required"),
    phone: yup.string().required("Contact phone is required"),
    email: yup.string().email("Invalid email").required("Contact email is required"),
  }),
  address: yup.object().shape({
    street: yup.string().required("Street is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    pinCode: yup.string().required("PIN code is required"),
    country: yup.string().default("India"),
    location: yup.object().shape({
      type: yup.string().default("Point"),
      coordinates: yup.array().of(yup.number()),
    }),
  }),
  affiliation: yup.string(),
  regNumber: yup.string().required("Registration number is required"),
});

export default function NGOForm({ formStep, setFormStep }) {
  const navigate = useNavigate();
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ngoName: "",
      email: "",
      password: "",
      contactPerson: {
        name: "",
        phone: "",
        email: ""
      },
      address: {
        street: "",
        city: "",
        state: "",
        pinCode: "",
        country: "",
        location: {
          type: "Point",
          coordinates: [23.4567, -12.3456]
        }
      },
      affiliation: "",
      regNumber: ""
    }
  });

  const steps = [
    {
      title: "Organization Info",
      fields: ["ngoName", "email", "contactPerson"],
    },
    {
      title: "Legal Details",
      fields: ["regNumber", "address", "affiliation"],
    },
    { title: "Verification", fields: ["documents", "password"] },
  ];

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post("/api/v1/ngo/login", {
        email,
        password
      });
      
      if (response.data) {
        localStorage.setItem('token', response.data.token);
        toast.success('🎉 Welcome! Redirecting to NGO dashboard...');
        setTimeout(() => {
          navigate('/ngoDashboard');
        }, 1500);
      }
    } catch (error) {
      toast.error('Login failed. Please try logging in manually.');
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await axios.post("/api/v1/ngo/resend-email-otp", {
        email: email
      });
      toast.info('✉️ New OTP has been sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/v1/ngo/verify-email", {
        email: email,
        otp: otp
      });
      toast.success('🎉 Registration successful!');
      // Automatically log in the NGO
      await handleLogin(email, userPassword);
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // Structure the data as per backend requirements
      const formData = {
        name: data.ngoName, // Make sure to send as 'name'
        email: data.email,
        password: data.password,
        // Include other fields
        contactPerson: data.contactPerson,
        address: data.address,
        affiliation: data.affiliation,
        regNumber: data.regNumber
      };

      const response = await axios.post("/api/v1/ngo/register", formData);
      if (response.data) {
        setEmail(data.email);
        setUserPassword(data.password);
        setShowOtpForm(true);
        toast.success('📧 OTP has been sent to your email!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const OtpForm = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 mt-8"
      >
        <h3 className="text-xl font-semibold mb-4">Enter OTP</h3>
        <div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full bg-gray-800 rounded-lg px-4 py-3"
          />
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <button
            onClick={handleResendOtp}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Resend OTP"}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8 flex gap-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full ${
              index <= formStep ? "bg-red-500" : "bg-gray-700"
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Organization Info */}
        {formStep === 0 && (
          <div className="space-y-4">
            <div>
              <input
                {...register("ngoName")}
                placeholder="NGO Name"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              {errors.ngoName && (
                <p className="text-red-400 text-sm mt-1">{errors.ngoName.message}</p>
              )}
            </div>

            <div>
              <input
                {...register("email")}
                type="email"
                placeholder="Email"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <fieldset className="space-y-4">
              <legend className="text-gray-300 mb-2">Contact Person Details</legend>
              <input
                {...register("contactPerson.name")}
                placeholder="Contact Person Name"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              <input
                {...register("contactPerson.phone")}
                placeholder="Contact Person Phone"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              <input
                {...register("contactPerson.email")}
                type="email"
                placeholder="Contact Person Email"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
            </fieldset>
          </div>
        )}

        {/* Step 2: Legal Details */}
        {formStep === 1 && (
          <div className="space-y-4">
            <div>
              <input
                {...register("regNumber")}
                placeholder="Registration Number"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              {errors.regNumber && (
                <p className="text-red-400 text-sm mt-1">{errors.regNumber.message}</p>
              )}
            </div>

            <fieldset className="space-y-4">
              <legend className="text-gray-300 mb-2">Address Details</legend>
              <input
                {...register("address.street")}
                placeholder="Street"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              <input
                {...register("address.city")}
                placeholder="City"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              <input
                {...register("address.state")}
                placeholder="State"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              <input
                {...register("address.pinCode")}
                placeholder="PIN Code"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
            </fieldset>

            <div>
              <input
                {...register("affiliation")}
                placeholder="Affiliation (optional)"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
            </div>
          </div>
        )}

        {/* Step 3: Verification */}
        {formStep === 2 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
              <input
                type="file"
                {...register("documents")}
                className="hidden"
                id="ngo-docs"
              />
              <label
                htmlFor="ngo-docs"
                className="cursor-pointer text-red-400 hover:underline"
              >
                Upload Legal Documents
              </label>
              {errors.documents && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.documents.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register("password")}
                type="password"
                placeholder="Password"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
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
              disabled={loading}
              className="ml-auto px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Get OTP"}
            </button>
          )}
        </div>
      </form>
      
      {showOtpForm && <OtpForm />}
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
    </div>
  );
}
