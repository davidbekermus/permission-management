import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import LockIcon from "@mui/icons-material/Lock";

export const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 900,
}));

export const FormRow = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: "wrap",
}));

export const UnauthorizedContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 300,
  gap: theme.spacing(2),
}));
export const UnauthorizedIcon = styled(LockIcon)(({ theme }) => ({
  fontSize: 48,
  color: theme.palette.text.disabled,
}));
export const PriceField = styled(TextField)({ width: 120 });
export const EmptyMessage = styled(Typography)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  textAlign: "center",
}));
