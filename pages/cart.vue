<script setup lang="ts">
import { BC_BRAND } from '~/utils/bcBrand.js'

definePageMeta({ layout: 'bc-audio' })

const { cart, removeItem, clear, subtotal, itemCount } = useCart()

useHead({
  title: `Your cart · ${BC_BRAND.short}`,
})
</script>

<template>
  <div class="bc-cart-page">
    <header class="bc-cart-page__head">
      <h1>Your cart</h1>
      <p v-if="itemCount">{{ itemCount }} item{{ itemCount === 1 ? '' : 's' }}</p>
    </header>

    <p v-if="!cart.length" class="bc-cart-page__empty">
      Your cart is empty.
      <NuxtLink to="/bc-audio">Browse products →</NuxtLink>
    </p>

    <ul v-else class="bc-cart-page__list">
      <li v-for="item in cart" :key="item.id" class="bc-cart-page__item">
        <div class="bc-cart-page__item-copy">
          <strong>{{ item.name }}</strong>
          <span v-if="item.sku" class="bc-cart-page__sku">SKU {{ item.sku }}</span>
          <span class="bc-cart-page__qty">Qty {{ item.qty || 1 }}</span>
        </div>
        <div class="bc-cart-page__item-side">
          <span class="bc-cart-page__price">${{ (Number(item.price) * (item.qty || 1)).toFixed(2) }}</span>
          <button type="button" class="bc-cart-page__remove" @click="removeItem(item.id)">Remove</button>
        </div>
      </li>
    </ul>

    <footer v-if="cart.length" class="bc-cart-page__foot">
      <p class="bc-cart-page__total">Subtotal: <strong>${{ subtotal.toFixed(2) }}</strong></p>
      <p class="bc-cart-page__note">Tax and shipping are calculated at checkout.</p>
      <div class="bc-cart-page__actions">
        <NuxtLink to="/bc-audio/catalog" class="bc-cart-page__btn bc-cart-page__btn--secondary">Keep shopping</NuxtLink>
        <NuxtLink to="/bc-audio/catalog" class="bc-cart-page__btn">Checkout from catalog →</NuxtLink>
      </div>
      <button type="button" class="bc-cart-page__clear" @click="clear">Clear cart</button>
    </footer>
  </div>
</template>

<style scoped>
.bc-cart-page {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
  color: #f5f5f7;
}
.bc-cart-page__head h1 {
  margin: 0 0 6px;
  font-size: 1.75rem;
}
.bc-cart-page__head p {
  margin: 0;
  color: #9ca3af;
  font-size: 0.9rem;
}
.bc-cart-page__empty {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: #16161c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #b8bcc6;
}
.bc-cart-page__empty a {
  display: inline-block;
  margin-top: 10px;
  color: #ff5252;
  font-weight: 700;
  text-decoration: none;
}
.bc-cart-page__list {
  list-style: none;
  margin: 1.5rem 0 0;
  padding: 0;
  display: grid;
  gap: 12px;
}
.bc-cart-page__item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 14px 16px;
  border-radius: 12px;
  background: #16161c;
  border: 1px solid rgba(211, 47, 47, 0.22);
}
.bc-cart-page__item-copy strong {
  display: block;
  margin-bottom: 4px;
}
.bc-cart-page__sku,
.bc-cart-page__qty {
  display: block;
  font-size: 0.78rem;
  color: #9ca3af;
}
.bc-cart-page__item-side {
  text-align: right;
  flex-shrink: 0;
}
.bc-cart-page__price {
  display: block;
  font-weight: 800;
  color: #ffd814;
  margin-bottom: 8px;
}
.bc-cart-page__remove {
  border: none;
  background: none;
  color: #ff5252;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}
.bc-cart-page__foot {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.bc-cart-page__total {
  margin: 0 0 6px;
  font-size: 1.1rem;
}
.bc-cart-page__note {
  margin: 0 0 1rem;
  font-size: 0.82rem;
  color: #9ca3af;
}
.bc-cart-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.bc-cart-page__btn {
  display: inline-block;
  padding: 12px 18px;
  border-radius: 10px;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: #fff;
  font-weight: 800;
  text-decoration: none;
}
.bc-cart-page__btn--secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #f5f5f7;
}
.bc-cart-page__clear {
  margin-top: 12px;
  border: none;
  background: none;
  color: #9ca3af;
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
}
</style>
