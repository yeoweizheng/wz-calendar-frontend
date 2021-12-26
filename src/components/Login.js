import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useAuth } from "../services/auth";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromUrl = location.state?.fromLocation?.pathname || "/";

  const handleSuccess = () => {
    navigate(fromUrl, { replace: true });
  }

  const handleFailure = () => {
    alert("Failed to login.");
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    login(data.get("username"), data.get("password"), handleSuccess, handleFailure);
  }

  return (
    <Container maxWidth="xs">
      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
        <Typography component="h1" variant="h5" sx={{m: 2}}>Login</Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField margin="normal" required fullWidth id="username" label="Username" name="username" autoComplete="username" autoFocus />
          <TextField margin="normal" required fullWidth name="password" label="Password" type ="password" id="password" autoComplete="current-password" />
          <Button type ="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} > Login </Button>
        </Box>
      </Box>
    </Container>
  )
}