import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    tableDivider: string
    gray: Palette['primary']
  }

  interface PaletteOptions {
    tableDivider?: string
    gray?: PaletteOptions['primary']
  }
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#212735',
    },
    secondary: {
      main: '#2dd070',
      dark: '#2fab62',
    },
    background: {
      default: '#202735',
      paper: '#31394d',
    },
    divider: '#3d465e',
    tableDivider: '#13161e',
    text: {
      primary: '#ffffff',
      secondary: '#bfbfbf',
    },
    gray: {
      main: '#393c4a',
      light: '#696a6c',
      dark: '#000000',
      contrastText: '#ffffff',

    },
    success: {
      main: '#2dd070',
    },
    error: {
      main: '#ff0000',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  zIndex: {
    appBar: 1100,
    drawer: 1200,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        "::-webkit-scrollbar": {
          width: '6px',
          height: '6px',
        },
        "::-webkit-scrollbar-track": {
          background: theme.palette.gray.dark,
        },
        "::-webkit-scrollbar-thumb": {
          background: theme.palette.gray.main,
          borderRadius: '2px',
        },
        "::-webkit-scrollbar-button": {
          display: 'none',
        },
        "&": {
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.palette.gray.main} ${theme.palette.gray.light}`
        }
      }),
    },

  },
})

export default theme
