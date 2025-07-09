import { useContext, useState } from 'react';
import { FormContext } from '../../context/FormContext';
import { ngoRegister } from '../../services/authService';
import PropTypes from 'prop-types';

export function RegisterNGO({ next }) {
  const { update } = useContext(FormContext);
  const [local, setLocal] = useState({ name:'', email:'', contactPerson:'', address:'', regNumber:'', affiliation:'', establishedYear:'', license:'', password:'' });
  const [error,setError]=useState('');
  const handle= k => e => setLocal({...local,[k]:e.target.value});

  const submit=async e => {
    e.preventDefault();
    update(local);
    try{ await ngoRegister(local.name,local.email,local.address,local.contactPerson,local.regNumber,local.affiliation,local.establishedYear,local.license,local.password); next(); }
    catch(err){ setError(err.response?.data?.message||'Error'); }
  };

  return (
    <form onSubmit={submit} className="space-y-4 text-white">
      {error && <div className="text-red-300">{error}</div>}
      {Object.entries(local).map(([k,v])=>
        <div key={k}>
          <label>{k.replace(/[A-Z]/g,' $&')}</label>
          <input required value={v} onChange={handle(k)} className="..." type={k==='email'?'email':k==='establishedYear'?'number':'text'}/>
        </div>
      )}
      <button className="...">Next</button>
    </form>
  );
}

RegisterNGO.propTypes = {
  next: PropTypes.func.isRequired,
};