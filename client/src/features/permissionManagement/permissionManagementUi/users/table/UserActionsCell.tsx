import TableCell from "@mui/material/TableCell";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import type { User } from "../types";

interface UserActionsCellProps {
  user: User;
  canManageRoles: boolean;
  isEditing: boolean;
  onManage: (username: string) => void;
}

export const UserActionsCell = ({
  user,
  canManageRoles,
  isEditing,
  onManage,
}: UserActionsCellProps) => {
  return (
    <TableCell align="right">
      <Tooltip title={canManageRoles ? "Manage roles" : "Nothing to manage"}>
        <span>
          <IconButton
            size="small"
            disabled={!canManageRoles}
            aria-label={`Manage roles for ${user.username}`}
            aria-expanded={isEditing}
            onClick={() => onManage(user.username)}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </TableCell>
  );
};
