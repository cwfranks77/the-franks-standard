<script setup>
const { items, removeItem, clearCart } = useCart()
</script>

<template>
  <div class="cart-page">
    <header class="cart-page__head">
      <h1>Cart</h1>
      <button v-if="items.length" type="button" class="cart-page__clear" @click="clearCart">
        Clear cart
      </button>
    </header>

    <p v-if="!items.length" class="cart-page__empty">Your cart is empty.</p>

    <ul v-else class="cart-page__list">
      <li v-for="item in items" :key="item.id" class="cart-page__item">
        <div class="cart-page__item-main">
          <p class="cart-page__name">{{ item.name }}</p>
          <p class="cart-page__sku">SKU: {{ item.sku }}</p>
          <p class="price">Price: Contact for pricing</p>
          <p class="cart-page__qty">Qty: {{ item.quantity }}</p>
        </div>
        <button type="button" class="cart-page__remove" @click="removeItem(item.id)">
          Remove
        </button>
      </li>
    </ul>

    <footer v-if="items.length" class="cart-page__summary">
      <p class="summary-line total">
        <span>Total</span>
        <span>Contact for pricing</span>
      </p>
    </footer>
  </div>
</template>

<style scoped>
.cart-page {
  max-width: 42rem;
  margin: 0 auto;
  padding: 2rem 1.25rem;
}
.cart-page__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.cart-page__head h1 {
  margin: 0;
  font-size: 1.5rem;
}
.cart-page__clear {
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
.cart-page__empty {
  color: #666;
}
.cart-page__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cart-page__item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}
.cart-page__name {
  margin: 0 0 4px;
  font-weight: 700;
}
.cart-page__sku,
.cart-page__qty,
.price {
  margin: 0;
  font-size: 0.9rem;
}
.cart-page__remove {
  align-self: flex-start;
  border: none;
  background: transparent;
  color: #b91c1c;
  cursor: pointer;
}
.cart-page__summary {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
.summary-line.total {
  display: flex;
  justify-content: space-between;
  margin: 0;
  font-weight: 800;
}
</style>
