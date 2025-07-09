import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [form, setForm] = useState({});
  const update = data => setForm(prev => ({ ...prev, ...data }));

  return (
    <FormContext.Provider value={{ form, update }}>
      {children}
    </FormContext.Provider>
  );
};

FormProvider.propTypes = {
  children: PropTypes.node.isRequired,
};