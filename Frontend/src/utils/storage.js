const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

const setToken = (tokens) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', tokens);
  }
}

const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

export {
    getToken,
    setToken,
    removeToken
};