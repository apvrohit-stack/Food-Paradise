
function OrderSection({ cart, onOrderComplete }) {
  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * item.quantity,
    0
  );

  const cgst = subtotal * 0.025;
  const sgst = subtotal * 0.025;
  const grandTotal = subtotal + cgst + sgst;

  function placeOrder() {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const invalidItems = cart.filter(
      item =>
        !Number.isFinite(Number(item.price)) ||
        Number(item.price) <= 0
    );

    if (invalidItems.length > 0) {
      alert(
        "Please add a valid price for: " +
        invalidItems.map(item => item.name).join(", ")
      );
      return;
    }

    const order = {
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        calories: item.calories
      })),
      subtotal,
      cgst,
      sgst,
      grandTotal,
      date: new Date().toLocaleString()
    };

    onOrderComplete(order);
  }

  return (
    <div className="order-section">
      <div className="order-summary">
        <h2>Order Summary</h2>
        <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
        <p>CGST (2.5%): ₹{cgst.toFixed(2)}</p>
        <p>SGST (2.5%): ₹{sgst.toFixed(2)}</p>
        <h3>Grand Total: ₹{grandTotal.toFixed(2)}</h3>

        <button
          type="button"
          className="checkout-button"
          onClick={placeOrder}
        >
          Proceed
        </button>
      </div>
    </div>
  );
}

export default OrderSection;
