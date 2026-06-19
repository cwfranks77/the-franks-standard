const cartContainer = document.getElementById("cart-items");
const cart = JSON.parse(localStorage.getItem("cart") || "[]");

function renderCart() {
  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cartContainer.innerHTML = cart
    .map(
      item => `
      <div class="cart-item">
        <h3>${item.name}</h3>
        <p>Price: $${item.price}</p>
      </div>
    `
    )
    .join("");
}

renderCart();
