import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [userType, setUserType] = useState("donor");
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Form Data:", { ...data, userType });
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-effect max-w-md mx-auto rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back Hero!</h1>
            <p className="text-gray-500">Continue your lifesaving journey</p>
          </div>

          {/* User Type Selector */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {["donor", "hospital", "ngo"].map((type) => (
              <button
                key={type}
                onClick={() => setUserType(type)}
                className={`p-2 rounded-lg transition-colors ${
                  userType === type
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="flex items-center space-x-3 bg-gray-800 rounded-lg px-4 py-3">
                <Mail className="text-gray-400" size={20} />
                <input
                  {...register("email", { required: true })}
                  type="email"
                  placeholder="Email"
                  className="w-full bg-transparent focus:outline-none"
                />
              </label>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">
                  Valid email required
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="flex items-center space-x-3 bg-gray-800 rounded-lg px-4 py-3">
                <Lock className="text-gray-400" size={20} />
                <input
                  {...register("password", { required: true })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </label>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">Password required</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="rounded bg-gray-800"
                />
                <span className="text-sm">Remember me</span>
              </label>
              <a
                href="/forgot-password"
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg transition-colors"
            >
              Login
            </motion.button>

            {/* Social Login */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 p-3 rounded-lg">
                <GoogleIcon className="w-5 h-5" />
                <span>Google</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 p-3 rounded-lg">
                <FacebookIcon className="w-5 h-5" />
                <span>Facebook</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="w-5 h-5"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.5 0 6.6 1.3 9 3.4l6.7-6.7C35.7 2.5 30.1 0 24 0 14.6 0 6.4 5.8 2.5 14.2l7.8 6.1C12.3 13.3 17.7 9.5 24 9.5z"
    />
    {/* Add other paths */}
  </svg>
);

const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="w-5 h-5"
  >
    <path
      fill="#1877F2"
      d="M24 0C10.7 0 0 10.7 0 24c0 11.9 8.6 21.7 19.8 23.7v-16.8h-6v-6.9h6v-5.3c0-6 3.6-9.3 9-9.3 2.6 0 5.3.5 5.3.5v5.8h-3c-3 0-3.9 1.9-3.9 3.8v4.5h6.6l-1 6.9h-5.6v16.8C39.4 45.7 48 35.9 48 24 48 10.7 37.3 0 24 0z"
    />
  </svg>
);
