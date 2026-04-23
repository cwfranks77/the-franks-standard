<template>
  <div class="dash-page">
    <div class="container">
      <h1>Dashboard</h1>
      <p class="text-muted">Manage your listings, orders, and account</p>

      <div class="grid grid-3 mt-4">
        <div class="stat-card">
          <p class="stat-label">Active Listings</p>
          <p class="stat-value">0</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Total Sales</p>
          <p class="stat-value">$0.00</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Pending Orders</p>
          <p class="stat-value">0</p>
        </div>
      </div>

      <div class="dash-section mt-4">
        <div class="dash-section-header">
          <h2>My Listings</h2>
          <NuxtLink to="/sell" class="btn btn-primary btn-sm">+ New Listing</NuxtLink>
        </div>
        <div class="empty-state text-center" style="padding: 40px;">
          <p style="font-size: 2rem;">🏛️</p>
          <p class="text-muted mt-1">You haven't listed anything yet.</p>
          <NuxtLink to="/sell" class="btn btn-outline btn-sm mt-2">Create Your First Listing</NuxtLink>
        </div>
      </div>

      <div class="dash-section mt-4">
        <h2>Recent Orders</h2>
        <div class="empty-state text-center" style="padding: 40px;">
          <p class="text-muted">No orders yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dash-page { padding: 40px 0; }
.dash-page h1 { font-size: 2rem; }
.stat-card {
  padding: 24px;
  background: var(--stone-900);
  border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg);
  text-align: center;
}
.stat-label { font-size: 0.85rem; color: var(--stone-400); margin-bottom: 6px; }
.stat-value { font-size: 2rem; font-weight: 700; color: var(--gold); font-family: 'Cinzel', serif; }
.dash-section {
  background: var(--stone-900);
  border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg);
  padding: 24px;
}
.dash-section h2 { font-size: 1.2rem; color: var(--gold); }
.dash-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>
