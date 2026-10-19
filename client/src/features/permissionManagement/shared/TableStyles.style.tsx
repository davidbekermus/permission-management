import { alpha, styled } from '@mui/material/styles'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

export const ScrollableTableContainer = styled(TableContainer)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  overscrollBehavior: 'contain',
  scrollbarWidth: 'thin',
  scrollbarColor: `${alpha(theme.palette.text.secondary, 0.35)} transparent`,
  '& .MuiTableHead-root .MuiTableCell-root': {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: theme.typography.fontWeightBold,
    textTransform: 'uppercase',
  },
  '& .MuiTableBody-root .MuiTableCell-root, & .MuiTableBody-root .MuiTypography-root, & .MuiTableBody-root .MuiChip-root': {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
  },
  '&::-webkit-scrollbar': {
    width: 8,
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.text.secondary, 0.35),
    borderRadius: 8,
    border: '2px solid transparent',
    backgroundClip: 'padding-box',
    '&:hover': {
      backgroundColor: alpha(theme.palette.text.secondary, 0.6),
    },
  },
  '&::-webkit-scrollbar-corner': {
    backgroundColor: 'transparent',
  },
}))

export const EmptyRow = styled('div')(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
}))

export const EmptyTableCell = styled(TableCell)({
  border: 0,
  padding: 0,
})
