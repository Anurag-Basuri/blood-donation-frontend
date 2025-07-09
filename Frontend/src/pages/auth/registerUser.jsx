import { useContext, useState } from 'react';
import { FormContext } from '../../context/FormContext';
import { userRegister } from '../../services/authService';
import PropTypes from 'prop-types';

export function RegisterUser({ next }) {
  const { update, form } = useContext(FormContext);
  const [local, setLocal] = useState({
    userName: '', fullName: '', email:'', phone:'', dob:'', gender:'', bloodType:'', lastDonation:'', address:'', password:''
  });
  const [error,setError]=useState('');

  const handle= k => e => setLocal({...local,[k]:e.target.value});
  const submit = async e => {
    e.preventDefault();
    update(local);
    try {
      await userRegister(...Object.values(local));
      next();
    } catch(err) {
      setError(err.response?.data?.message||'Error');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 text-white">
      {error && <div className="text-red-300">{error}</div>}
      {Object.entries(local).map(([k,v]) =>
        <div key={k}>
          <label className="block mb-1 capitalize">{k.replace(/[A-Z]/g, ' $&')}</label>
          <input
            required
            value={v}
            onChange={handle(k)}
            type={k.includes('date')? 'date' : (k==='email'?'email':'text')}
            className="w-full p-3 rounded-md bg-white/20 backdrop-blur focus:ring-2 focus:ring-white/40"
          />
        </div>
      )}
      <button className="mt-6 w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg font-semibold">Next</button>
    </form>
  );
}

RegisterUser.propTypes = {
  next: PropTypes.func.isRequired,
};