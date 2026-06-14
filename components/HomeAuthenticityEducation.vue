<template>
  <section class="auth-edu section section-alt" aria-labelledby="auth-edu-heading">
    <div class="container auth-edu-grid">
      <div class="auth-edu-copy">
        <p class="eyebrow">Learn before you buy or sell</p>
        <h2 id="auth-edu-heading">Free authenticity education</h2>
        <p class="auth-edu-lede">{{ AUTH_EDUCATION_INTRO }}</p>
        <p class="text-muted small auth-edu-note">{{ AUTH_EDUCATION_FUTURE_NOTE }}</p>
        <div class="auth-edu-actions">
          <NuxtLink :to="AUTH_EDUCATION_HUB_PATH" class="btn btn-primary btn-sm">
            Browse all free tools
          </NuxtLink>
          <NuxtLink :to="AUTH_EDUCATION_LEARN_PATH" class="btn btn-outline btn-sm">
            Guides &amp; articles
          </NuxtLink>
        </div>
      </div>
      <ul class="auth-edu-links">
        <li v-for="link in AUTH_EDUCATION_LINKS" :key="link.slug">
          <NuxtLink :to="link.path" class="auth-edu-card">
            <span class="auth-edu-icon" aria-hidden="true">{{ link.icon }}</span>
            <span class="auth-edu-card-text">
              <strong>{{ link.title }}</strong>
              <span>{{ link.description }}</span>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import {
  AUTH_EDUCATION_FUTURE_NOTE,
  AUTH_EDUCATION_HUB_PATH,
  AUTH_EDUCATION_INTRO,
  AUTH_EDUCATION_LEARN_PATH,
  AUTH_EDUCATION_LINKS,
} from '~/utils/authenticityEducation.js'
</script>

<style scoped>
.auth-edu-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 28px;
  align-items: start;
}
@media (max-width: 900px) {
  .auth-edu-grid { grid-template-columns: 1fr; }
}
.eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #92400e;
  margin: 0 0 8px;
}
.auth-edu-copy h2 {
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  margin: 0 0 12px;
  color: #111827;
}
.auth-edu-lede {
  font-weight: 600;
  line-height: 1.6;
  color: #111827;
  margin: 0 0 10px;
  max-width: 36rem;
}
.auth-edu-note { line-height: 1.5; max-width: 36rem; }
.auth-edu-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}
.auth-edu-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.auth-edu-card {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.auth-edu-card:hover {
  border-color: var(--gold, #c9a84c);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
.auth-edu-icon { font-size: 1.5rem; flex-shrink: 0; }
.auth-edu-card-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.auth-edu-card-text strong {
  font-size: 0.95rem;
  color: #111827;
}
.auth-edu-card-text span {
  font-size: 0.82rem;
  line-height: 1.45;
  color: #4b5563;
  font-weight: 600;
}
</style>
