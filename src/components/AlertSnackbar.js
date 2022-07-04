import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useGlobalData } from '../services/globalData';
import { useSnackbar } from '../services/snackbar';
import * as React from 'react';

export default function AlertSnackbar() {
    const {snackbarData} = useGlobalData();
    const {closeSnackbar} = useSnackbar();
    return (
        <Snackbar anchorOrigin={{"vertical": "top", "horizontal": "center"}} 
        open={snackbarData["open"]}
        onClose={() => closeSnackbar()}
        autoHideDuration={snackbarData["autoclose"]? 1000 : null}>
            <Alert onClose={() => closeSnackbar} severity={snackbarData["severity"]}>
            {snackbarData["message"]}
            </Alert>
        </Snackbar>
    )
}