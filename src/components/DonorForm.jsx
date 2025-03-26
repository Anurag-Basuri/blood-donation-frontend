import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Autocomplete } from "@react-google-maps/api";

const schema = yup.object().shape({
  fullName: yup.string().required(),
  email: yup.string().email().required(),
  phone: yup.string().matches(/^[0-9]{10}$/, "Invalid phone number"),
  dob: yup.date().required(),
  bloodGroup: yup.string().required(),
  location: yup.string().required(),
  frequency: yup.string().required(),
  conditions: yup.array().min(0),
  password: yup.string().min(8).required(),
});

export default function DonorForm({ formStep, setFormStep }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const calculateAge = (dob) => {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const steps = [
    {
      title: "Personal Information",
      fields: ["fullName", "email", "phone", "dob"],
    },
    {
      title: "Health Details",
      fields: ["bloodGroup", "location", "frequency", "conditions"],
    },
    { title: "Account Setup", fields: ["password"] },
  ];

  const onSubmit = (data) => {
    console.log("Donor Data:", data);
    // Submit to API
  };

  return (
    <motion.div className="max-w-2xl mx-auto">
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

      <form onSubmit={handleSubmit(onSubmit)}>
        {formStep === 0 && (
          <motion.div className="space-y-4">
            <div>
              <input
                {...register("fullName")}
                placeholder="Full Name"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              {errors.fullName && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.fullName.message}
                </p>
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
                <p className="text-red-400 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register("phone")}
                placeholder="Phone Number"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register("dob")}
                type="date"
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              />
              {watch("dob") && (
                <p className="text-gray-400 mt-1">
                  Age: {calculateAge(watch("dob"))}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {formStep === 1 && (
          <motion.div className="space-y-4">
            <div>
              <select
                {...register("bloodGroup")}
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              >
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                  (bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <Autocomplete>
                <input
                  {...register("location")}
                  placeholder="Enter Location"
                  className="w-full bg-gray-800 rounded-lg px-4 py-3"
                />
              </Autocomplete>
            </div>

            <div>
              <select
                {...register("frequency")}
                className="w-full bg-gray-800 rounded-lg px-4 py-3"
              >
                <option value="">Donation Frequency</option>
                {["Once", "Monthly", "Quarterly", "Bi-Yearly", "Yearly"].map(
                  (freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-gray-300">Health Conditions</label>
              {["None", "HIV+", "Hepatitis", "Diabetes", "Heart Condition"].map(
                (cond) => (
                  <label key={cond} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={cond}
                      {...register("conditions")}
                      className="bg-gray-800"
                    />
                    <span>{cond}</span>
                  </label>
                )
              )}
            </div>
          </motion.div>
        )}

        {formStep === 2 && (
          <motion.div className="space-y-4">
            <div>
              <input
                {...register("password")}
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
              Become a Donor
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
