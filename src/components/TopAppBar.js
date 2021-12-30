import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAuth } from "../services/auth";

export default function TopAppBar() {

  const { isAuthenticated, logout } = useAuth();

  const logoutHandler = () => {
    logout();
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div"> WZCalendar </Typography>
        <Box sx={{ flexGrow: 1 }} />
        { isAuthenticated() ?  
          <Button color="inherit" onClick={logoutHandler}>Logout</Button>
          : 
          null
        }
      </Toolbar>
    </AppBar>
  );
}