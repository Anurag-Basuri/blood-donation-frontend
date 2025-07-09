import { useContext, useState } from 'react';
import { FormContext } from '../../context/FormContext.jsx';
import { hospitalRegister } from '../../services/authService.js';
import PropTypes from 'prop-types';

export function RegisterHospital({ next }) {
  const { update } = useContext(FormContext);
  const [local, setLocal] = useState({ name:'', email:'', password:'', address:'', contactPerson:'', emergencyContact:'', specialties:'', registrationNumber:'' });
  const [error,setError]=useState('');
  const handle= k => e => setLocal({...local,[k]:e.target.value});
  const submit=async e=>{
    e.preventDefault();
    update(local);
    try{ await hospitalRegister(local.name,local.email,local.address,local.contactPerson,local.emergencyContact,local.specialties,local.registrationNumber); next(); }
    catch(err){ setError(err.response?.data?.message||'Error'); }
  };

  return (
    <form onSubmit={submit} className="space-y-4 text-white">
      {error && <div className="text-red-300">{error}</div>}
      {Object.entries(local).map(([k,v]) => (
        <div key={k}>
          <label>{k.replace(/[A-Z]/g,' $&')}</label>
          <input required value={v} onChange={handle(k)} type={k==='email'?'email':k==='emergencyContact'?'tel':'text'} className="..."/>
        </div>
      ))}
      <button className="...">Next</button>
    </form>
  );
}

RegisterHospital.propTypes = {
  next: PropTypes.func.isRequired,
};