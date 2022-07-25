import './App.css';
import * as React from 'react';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import TopAppBar from './components/TopAppBar';
import { AuthProvider } from './services/auth';
import RequireAuth from './components/RequireAuth';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { GlobalDataProvider } from './services/globalData';
import AlertSnackbar from './components/AlertSnackbar';
import MainContainer from './components/MainContainer';

export default function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#21257f"
      }
    },
    components: {
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            paddingTop: "8px",
            paddingBottom: "8px",
          }
        }
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            paddingBottom: "0px"
          }
        }
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            paddingLeft: "16px",
            paddingRight: "16px",
          }
        }
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
              <AlertSnackbar />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<RequireAuth><MainContainer /></RequireAuth>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </GlobalDataProvider>
          </LocalizationProvider>
        </AuthProvider>
      </ThemeProvider>
    </React.Fragment>
  )
}
