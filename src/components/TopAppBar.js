import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from "../services/auth";
import { useGlobalData } from '../services/globalData';

export default function TopAppBar() {

  const { isAuthenticated } = useAuth();
  const [globalData, setGlobalData] = useGlobalData();
  const [calViewAnchorEl, setCalviewAnchorEl] = React.useState(null);

  const toggleSidebar = React.useCallback(() => {
    setGlobalData((prev) => ({...prev, sidebarOpen: !prev.sidebarOpen}))
  }, [setGlobalData])

  const openCalViewMenu = React.useCallback((event) => {
    setCalviewAnchorEl(event.currentTarget);
  }, [setCalviewAnchorEl])

  const closeCalViewMenu = React.useCallback(() => {
    setCalviewAnchorEl(null);
  }, [setCalviewAnchorEl])

  const switchView = React.useCallback((view) => {
    setGlobalData((prev) => ({...prev, calView: view}));
    closeCalViewMenu();
  }, [setGlobalData, closeCalViewMenu])

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
            <IconButton color="inherit" onClick={openCalViewMenu}> <CalendarTodayIcon /> </IconButton>
            <Menu
              anchorEl={calViewAnchorEl}
              anchorOrigin={{vertical: "top", horizontal: "right"}}
              keepMounted
              transformOrigin={{vertical: "top", horizontal: "right"}}
              open={Boolean(calViewAnchorEl)}
              onClose={closeCalViewMenu}
            >
              <MenuItem onClick={()=>switchView("weekly")} selected={globalData.calView === "weekly"}>Week</MenuItem>
              <MenuItem onClick={()=>switchView("monthly")} selected={globalData.calView === "monthly"}>Month</MenuItem>
            </Menu>
          </React.Fragment>
          : null
        }
      </Toolbar>
    </AppBar>
  );
}