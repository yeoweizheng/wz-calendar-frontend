import * as React from 'react';
import axios from "axios";
import { API_URL } from "../config";

const AuthContext = React.createContext({});

export const AuthProvider = (props) => {
  const [username, setUsername] = React.useState(localStorage.getItem("username"));
  const [token, setToken] = React.useState(localStorage.getItem("token"));

  React.useEffect(() => {
    localStorage.setItem("username", username);
    localStorage.setItem("token", token);
  }, [username, token]);

  const login = (username, password, successCallback, failureCallback) => {
    return axios.post(API_URL + "token/", { username, password }).then(res => {
      setUsername(username);
      setToken(res.data.token);
      successCallback();
    })
      .catch((err) => {
        console.log(err);
        failureCallback();
      })
  }

  const logout = () => {
    setUsername("");
    setToken("");
  }

  const isAuthenticated = React.useCallback(() => {
    if (username === undefined || username === null || username === "") {
      return false;
    } else {
      return true;
    }
  }, [username])

  const authMemo = React.useMemo(
    () => ({ username, setUsername, token, setToken, login, logout, isAuthenticated }),
    [username, token, isAuthenticated]
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
