import * as React from 'react';
import { useGlobalData } from '../services/globalData';

export function useSnackbar() {
  const [, setGlobalData] = useGlobalData();
  const openSnackbar = React.useCallback((msg, severity, autoclose=true) => { 
    setGlobalData((prev) => ({...prev, snackbarData: { open: true, message: msg, severity: severity, autoclose: autoclose }}))
  }, [setGlobalData]);
  const closeSnackbar = React.useCallback(() => { 
    setGlobalData((prev) => ({...prev, snackbarData: {...prev.snackbarData, open: false}}))
  }, [setGlobalData]);
  return { openSnackbar, closeSnackbar }
}