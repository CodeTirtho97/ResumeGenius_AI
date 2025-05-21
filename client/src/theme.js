// Create this file: client/src/theme.js
import { createTheme } from "@mui/material/styles";

// Modern, professional dark theme with improved spacing and typography
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00e1ff99",
      light: "#49bdd2",
      dark: "#00A0B5",
      contrastText: "#0A1929",
    },
    secondary: {
      main: "#06D6A0",
      light: "#56E1BE",
      dark: "#048F6B",
      contrastText: "#0A1929",
    },
    background: {
      default: "#0A1929",
      paper: "#121E2E",
    },
    error: {
      main: "#FF5757",
    },
    warning: {
      main: "#FFC107",
    },
    info: {
      main: "#00B8D9",
    },
    success: {
      main: "#36B37E",
    },
    text: {
      primary: "#F7FAFC",
      secondary: "#A0AEC0",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2rem",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: "1rem",
      lineHeight: 1.5,
      letterSpacing: "0.00938em",
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: "0.875rem",
      lineHeight: 1.57,
      letterSpacing: "0.00714em",
      fontWeight: 500,
    },
    body1: {
      fontSize: "0.875rem",
      lineHeight: 1.57,
      letterSpacing: "0.00938em",
    },
    body2: {
      fontSize: "0.75rem",
      lineHeight: 1.66,
      letterSpacing: "0.0071em",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.66,
      letterSpacing: "0.03333em",
    },
    overline: {
      fontSize: "0.625rem",
      lineHeight: 2.66,
      letterSpacing: "0.08333em",
      textTransform: "uppercase",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: (factor) => `${0.5 * factor}rem`,
  shadows: [
    "none",
    "0px 2px 4px rgba(0, 0, 0, 0.2)",
    "0px 4px 8px rgba(0, 0, 0, 0.2)",
    "0px 6px 12px rgba(0, 0, 0, 0.2)",
    "0px 8px 16px rgba(0, 0, 0, 0.2)",
    "0px 10px 20px rgba(0, 0, 0, 0.2)",
    "0px 12px 24px rgba(0, 0, 0, 0.2)",
    "0px 14px 28px rgba(0, 0, 0, 0.2)",
    "0px 16px 32px rgba(0, 0, 0, 0.2)",
    "0px 18px 36px rgba(0, 0, 0, 0.2)",
    "0px 20px 40px rgba(0, 0, 0, 0.2)",
    "0px 22px 44px rgba(0, 0, 0, 0.2)",
    "0px 24px 48px rgba(0, 0, 0, 0.2)",
    "0px 26px 52px rgba(0, 0, 0, 0.2)",
    "0px 28px 56px rgba(0, 0, 0, 0.2)",
    "0px 30px 60px rgba(0, 0, 0, 0.2)",
    "0px 32px 64px rgba(0, 0, 0, 0.2)",
    "0px 34px 68px rgba(0, 0, 0, 0.2)",
    "0px 36px 72px rgba(0, 0, 0, 0.2)",
    "0px 38px 76px rgba(0, 0, 0, 0.2)",
    "0px 40px 80px rgba(0, 0, 0, 0.2)",
    "0px 42px 84px rgba(0, 0, 0, 0.2)",
    "0px 44px 88px rgba(0, 0, 0, 0.2)",
    "0px 46px 92px rgba(0, 0, 0, 0.2)",
    "0px 48px 96px rgba(0, 0, 0, 0.2)",
  ],
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 16px",
          fontWeight: 600,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)",
          },
        },
        contained: {
          "&:active": {
            transform: "translateY(1px)",
            boxShadow: "none",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
        },
        elevation2: {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
        },
        elevation3: {
          boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.15)",
        },
        elevation4: {
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "rgba(10, 25, 41, 0.95)",
          borderRadius: 6,
          fontSize: "0.75rem",
          padding: "8px 12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(255, 255, 255, 0.08)",
        },
      },
    },
  },
});

export default theme;
