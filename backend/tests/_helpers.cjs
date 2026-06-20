/**
 * Test helpers — lightweight mocks for backend unit tests.
 */

function mockAdmin (overrides = {}) {
  const tables = {}

  function table (name) {
    if (!tables[name]) {
      tables[name] = { rows: [], filters: [] }
    }

    const state = tables[name]
    const api = {
      select () { return api },
      insert (row) {
        const payload = Array.isArray(row) ? row : [row]
        const inserted = payload.map((r, i) => ({ id: `mock-${name}-${i}`, ...r }))
        state.rows.push(...inserted)
        return {
          select () {
            return { single: async () => ({ data: inserted[0], error: null }) }
          },
        }
      },
      update (patch) {
        return { eq: async () => ({ error: null, data: patch }) }
      },
      delete () { return { in: async () => ({ error: null }) } },
      eq () { return api },
      neq () { return api },
      gte () { return api },
      lte () { return api },
      is () { return api },
      not () { return api },
      in () { return api },
      or () { return api },
      ilike () { return api },
      contains () { return api },
      order () { return api },
      limit () { return api },
      maybeSingle: async () => ({ data: state.rows[0] ?? null, error: null }),
      single: async () => ({ data: state.rows[0] ?? null, error: null }),
      then (resolve) {
        return resolve({ data: state.rows, error: null, count: state.rows.length })
      },
    }
    return api
  }

  return {
    from: table,
    auth: {
      admin: {
        updateUserById: async () => ({ error: null }),
        signOut: async () => ({ error: null }),
        getUserById: async () => ({ data: { user: { email: 'test@example.com' } } }),
        deleteUser: async () => ({ error: null }),
      },
    },
    ...overrides,
  }
}

module.exports = { mockAdmin }
