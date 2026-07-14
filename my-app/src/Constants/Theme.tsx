// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3858e9',
    },
    secondary: {
      main: '#dc004e',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
    },
    text: {
      primary: '#2c3338',
      secondary: '#50575e',
    },
    common: {
      white: '#ffffff',
      black: '#000000',
    }
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiModal: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiPopover: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiMenu: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#000000',
          height: '3px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#000000',
          },
        },
      },
    },
  },
});

export default theme;