import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#212735',
    },
    secondary: {
      main: '#2dd070',
      light: '#57d98c',
      dark: '#1f914e',
      contrastText: '#202735',
    },
    background: {
      default: '#31394d',
      paper: '#202735',
    },
    divider: '#3d465e',
    text: {
      primary: '#ffffff',
      secondary: '#94a3b8',
    },
    success: {
      main: '#2dd070',
      contrastText: '#fff',
    },
    error: {
      main: '#f43f5e',
      contrastText: '#fff',
    },
    warning: {
      main: '#f5780bbe',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    overline: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: { backgroundColor: theme.palette.background.paper },
      }),
    },
    MuiCircularProgress: {
      defaultProps: { color: 'secondary' },
    },
    MuiTextField: {
      defaultProps: { color: 'secondary' },
    },
    MuiSelect: {
      defaultProps: { color: 'secondary' },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }),
        arrow: ({ theme }) => ({ color: theme.palette.background.paper }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiTableCell-root': {
            ...theme.typography.overline,
            lineHeight: 1.5,
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.paper,
            borderBottom: '1px solid #13161e',
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#13161e',
          padding: '14px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child .MuiTableCell-body': { borderBottom: 0 },
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.10)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.20)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#202735',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9rem',
        },
      },
    },
  },
})

export default theme
