import * as React from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../services/auth';

export function useHttp() {
  const { token } = useAuth();

  const get = React.useCallback((url, successCallback, errorCallback=()=>{}, useAuth=false) => {
    let config = {};
    if (useAuth) {
      config = { headers: { Authorization: "JWT " + token } }
    }
    axios.get(API_URL+url, config)
      .then((res) => {
        successCallback(res.data);
      })
      .catch((err) => {
        console.log(err);
        errorCallback(err);
      });
  }, [token])

  const post = React.useCallback((url, data, successCallback, errorCallback=()=>{}, useAuth=false) => {
    let config = {};
    if (useAuth) {
      config = { headers: { Authorization: "JWT " + token } }
    }
    axios.post(API_URL+url, data, config)
      .then((res) => {
        successCallback(res.data);
      })
      .catch((err) => {
        console.log(err);
        errorCallback(err);
      });
  }, [token])

  return { get, post };
}