import './App.css';
import * as React from 'react';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import TopAppBar from './components/TopAppBar';
import { AuthProvider } from './services/auth';
import WeeklyCalendar from './components/WeeklyCalendar';
import RequireAuth from './components/RequireAuth';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterMoment from '@mui/lab/AdapterMoment';
import { SidebarProvider } from './services/sidebar';
import Sidebar from './components/Sidebar';

export default function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#21257f"
      }
    }
  })
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <SidebarProvider>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <TopAppBar />
              <Sidebar />
              <Routes>
                <Route path="login" element={<Login />} />
                <Route path="/" element={<RequireAuth><WeeklyCalendar /></RequireAuth>} />
              </Routes>
            </LocalizationProvider>
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </React.Fragment>
  )
}
