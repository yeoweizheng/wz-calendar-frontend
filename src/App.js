import './App.css';
import * as React from 'react';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import TopAppBar from './components/TopAppBar';
import { AuthProvider } from './services/auth';
import WeeklyCalendar from './components/WeeklyCalendar';
import RequireAuth from './components/RequireAuth';

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
          <TopAppBar />
          <Routes>
            <Route path="/" element={<Navigate replace to="week" />} />
            <Route path="login" element={<Login />} />
            <Route path="week" element={<RequireAuth><WeeklyCalendar /></RequireAuth>} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </React.Fragment>
  )
}
