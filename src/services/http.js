import * as React from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../services/auth';

export function useHttp() {
  const { token, logout } = useAuth();

  const get = React.useCallback((url, successCallback, errorCallback=()=>{}, useAuth=true) => {
    let config = {};
    if (useAuth) {
      config = { headers: { Authorization: "JWT " + token } }
    }
    axios.get(API_URL+url, config)
      .then((res) => {
        successCallback(res.data);
      })
      .catch((err) => {
        try {
          if (err.response.status === 401) logout();
        } catch (e) {}
        errorCallback(err);
      });
  }, [token, logout])

  const post = React.useCallback((url, data, successCallback, errorCallback=()=>{}, useAuth=true) => {
    let config = {};
    if (useAuth) {
      config = { headers: { Authorization: "JWT " + token } }
    }
    axios.post(API_URL+url, data, config)
      .then((res) => {
        successCallback(res.data);
      })
      .catch((err) => {
        try {
          if (err.response.status === 401) logout();
        } catch (e) {}
        errorCallback(err);
      });
  }, [token, logout])

  return { get, post };
}