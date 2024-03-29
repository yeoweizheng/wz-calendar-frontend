import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useAuth } from "../services/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from '../services/snackbar';
import { useNav } from '../services/nav';

export default function Login() {

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { openSnackbar } = useSnackbar();
  const { ensureCalView } = useNav();

  const fromUrl = location.state?.fromLocation?.pathname || "/";

  const handleSuccess = React.useCallback(() => {
    ensureCalView();
    navigate(fromUrl, { replace: true });
  }, [ensureCalView, navigate, fromUrl]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    login(data.get("username"), data.get("password"), handleSuccess, () => {openSnackbar("Login failed", "error")});
  }

  React.useEffect(() => {
    if (isAuthenticated()) handleSuccess();
  }, [isAuthenticated, handleSuccess])

  return (
    <Container maxWidth="xs">
      <Box style={{"display": "flex", "flexDirection": "column", "alignItems": "center"}}>
        <Typography component="h6" variant="h6" sx={{mt: 2}}>Login</Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField size="small" margin="normal" required fullWidth id="username" label="Username" name="username" autoComplete="username" autoFocus />
          <TextField size="small" margin="normal" required fullWidth name="password" label="Password" type ="password" id="password" autoComplete="current-password" />
          <Button type ="submit" fullWidth variant="contained" sx={{mt: 2}}> Login </Button>
        </Box>
      </Box>
    </Container>
  )
}