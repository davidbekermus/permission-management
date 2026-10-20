# Permission Management UI

This folder is the copyable UI. It contains components, separate `.style.tsx`
files, UI types, role formatting/selection rules, and local form/editing state.
It does not import this app's auth, HTTP client, query hooks, router, or snackbar
provider. All components are arrow functions. Keep styling in style files.

## Folder boundary

- `permissionManagement/`: copy this folder into the target app.
- `../permissionManagementIntegration/`: host-specific containers, view hooks,
  query hooks, API services, authentication checks, debounce, and notifications.
  Adapt or replace this sibling folder for the target app; do not copy it as UI.

Shared role and row types stay with the UI because they define the UI's input
contract. Map the target backend's data to these types in its integration layer.

## Connect the target app

The target needs React, React DOM, MUI Material and icons, Emotion, and a matching
MUI theme. The UI itself does not require Axios, React Query, Notistack, or a router.

`users/view.types.ts` exports `UsersViewModel` and
`roleSubmissions/view.types.ts` exports `PermissionRequestsViewModel`. Implement
host hooks returning these models. They group filters, table rows, pagination,
permission flags, dialog state, and callbacks. The existing sibling integration
folder is a working example.

Wrap each view in a host container:

```tsx
const TargetUsersContainer = ({ toolbarContainer }: {
  toolbarContainer: HTMLDivElement | null
}) => {
  const view: UsersViewModel = useTargetUsersView()
  return <UsersView toolbarContainer={toolbarContainer} view={view} />
}
```

Do the same for `PermissionRequestsView`, using `PermissionRequestsViewModel`.
Then mount the UI page from the host route:

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

## Callback and notification contracts

Mutation callbacks returning `Promise<boolean>` must resolve `true` on success
and `false` after handled failure. The host handles errors and notifications.
Dialogs and editors reset or close only after success.

`AddUserDialog.onRoleSelectionNotice(message)` lets the host display explanatory
messages when role selections conflict. The existing integration uses Notistack;
the target can use its own notification system.

Table pagination uses `shared/table.types.ts`, independent of query libraries.
Supply `onLoadMore` and loading/error flags from the target's data layer.

## Layout and theme

The host must provide a bounded height with `minHeight: 0` through flex wrappers.
The page fills that parent and the table scrolls internally. It does not assume
the target app's header height. Theme tokens and global component overrides live
outside this folder; supply the target theme when mounting the UI.

## Verification

From `client/`, run `npm run build` and `npm test`. Tests exercise host containers
and verify the copyable UI has no imports into host-specific infrastructure.
