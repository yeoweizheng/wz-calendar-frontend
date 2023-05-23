import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth'
import { useAuth } from "../services/auth";
import { useGlobalData } from '../services/globalData';

export default function TopAppBar() {

  const { isAuthenticated } = useAuth();
  const [globalData, setGlobalData] = useGlobalData();

  const toggleSidebar = React.useCallback(() => {
    setGlobalData((prev) => ({...prev, sidebarOpen: !prev.sidebarOpen}))
  }, [setGlobalData])

  const toggleCalView = React.useCallback(() => {
    let calView = globalData.calView === "weekly" ? "monthly" : "weekly";
    setGlobalData((prev) => ({...prev, calView: calView}));
  }, [setGlobalData, globalData.calView])

  return (
    <AppBar position="static">
      <Toolbar>
        { isAuthenticated() ? 
          <IconButton color="inherit" edge="start" sx={{ mr:2 }} onClick={toggleSidebar}> <MenuIcon /> </IconButton>
          : null
        }
        <Typography variant="h6" component="div" sx={{ flex: 1 }}> WZ Calendar </Typography>
        { isAuthenticated() ?
          <React.Fragment>
            <IconButton color="inherit" onClick={toggleCalView}> {globalData.calView === "weekly" ? <CalendarTodayIcon /> : <CalendarViewMonthIcon />} </IconButton>
          </React.Fragment>
          : null
        }
      </Toolbar>
    </AppBar>
  );
}