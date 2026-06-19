async function startCheckout() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart }),
  });

  const data = await response.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    alert(data.error || "Checkout failed. Please try again.");
  }
}
