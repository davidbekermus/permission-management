const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

// Render the real view containers with controlled queries and presentational leaves.
function renderView(kind, { admin = true, records = [], fail = false } = {}) {
  const props = {}
  const calls = []
  const messages = []
  const query = {
    data: { pages: [records.slice(0, 1), records.slice(1)] },
    hasNextPage: true, isLoading: false, isError: false,
    isFetching: false, isFetchNextPageError: false, isPlaceholderData: false,
    fetchNextPage: async () => { calls.push(['loadMore']) },
  }
  const mutation = (name) => ({
    isPending: false,
    reset() {},
    async mutateAsync(value) {
      calls.push([name, value])
      if (fail) throw new Error('Request failed')
      return [{ _id: 'created' }]
    },
  })
  const hooks = {
    useGetUsers: () => query,
    useGetRoleSubmissions: (...args) => { calls.push(['query', ...args]); return query },
    useAssignRole: () => mutation('assign'),
    useRemoveRole: () => mutation('remove'),
    useCreateUsers: () => mutation('createUsers'),
    useApproveRoleSubmission: () => mutation('approve'),
    useRejectRoleSubmission: () => mutation('reject'),
    useDeleteRoleSubmission: () => mutation('delete'),
    useCreateRoleSubmission: () => mutation('createSubmission'),
  }
  const auth = {
    canManagePermissions: () => admin,
    canReadPermissionManagement: () => admin,
    getCurrentUsername: () => 'me',
    getCurrentRoles: () => ['STORE_USER'],
    isAnomalyAdmin: () => admin,
    getRolesInAdminScope: () => ['ANOMALY_ADMIN', 'STORE_ADMIN', 'STORE_USER', 'PRODUCT_ADMIN', 'PRODUCT_USER'],
  }
  function leaf(name) {
    return function Leaf(value) {
      props[name] = value
      return React.createElement(React.Fragment, null, value.children)
    }
  }
  function load(filename) {
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    }).outputText
    const exports = {}
    new Function('require', 'exports', output)((name) => {
      if (name === 'react' || name === 'react/jsx-runtime') return require(name)
      if (name === 'react-dom') return { createPortal: children => children }
      if (name === 'notistack') return { useSnackbar: () => ({ enqueueSnackbar: (...args) => messages.push(args) }) }
      if (name === 'axios') return { isAxiosError: () => false }
      if (name.includes('auth.utils')) return auth
      if (['./hooks/useUsersView', './hooks/useRoleSubmissionsView'].includes(name)) return load(path.resolve(path.dirname(filename), name + '.ts'))
      if (name.endsWith('/useUsers') || name.endsWith('/useRoleSubmissions')) return hooks
      if (name.includes('useDebounce')) return { useDebounce: value => value }
      if (name.endsWith('/types') || name.endsWith('/role.utils')) return load(path.resolve(path.dirname(filename), name + '.ts'))
      if (name.startsWith('@mui/')) return { __esModule: true, default: leaf(name) }
      return new Proxy({}, { get: (_, key) => leaf(key) })
    }, exports)
    return exports
  }
  const file = kind === 'users' ? 'users/UsersView.tsx' : 'roleSubmissions/RoleSubmissionsView.tsx'
  const view = load(path.resolve(__dirname, '../src/features/permissionManagement', file))
  renderToStaticMarkup(React.createElement(view[kind === 'users' ? 'UsersView' : 'PermissionRequestsView'], { toolbarContainer: null }))
  return { props, calls, messages, query }
}

test('users container aggregates pages, supplies pagination and performs role/create actions', async () => {
  const ctx = renderView('users', { records: [
    { _id: '1', username: 'first', roles: [{ role: 'STORE_USER' }] },
    { _id: '2', username: 'second', roles: [{ role: 'ANOMALY_ADMIN' }] },
  ] })
  const table = ctx.props.UsersTable
  assert.equal(table.rows.length, 2)
  assert.equal(table.rows[1].hasHighestAccess, true)
  assert.deepEqual(table.rows[1].availableRoles, [])
  assert.equal(table.rows[0].availableRoles.includes('STORE_USER'), false)
  assert.equal(table.pagination.onLoadMore, ctx.query.fetchNextPage)
  assert.equal(await table.onAssignRole('first', 'PRODUCT_USER'), true)
  assert.equal(await table.onRemoveRole('first', 'STORE_USER'), true)
  assert.equal(await ctx.props.AddUserDialog.onSubmit(['new', 'existing'], ['STORE_USER']), true)
  assert.deepEqual(ctx.calls[0], ['assign', { username: 'first', role: 'PRODUCT_USER' }])
  assert.match(ctx.messages[2][0], /1 created, 1 existing user was skipped/)
})

test('failed user operations report failure so the UI can preserve form/editor state', async () => {
  const ctx = renderView('users', { fail: true })
  assert.equal(await ctx.props.UsersTable.onAssignRole('me', 'STORE_USER'), false)
  assert.equal(await ctx.props.AddUserDialog.onSubmit(['new'], ['STORE_USER']), false)
  assert.equal(ctx.messages.every(([, options]) => options.variant === 'error'), true)
})

test('review container supplies status-specific actions and handles deletion and creation', async () => {
  const ctx = renderView('requests', { records: [
    { _id: '1', username: 'me', status: 'PENDING' },
    { _id: '2', username: 'other', status: 'REJECTED' },
    { _id: '3', username: 'other', status: 'APPROVED' },
  ] })
  const table = ctx.props.RoleSubmissionsTable
  assert.equal(table.showReviewActions, true)
  assert.equal(table.rows.length, 3)
  assert.equal(table.rows[0].actions.canDelete, true)
  assert.equal(table.rows[1].actions.canApprove, true)
  assert.equal(table.rows[1].actions.canReject, false)
  assert.equal(table.rows[2].actions.canApprove, false)
  assert.equal(table.rows[2].actions.canDelete, false)
  assert.equal(table.pagination.onLoadMore, ctx.query.fetchNextPage)
  assert.equal(await table.rows[0].actions.onDelete(), true)
  assert.equal(await ctx.props.CreateRoleSubmissionDialog.onSubmit(['PRODUCT_USER']), true)
  assert.deepEqual(ctx.calls.at(-1), ['createSubmission', { roles: ['PRODUCT_USER'], action: 'ADDITION' }])
})

test('personal scope hides review actions and failed deletion does not confirm success', async () => {
  const ctx = renderView('requests', { admin: false, fail: true, records: [
    { _id: '1', username: 'me', status: 'PENDING' },
  ] })
  assert.equal(ctx.calls[0][2], 'mine')
  const actions = ctx.props.RoleSubmissionsTable.rows[0].actions
  assert.equal(ctx.props.RoleSubmissionsTable.showReviewActions, false)
  assert.equal(actions.canApprove, false)
  assert.equal(actions.canDelete, true)
  assert.equal(await actions.onDelete(), false)
  assert.equal(await ctx.props.CreateRoleSubmissionDialog.onSubmit(['PRODUCT_USER']), false)
  assert.equal(ctx.messages.every(([, options]) => options.variant === 'error'), true)
})

// Exercise the real API wrapper and mutation hook for both supported batch sizes.
test('one creation hook posts one or many users to POST /users and invalidates both lists', async () => {
  const posts = []
  const invalidated = []
  function evaluate(filename, dependencies) {
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText
    const exports = {}
    new Function('require', 'exports', code)(name => {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`)
      return dependencies[name]
    }, exports)
    return exports
  }
  const base = path.resolve(__dirname, '../src/features/permissionManagement/users')
  const { usersApi } = evaluate(path.join(base, 'services/usersApi.ts'), {
    '@/app/api/axiosClient': {
      apiClient: {
        post: async (url, body) => {
          posts.push({ url, body })
          return { data: body.usernames.map(username => ({ username })) }
        },
      },
    },
  })
  const hooks = evaluate(path.join(base, 'hooks/useUsers.ts'), {
    '@tanstack/react-query': {
      useQueryClient: () => ({ invalidateQueries: async ({ queryKey }) => invalidated.push(queryKey) }),
      useMutation: options => options,
    },
    '@/app/auth/auth.utils': {},
    '../services/usersApi': { usersApi },
  })
  const mutation = hooks.useCreateUsers()
  for (const usernames of [['one'], ['first', 'second']]) {
    const body = { usernames, roles: ['STORE_USER'] }
    const created = await mutation.mutationFn(body)
    assert.equal(created.length, usernames.length)
    assert.deepEqual(posts.at(-1), { url: '/users', body })
    await mutation.onSuccess()
  }
  assert.deepEqual(invalidated, [['users'], ['roleSubmissions'], ['users'], ['roleSubmissions']])
})
