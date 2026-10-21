# Permission Management

This folder wraps the reusable UI and this app's host integration.
`permissionManagementUi/` contains components, separate `.style.tsx` files, UI
types, role formatting/selection rules, and local form/editing state. The UI does
not import app auth, HTTP clients, query hooks, routing, or snackbar providers.
React components use arrow functions. Keep styling in separate style files.

## Folder boundary

- `permissionManagementUi/`: copy this subfolder into the target app.
- `permissionManagementHost/`: host-specific containers, view hooks,
  query hooks, API services, authentication checks, debounce, and notifications.
  Adapt or replace this subfolder for the target app; do not copy it as UI.

Shared role and row types stay with the UI because they define the UI's input
contract. Map the target backend's data to these types in its integration layer.

## Connect the target app

The target needs React, React DOM, MUI Material and icons, Emotion, and a matching
MUI theme. The UI itself does not require Axios, React Query, Notistack, or a router.

`permissionManagementUi/users/view.types.ts` exports `UsersViewModel` and
`permissionManagementUi/roleSubmissions/view.types.ts` exports
`PermissionRequestsViewModel`. Implement host hooks returning these models. They group filters, table rows, pagination,
permission flags, dialog state, and callbacks. The existing host
subfolder is a working example.

Wrap each view in a host container:

```tsx
const TargetUsersContainer = ({
  toolbarContainer,
}: {
  toolbarContainer: HTMLDivElement | null;
}) => {
  const view: UsersViewModel = useTargetUsersView();
  return <UsersView toolbarContainer={toolbarContainer} view={view} />;
};
```

Do the same for `PermissionRequestsView`, using `PermissionRequestsViewModel`.
Then mount the UI page from the target's host route. In this example,
`PermissionManagementPage` is imported from
`permissionManagementUi/PermissionManagementPage.tsx`:

```tsx
<PermissionManagementPage
  view={activeView}
  onViewChange={navigateToView}
  canViewUsers={canReadUsers}
  renderUsers={(toolbarContainer) => (
    <TargetUsersContainer toolbarContainer={toolbarContainer} />
  )}
  renderSubmissions={(toolbarContainer) => (
    <TargetRequestsContainer toolbarContainer={toolbarContainer} />
  )}
/>
```

`activeView` is `'users'` or `'submissions'`. The host owns routing and auth.
When `canViewUsers` is false, the page renders only submissions. Only the active
container mounts, so inactive queries and local filter state behave as before.
Server-side permission enforcement remains the host/backend's responsibility.

## Current app entry point

The router imports `PermissionManagementPage` from
`@/features/permissionManagement/permissionManagementHost/PermissionManagementPage`.
That host component imports the UI page as `PermissionManagementUI` and connects
it to auth and the two view hooks. Both entry files keep the name
`PermissionManagementPage.tsx`; their folders distinguish their responsibilities.

The host relies on `@/app/auth/auth.utils`, `@/app/api/axiosClient`, React Query,
and Notistack. This app supplies the required providers in `client/src/main.tsx`.
When porting, update the host imports and map target records into the UI types.
The UI uses relative imports within its own folder.

## Callback and notification contracts

Mutation callbacks returning `Promise<boolean>` must resolve `true` on success
and `false` after handled failure. The host handles errors and notifications.
Dialogs and editors reset or close only after success.

`AddUserDialog.onRoleSelectionNotice(message)` lets the host display explanatory
messages when role selections conflict. The existing host uses Notistack;
the target can use its own notification system.

Table pagination uses `permissionManagementUi/shared/table.types.ts`,
independent of query libraries.
Supply `onLoadMore` and loading/error flags from the target's data layer.

## Layout and theme

The host must provide a bounded height with `minHeight: 0` through flex wrappers.
The UI page fills that parent and the table scrolls internally. It does not
assume the target app's header height. The host's
`PermissionManagementPage.style.tsx` currently sets `PageFrame` to
`calc(100vh - 50px)`; adapt that host-specific height to the target layout.
Theme tokens and global component overrides live
in `client/src/app/theme/theme.ts`; supply the target theme when mounting the UI.

## Verification

From `client/`, run `npm run build` and `npm test`. Tests exercise host containers
and verify the copyable UI has no imports into host-specific infrastructure.
