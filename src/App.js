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
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { SidebarProvider } from './services/sidebar';

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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <SidebarProvider>
              <TopAppBar />
              <Routes>
                <Route path="login" element={<Login />} />
                <Route path="/" element={<RequireAuth><WeeklyCalendar /></RequireAuth>} />
              </Routes>
            </SidebarProvider>
          </LocalizationProvider>
        </AuthProvider>
      </ThemeProvider>
    </React.Fragment>
  )
}
