import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  hospitalName: yup.string().required('Hospital Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  contactPhone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Invalid phone number')
    .required('Phone number is required'),
  regNumber: yup.string().required('Registration number is required'),
  address: yup.string().required('Address is required'),
  emergencyNeeds: yup.boolean().required('Emergency needs must be specified'),
  documents: yup
    .mixed()
    .required('Document is required')
    .test('fileSize', 'File size is too large', value => {
      return value && value[0] && value[0].size <= 5 * 1024 * 1024; // 5MB limit
    }),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export default function HospitalForm({ formStep, setFormStep }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const steps = [
    {
      title: 'Hospital Info',
      fields: ['hospitalName', 'email', 'contactPhone'],
    },
    {
      title: 'Facility Details',
      fields: ['regNumber', 'address', 'emergencyNeeds'],
    },
    { title: 'Verification', fields: ['documents', 'password'] },
  ];

  const onSubmit = data => {
    console.log('Hospital Data:', data);
    // Submit to API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
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

      {/* Step 1: Hospital Info */}
      {formStep === 0 && (
        <div className="space-y-4">
          <div>
            <input
              {...register('hospitalName')}
              placeholder="Hospital Name"
              className="w-full bg-gray-800 rounded-lg px-4 py-3"
            />
            {errors.hospitalName && (
              <p className="text-red-400 text-sm mt-1">{errors.hospitalName.message}</p>
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
              {...register('contactPhone')}
              placeholder="Contact Phone"
              className="w-full bg-gray-800 rounded-lg px-4 py-3"
            />
            {errors.contactPhone && (
              <p className="text-red-400 text-sm mt-1">{errors.contactPhone.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Facility Details */}
      {formStep === 1 && (
        <div className="space-y-4">
          <div>
            <input
              {...register('regNumber')}
              placeholder="Registration Number"
              className="w-full bg-gray-800 rounded-lg px-4 py-3"
            />
            {errors.regNumber && (
              <p className="text-red-400 text-sm mt-1">{errors.regNumber.message}</p>
            )}
          </div>

          <div>
            <input
              {...register('address')}
              placeholder="Address"
              className="w-full bg-gray-800 rounded-lg px-4 py-3"
            />
            {errors.address && (
              <p className="text-red-400 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-gray-300">Emergency Blood Needs:</label>
            <label className="switch">
              <input type="checkbox" {...register('emergencyNeeds')} className="bg-gray-800" />
              <span className="slider round"></span>
            </label>
            {errors.emergencyNeeds && (
              <p className="text-red-400 text-sm mt-1">{errors.emergencyNeeds.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Verification */}
      {formStep === 2 && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
            <input type="file" {...register('documents')} className="hidden" id="hospital-docs" />
            <label htmlFor="hospital-docs" className="cursor-pointer text-red-400 hover:underline">
              Upload Legal Documents
            </label>
            {errors.documents && (
              <p className="text-red-400 text-sm mt-1">{errors.documents.message}</p>
            )}
          </div>

          <div>
            <input
              {...register('password')}
              type="password"
              placeholder="Password"
              className="w-full bg-gray-800 rounded-lg px-4 py-3"
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
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
            className="ml-auto px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition"
          >
            Submit
          </button>
        )}
      </div>
    </form>
  );
}
