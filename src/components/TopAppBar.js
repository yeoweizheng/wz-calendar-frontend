import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from "../services/auth";
import { useGlobalData } from '../services/globalData';

export default function TopAppBar() {

  const { isAuthenticated } = useAuth();
  const [,setGlobalData] = useGlobalData();

  const toggleSidebar = React.useCallback(() => {
    setGlobalData((prev) => ({...prev, sidebarOpen: !prev.sidebarOpen}))
  }, [setGlobalData])

  return (
    <AppBar position="static">
      <Toolbar>
        { isAuthenticated() ? 
          <IconButton color="inherit" edge="start" sx={{ mr:2 }} onClick={() => toggleSidebar()}> <MenuIcon /> </IconButton>
          : null
        }
        <Typography variant="h6" component="div"> WZ Calendar </Typography>
      </Toolbar>
    </AppBar>
  );
}