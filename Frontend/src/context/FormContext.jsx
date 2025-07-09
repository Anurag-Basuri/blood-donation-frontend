import { createContext, useState } from 'react';

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