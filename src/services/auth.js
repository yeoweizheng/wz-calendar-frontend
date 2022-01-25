import * as React from 'react';
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate, useLocation } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { add } from 'date-fns';

const AuthContext = React.createContext({});

export const AuthProvider = (props) => {
  const [cookies, setCookie] = useCookies(['username', 'token'])
  const [username, setUsername] = React.useState(cookies.username);
  const [token, setToken] = React.useState(cookies.token);
  const navigate = useNavigate();
  const location = useLocation();
  const fromUrl = location.state?.fromLocation?.pathname || "/";

  React.useEffect(() => {
    setCookie('username', username, { path: '/', sameSite: "strict", expires: add(new Date(), {"years": 1})})
    setCookie('token', token, { path: '/', sameSite: "strict", expires: add(new Date(), {"years": 1})})
  }, [username, token, setCookie]);

  const login = React.useCallback((username, password, successCallback, failureCallback) => {
    return axios.post(API_URL + "token/", { username, password }).then(res => {
      setUsername(username);
      setToken(res.data.token);
      successCallback();
    })
      .catch((err) => {
        failureCallback();
      })
  }, [])

  const logout = React.useCallback(() => {
    setUsername("");
    setToken("");
    if (fromUrl !== "/login" && fromUrl !== "/") navigate("/");
  }, [setUsername, setToken, navigate, fromUrl])

  const isAuthenticated = React.useCallback(() => {
    if (username === undefined || username === null || username === "") {
      return false;
    } else {
      return true;
    }
  }, [username])

  const authMemo = React.useMemo(
    () => ({ username, setUsername, token, setToken, login, logout, isAuthenticated }),
    [username, token, login, logout, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={authMemo}>
      {props.children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return React.useContext(AuthContext);
}
