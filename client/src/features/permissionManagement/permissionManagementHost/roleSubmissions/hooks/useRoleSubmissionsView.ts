import { useState } from "react";
import { useSnackbar } from "notistack";
import { isAxiosError } from "axios";
import {
  canReadPermissionManagement,
  canManagePermissions,
  getCurrentUsername,
  getCurrentRoles,
  isAnomalyAdmin,
  getRolesInAdminScope,
} from "@/app/auth/auth.utils";
import {
  useGetRoleSubmissions,
  useApproveRoleSubmission,
  useRejectRoleSubmission,
  useDeleteRoleSubmission,
  useCreateRoleSubmission,
} from "./useRoleSubmissions";
import { filterRequestableRoles } from "../../../permissionManagementUi/shared/role.utils";
import { useDebounce } from "../../hooks/useDebounce";
import {
  ALL_ROLES,
  type Roles,
  type SortOrder,
} from "../../../permissionManagementUi/shared/types";
import type { PermissionRequestsViewModel } from "../../../permissionManagementUi/roleSubmissions/view.types";
import {
  ALL_STATUSES,
  RoleSubmissionAction,
  RoleSubmissionStatus,
  STATUS_LABELS,
  type RoleSubmissionScope,
} from "../../../permissionManagementUi/roleSubmissions/types";

const STATUS_FILTER_OPTIONS = ALL_STATUSES.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}));

interface PermissionRequestFilters {
  search: string;
  statuses: RoleSubmissionStatus[];
  roles: Roles[];
  sort: SortOrder;
}

const getInitialFilters = (isAdmin: boolean): PermissionRequestFilters => ({
  search: "",
  statuses: isAdmin ? [RoleSubmissionStatus.PENDING] : [],
  roles: [],
  sort: "latest",
});

/** Host integration point for permission requests and their action policies. */
export function useRoleSubmissionsView(): PermissionRequestsViewModel {
  const isAdmin = canReadPermissionManagement();
  const [selectedScope, setSelectedScope] = useState<RoleSubmissionScope>(
    isAdmin ? "review" : "mine",
  );
  const scope = isAdmin ? selectedScope : "mine";
  const [filters, setFilters] = useState<PermissionRequestFilters>(() =>
    getInitialFilters(isAdmin),
  );
  const { search, statuses, roles, sort } = filters;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const filterCount =
    statuses.length + roles.length + (sort !== "latest" ? 1 : 0);
  const roleOptions = scope === "review" ? getRolesInAdminScope() : ALL_ROLES;
  const username = getCurrentUsername();
  const canReview = scope === "review" && canManagePermissions();
  const query = useGetRoleSubmissions(
    {
      search: scope === "review" ? debouncedSearch : "",
      statuses,
      roles,
      sort,
    },
    scope,
  );
  const approve = useApproveRoleSubmission();
  const reject = useRejectRoleSubmission();
  const remove = useDeleteRoleSubmission();
  const createSubmission = useCreateRoleSubmission();
  const { enqueueSnackbar } = useSnackbar();
  const submissions = query.data?.pages.flat() ?? [];
  const isActionPending =
    approve.isPending || reject.isPending || remove.isPending;

  const runAction = async (
    action: () => Promise<unknown>,
    success: string,
    failure: string,
  ) => {
    if (isActionPending) return false;
    try {
      await action();
      enqueueSnackbar(success, { variant: "success" });
      return true;
    } catch {
      enqueueSnackbar(failure, { variant: "error" });
      return false;
    }
  };

  const rows = submissions.map((submission) => ({
    submission,
    actions: {
      canApprove:
        canReview &&
        [RoleSubmissionStatus.PENDING, RoleSubmissionStatus.REJECTED].includes(
          submission.status,
        ),
      canReject:
        canReview && submission.status === RoleSubmissionStatus.PENDING,
      canDelete:
        submission.username === username &&
        submission.status === RoleSubmissionStatus.PENDING,
      isPending: isActionPending,
      isDeleting: remove.isPending && remove.variables === submission._id,
      onApprove: () => {
        void runAction(
          () => approve.mutateAsync(submission._id),
          "Permission request approved",
          "Failed to approve permission request",
        );
      },
      onReject: () => {
        void runAction(
          () => reject.mutateAsync(submission._id),
          "Permission request rejected",
          "Failed to reject permission request",
        );
      },
      onDelete: () =>
        runAction(
          () => remove.mutateAsync(submission._id),
          "Permission request deleted",
          "Failed to delete permission request",
        ),
    },
  }));

  const changeScope = (nextScope: RoleSubmissionScope) => {
    setSelectedScope(nextScope);
    setFilters(getInitialFilters(isAdmin));
  };

  const handleCreateSubmission = async (roles: Roles[]) => {
    try {
      const created = await createSubmission.mutateAsync({
        roles,
        action: RoleSubmissionAction.ADDITION,
      });
      enqueueSnackbar(
        `${created.length} permission ${created.length === 1 ? "request" : "requests"} submitted`,
        { variant: "success" },
      );
      changeScope("mine");
      return true;
    } catch (error) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      enqueueSnackbar(message || "Failed to submit permission request", {
        variant: "error",
      });
      return false;
    }
  };

  return {
    isAdmin,
    scope,
    statuses,
    changeScope,
    openCreateDialog: () => setCreateDialogOpen(true),
    removeStatus: (status: RoleSubmissionStatus) => {
      setFilters((current) => ({
        ...current,
        statuses: current.statuses.filter((item) => item !== status),
      }));
    },
    filters: {
      showSearch: scope === "review",
      search,
      onSearchChange: (value: string) =>
        setFilters((current) => ({ ...current, search: value })),
      filterCount,
      appliedRoles: roles,
      appliedSort: sort,
      roleOptions,
      statusOptions: STATUS_FILTER_OPTIONS,
      appliedStatuses: statuses,
      onApply: (
        selectedRoles: Roles[],
        selectedSort: SortOrder,
        selectedStatuses: RoleSubmissionStatus[],
      ) => {
        setFilters((current) => ({
          ...current,
          roles: selectedRoles,
          sort: selectedSort,
          statuses: selectedStatuses,
        }));
      },
    },
    table: {
      rows,
      showReviewActions: canReview,
      showControls: canReview || rows.some((row) => row.actions.canDelete),
      isLoading: query.isLoading && !query.data,
      isError: query.isError && !query.data,
      pagination: {
        hasNextPage: query.hasNextPage,
        isFetching: query.isFetching,
        isError: query.isFetchNextPageError,
        enabled: !query.isPlaceholderData,
        onLoadMore: query.fetchNextPage,
      },
    },
    createDialog: {
      open: createDialogOpen,
      onClose: () => setCreateDialogOpen(false),
      availableRoles: filterRequestableRoles(ALL_ROLES, getCurrentRoles()),
      hasHighestAccess: isAnomalyAdmin(),
      isPending: createSubmission.isPending,
      onSubmit: handleCreateSubmission,
    },
  };
}
