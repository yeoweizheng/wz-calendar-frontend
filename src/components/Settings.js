import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useAuth } from "../services/auth";
import { useSnackbar } from '../services/snackbar';
import { useHttp } from '../services/http';

export default function Settings() {
  const { username } = useAuth();
  const { openSnackbar } = useSnackbar();
  const { post } = useHttp();
  const resetButton = React.useRef();

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let currentPassword = data.get("currentPassword");
    let newPassword = data.get("newPassword");
    let newPasswordConfirm = data.get("newPasswordConfirm");
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      openSnackbar("Please fill in all fields.", "error");
    } else if (newPassword !== newPasswordConfirm) {
      openSnackbar("Passwords do not match.", "error");
    }
    let payload = {"currentPassword": currentPassword, "newPassword": newPassword};
    post("update_password/", payload, 
      () => {
        openSnackbar("Password changed.", "success");
        resetButton.current.click();
      },
      () => openSnackbar("Failed to change password.", "error"),
      true, false);
  };

  return (
    <Container maxWidth="xs">
      <Box style={{"display": "flex", "flexDirection": "column", "alignItems": "center"}}>
        <Typography component="h6" variant="h6" sx={{mt: 2}}>Settings</Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField size="small" margin="dense" variant="filled" fullWidth id="username" label="Username" name="username" defaultValue={username} InputProps={{readOnly: true}} />
          <TextField size="small" margin="dense" required fullWidth name="currentPassword" label="Current Password" type ="password" id="currentPassword" />
          <TextField size="small" margin="dense" required fullWidth name="newPassword" label="New Password" type ="password" id="newPassword" />
          <TextField size="small" margin="dense" required fullWidth name="newPasswordConfirm" label="New Password (again)" type ="password" id="newPasswordConfirm" />
          <Button type="submit" fullWidth variant="contained" sx={{mt: 2}}> Update Password </Button>
          <Button type="reset" sx={{display: "none"}} ref={resetButton}>Reset</Button>
        </Box>
      </Box>
    </Container>
  )
}
