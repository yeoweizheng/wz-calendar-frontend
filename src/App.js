import './App.css';
import * as React from 'react';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import TopAppBar from './components/TopAppBar';
import { AuthProvider } from './services/auth';
import WeeklyCalendar from './components/WeeklyCalendar';
import RequireAuth from './components/RequireAuth';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { GlobalDataProvider } from './services/globalData';

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
            <GlobalDataProvider>
              <TopAppBar />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<RequireAuth><WeeklyCalendar /></RequireAuth>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </GlobalDataProvider>
          </LocalizationProvider>
        </AuthProvider>
      </ThemeProvider>
    </React.Fragment>
  )
}
