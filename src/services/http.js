import * as React from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../services/auth';
import { useSnackbar } from './snackbar';

export function useHttp() {
  const { token, logout } = useAuth();
  const { openSnackbar } = useSnackbar();

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
        } catch (e) {
          openSnackbar("Failed to retrieve data. Please refresh and try again.", "error", false);
        }
        errorCallback(err);
      });
  }, [token, logout, openSnackbar])

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
        } catch (e) {
          openSnackbar("Failed to upload data. Please refresh and try again.", "error", false);
        }
        errorCallback(err);
      });
  }, [token, logout, openSnackbar])

  const patch = React.useCallback((url, data, successCallback, errorCallback=()=>{}, useAuth=true) => {
    let config = {};
    if (useAuth) {
      config = { headers: { Authorization: "JWT " + token } }
    }
    axios.patch(API_URL+url, data, config)
      .then((res) => {
        successCallback(res.data);
      })
      .catch((err) => {
        try {
          if (err.response.status === 401) logout();
        } catch (e) {
          openSnackbar("Failed to upload data. Please refresh and try again.", "error", false);
        }
        errorCallback(err);
      });
  }, [token, logout, openSnackbar])

  const del = React.useCallback((url, successCallback, errorCallback=()=>{}, useAuth=true) => {
    let config = {};
    if (useAuth) {
      config = { headers: { Authorization: "JWT " + token } }
    }
    axios.delete(API_URL+url, config)
      .then((res) => {
        successCallback(res.data);
      })
      .catch((err) => {
        try {
          if (err.response.status === 401) logout();
        } catch (e) {
          openSnackbar("Failed to delete data. Please refresh and try again.", "error", false);
        }
        errorCallback(err);
      });
  }, [token, logout, openSnackbar])

  return { get, post, patch, del };
}