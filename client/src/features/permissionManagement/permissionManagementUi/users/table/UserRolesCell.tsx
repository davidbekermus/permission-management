import { useEffect, useState } from "react";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import { UserRoleChip } from "./UserRoleChip";
import type { Roles } from "../../shared/types";
import { formatRole } from "../../shared/role.utils";
import {
  AssignRoleRow,
  RoleChipsBox,
  StyledFormControl,
} from "./UsersTable.style";
import type { User } from "../types";

interface UserRolesCellProps {
  user: User;
  availableRoles: Roles[];
  hasHighestAccess: boolean;
  isEditing: boolean;
  canManage: boolean;
  isAssigning: boolean;
  isRemoving: boolean;
  onAssignRole: (username: string, role: Roles) => Promise<boolean>;
  onRemoveRole: (username: string, role: Roles) => Promise<boolean>;
  onDone: () => void;
}

export const UserRolesCell = ({
  user,
  availableRoles,
  hasHighestAccess,
  isEditing,
  canManage,
  onDone,
  isAssigning,
  isRemoving,
  onAssignRole,
  onRemoveRole,
}: UserRolesCellProps) => {
  const [selectedRole, setSelectedRole] = useState<Roles | "">("");

  useEffect(() => {
    if (isEditing) setSelectedRole("");
  }, [isEditing]);

  const handleAssign = async () => {
    if (!selectedRole || isAssigning) return;
    if (await onAssignRole(user.username, selectedRole)) {
      setSelectedRole("");
      onDone();
    }
  };

  const handleDone = () => {
    setSelectedRole("");
    onDone();
  };

  return (
    <TableCell>
      <RoleChipsBox>
        {user.roles.length === 0 && (
          <Typography variant="caption" color="text.disabled">
            No roles
          </Typography>
        )}
        {user.roles.map((entry) => (
          <UserRoleChip
            key={entry.role}
            role={entry.role}
            disabled={isRemoving}
            onDelete={
              canManage && isEditing
                ? () => {
                    if (!isRemoving)
                      void onRemoveRole(user.username, entry.role);
                  }
                : undefined
            }
          />
        ))}
      </RoleChipsBox>

      <Collapse in={isEditing}>
        <AssignRoleRow>
          {hasHighestAccess ? (
            <Typography
              variant="caption"
              color="text.secondary"
              fontStyle="italic"
            >
              This user already has the highest level of access.
            </Typography>
          ) : (
            <>
              <StyledFormControl size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  value={selectedRole}
                  onChange={(event) =>
                    setSelectedRole(event.target.value as Roles)
                  }
                >
                  {availableRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {formatRole(role)}
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
              <Button
                color="success"
                size="small"
                variant="contained"
                disabled={!selectedRole || isAssigning}
                onClick={handleAssign}
              >
                Add
              </Button>
            </>
          )}
          <Button size="small" color="inherit" onClick={handleDone}>
            Done
          </Button>
        </AssignRoleRow>
      </Collapse>
    </TableCell>
  );
};
