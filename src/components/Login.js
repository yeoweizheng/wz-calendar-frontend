import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useAuth } from "../services/auth";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginFailedAlertOpen, setLoginFailedAlertOpen] = React.useState(false);

  const fromUrl = location.state?.fromLocation?.pathname || "/";

  const handleSuccess = () => {
    navigate(fromUrl, { replace: true });
  }

  const handleFailure = () => {
    setLoginFailedAlertOpen(true);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    login(data.get("username"), data.get("password"), handleSuccess, handleFailure);
  }

  return (
    <Container maxWidth="xs">
      <Snackbar anchorOrigin={{"vertical": "top", "horizontal": "center"}} 
        open={loginFailedAlertOpen}
        onClose={() => setLoginFailedAlertOpen(false)}
        autoHideDuration={3000}>
          <Alert onClose={() => setLoginFailedAlertOpen(false)} severity="error">Login failed.</Alert>
      </Snackbar>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
        <Typography component="h6" variant="h6" sx={{m: 2}}>Login</Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField size="small" margin="normal" required fullWidth id="username" label="Username" name="username" autoComplete="username" autoFocus />
          <TextField size="small" margin="normal" required fullWidth name="password" label="Password" type ="password" id="password" autoComplete="current-password" />
          <Button type ="submit" size="small" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} > Login </Button>
        </Box>
      </Box>
    </Container>
  )
}