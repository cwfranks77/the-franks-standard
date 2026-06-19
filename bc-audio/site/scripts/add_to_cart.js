function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));

  const goBtn = document.getElementById("go-to-cart-btn");
  if (goBtn) goBtn.style.display = "inline-block";

  if (typeof flashGoToCart === "function") {
    flashGoToCart();
    return;
  }

  window.location.href = "/bc-audio/cart";
}

function flashGoToCart() {
  const goBtn = document.getElementById("go-to-cart-btn");
  if (goBtn) goBtn.style.display = "inline-block";
}
