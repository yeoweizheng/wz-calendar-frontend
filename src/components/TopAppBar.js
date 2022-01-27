import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from "../services/auth";
import { useSidebar } from '../services/sidebar';

export default function TopAppBar() {

  const { isAuthenticated } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  const toggleSidebar = React.useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen, setSidebarOpen])

  return (
    <AppBar position="static">
      <Toolbar>
        { isAuthenticated() ? 
          <IconButton color="inherit" edge="start" sx={{ mr:2 }} onClick={() => toggleSidebar()}> <MenuIcon /> </IconButton>
          : null
        }
        <Typography variant="h6" component="div"> WZ Calendar </Typography>
        <Box sx={{ flexGrow: 1 }} />
        
      </Toolbar>
    </AppBar>
  );
}