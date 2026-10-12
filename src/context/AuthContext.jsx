import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function storedUser() {
  try {
    return JSON.parse(localStorage.getItem('tp_user') || 'null');
  } catch {
    localStorage.removeItem('tp_user');
    localStorage.removeItem('tp_token');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser);

  const value = useMemo(() => ({
    user,
    login(authResponse) {
      localStorage.setItem('tp_token', authResponse.token);
      localStorage.setItem('tp_user', JSON.stringify(authResponse));
      setUser(authResponse);
    },
    logout() {
      localStorage.removeItem('tp_token');
      localStorage.removeItem('tp_user');
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
