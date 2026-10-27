
const products = [
    { id: 1, name: "Wireless Headphones", category: "Electronics", price: 1499},
    { id: 2, name: "Smart Watch", category: "Electronics", price: 2499},
    { id: 3, name: "Running Shoes", category: "Fashion", price: 1799},
    { id: 4, name: "T-Shirt", category: "Fashion", price: 599},
    { id: 5, name: "Backpack", category: "Accessories", price: 999},
    { id: 6, name: "Sunglasses", category: "Accessories", price: 799 },
    { id: 7, name: "Bluetooth Speaker", category: "Electronics", price: 1299 },
    { id: 8, name: "Jacket", category: "Fashion", price: 2199 }
];

let cart = [];
let couponApplied = false;

const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");

const subtotalElement = document.getElementById("subtotal");
const discountElement = document.getElementById("discount");
const totalElement = document.getElementById("total");

const categoryFilter = document.getElementById("category-filter");
const sortFilter = document.getElementById("sort-filter");

const couponInput = document.getElementById("coupon-input");
const couponMessage = document.getElementById("coupon-message");

const checkoutSection = document.getElementById("checkout-section");
const checkoutTotal = document.getElementById("checkout-total");
const orderMessage = document.getElementById("order-message");

function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function displayProducts() {
    const category = categoryFilter.value;
    const sort = sortFilter.value;

    let filteredProducts = products.filter(product => {
        return category === "all" || product.category === category;
    });

    if (sort === "low-high") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === "high-low") {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    productList.innerHTML = "";

    filteredProducts.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <div class="product-icon">${product.icon}</div>
            <h3>${product.name}</h3>
            <p class="category">${product.category}</p>
            <p class="price">${formatPrice(product.price)}</p>
            <button class="add-btn">Add to Cart</button>
        `;

        card.querySelector(".add-btn").addEventListener("click", () => {
            addToCart(product.id);
        });

        productList.appendChild(card);
    });

    if (filteredProducts.length === 0) {
        productList.textContent = "No products found.";
    }
}

function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        const product = products.find(item => item.id === productId);

        cart.push({
            ...product,
            quantity: 1
        });
    }

    couponApplied = false;
    couponMessage.textContent = "";
    updateCart();
}

// 3. Change quantity
function changeQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    couponApplied = false;
    couponMessage.textContent = "";
    updateCart();
}

// 4. Remove product completely
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);

    couponApplied = false;
    couponMessage.textContent = "";

    updateCart();
}

function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => {
        return sum + item.price * item.quantity;
    }, 0);

    const discount = couponApplied ? subtotal * 0.10 : 0;
    const total = subtotal - discount;

    return { subtotal, discount, total };
}

function updateCart() {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML =
            '<p class="empty-message">Your cart is empty.</p>';
    }

    cart.forEach(item => {
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <div class="cart-item-info">
                <strong>${item.name}</strong>
                <p>${formatPrice(item.price)} each</p>

                <div class="quantity-controls">
                    <button class="decrease-btn">−</button>
                    <span>${item.quantity}</span>
                    <button class="increase-btn">+</button>
                </div>
            </div>

            <div>
                <strong>${formatPrice(item.price * item.quantity)}</strong>
                <br><br>
                <button class="remove-btn">Remove</button>
            </div>
        `;

        cartItem.querySelector(".decrease-btn").addEventListener("click", () => {
            changeQuantity(item.id, -1);
        });

        cartItem.querySelector(".increase-btn").addEventListener("click", () => {
            changeQuantity(item.id, 1);
        });

        cartItem.querySelector(".remove-btn").addEventListener("click", () => {
            removeFromCart(item.id);
        });

        cartItems.appendChild(cartItem);
    });

    const { subtotal, discount, total } = calculateTotals();

    const totalQuantity = cart.reduce((sum, item) => {
        return sum + item.quantity;
    }, 0);

    cartCount.textContent = totalQuantity;
    subtotalElement.textContent = formatPrice(subtotal);
    discountElement.textContent = formatPrice(discount);
    totalElement.textContent = formatPrice(total);
    checkoutTotal.textContent = formatPrice(total);
}

// 7. Apply coupon
document.getElementById("apply-coupon").addEventListener("click", () => {
    const code = couponInput.value.trim().toUpperCase();

    if (cart.length === 0) {
        couponApplied = false;
        couponMessage.textContent = "Add products before applying a coupon.";
        couponMessage.style.color = "red";
    } else if (code === "SAVE10") {
        couponApplied = true;
        couponMessage.textContent = "Coupon applied! You saved 10%.";
        couponMessage.style.color = "green";
    } else {
        couponApplied = false;
        couponMessage.textContent = "Invalid coupon code.";
        couponMessage.style.color = "red";
    }

    updateCart();
});

// 8. Filter and sort events
categoryFilter.addEventListener("change", displayProducts);
sortFilter.addEventListener("change", displayProducts);

// 9. Show checkout form
document.getElementById("checkout-btn").addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Your cart is empty. Please add a product first.");
        return;
    }

    checkoutSection.classList.remove("hidden");
    checkoutTotal.textContent = formatPrice(calculateTotals().total);

    checkoutSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// 10. Place order
document.getElementById("checkout-form").addEventListener("submit", event => {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const customerName = document.getElementById("customer-name").value.trim();
    const { total } = calculateTotals();

    orderMessage.textContent =
        `Thank you, ${customerName}! Your order of ${formatPrice(total)} has been placed successfully.`;

    orderMessage.style.color = "green";

    cart = [];
    couponApplied = false;
    couponInput.value = "";
    couponMessage.textContent = "";

    updateCart();

    document.getElementById("checkout-form").reset();
});

displayProducts();
updateCart();
