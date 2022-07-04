import * as React from 'react';
import { useGlobalData } from '../services/globalData';

export function useSnackbar() {
  const { snackbarData, setSnackbarData } = useGlobalData();
  const openSnackbar = React.useCallback((msg, severity, autoclose=true) => { setSnackbarData({ "open": true, "message": msg, "severity": severity, "autoclose": autoclose }) }, [setSnackbarData]);
  const closeSnackbar = React.useCallback(() => { setSnackbarData({ "open": false, "message": snackbarData["message"], "severity": snackbarData["severity"], "autoclose": snackbarData["autoclose"] }) }, [setSnackbarData, snackbarData]);
  return { openSnackbar, closeSnackbar }
}