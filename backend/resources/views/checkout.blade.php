<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Checkout | Rangriwaaz</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #fffaf1;
            color: #211512;
        }

        .checkout-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .checkout-title {
            text-align: center;
            margin-bottom: 35px;
        }

        .checkout-title h1 {
            margin: 0 0 8px;
            font-size: 32px;
        }

        .checkout-title p {
            margin: 0;
            color: #777;
        }

        .checkout-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 30px;
        }

        .checkout-card {
            background: #fff;
            border-radius: 14px;
            padding: 25px;
            box-shadow: 0 5px 25px rgba(0,0,0,.07);
        }

        .checkout-card h2 {
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 21px;
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group.full {
            grid-column: 1 / -1;
        }

        label {
            display: block;
            margin-bottom: 7px;
            font-size: 14px;
            font-weight: 600;
        }

        input,
        textarea,
        select {
            width: 100%;
            padding: 12px 13px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 15px;
            outline: none;
        }

        textarea {
            min-height: 90px;
            resize: vertical;
        }

        input:focus,
        textarea:focus,
        select:focus {
            border-color: #9f1239;
        }

        .product-box {
            display: flex;
            gap: 15px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }

        .product-box img {
            width: 90px;
            height: 110px;
            object-fit: cover;
            border-radius: 8px;
            background: #f5f5f5;
        }

        .product-info h3 {
            margin: 0 0 8px;
            font-size: 17px;
        }

        .product-price {
            font-weight: 700;
            color: #9f1239;
        }

        .coupon-box {
            display: flex;
            gap: 10px;
            margin: 20px 0;
        }

        .coupon-box input {
            flex: 1;
        }

        .coupon-btn {
            border: 0;
            background: #211512;
            color: #fff;
            padding: 0 18px;
            border-radius: 8px;
            cursor: pointer;
        }

        .coupon-message {
            margin-top: -12px;
            margin-bottom: 15px;
            font-size: 13px;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 9px 0;
        }

        .summary-total {
            border-top: 1px solid #ddd;
            margin-top: 10px;
            padding-top: 15px;
            font-size: 20px;
            font-weight: 700;
        }

        .payment-option {
            border: 1px solid #ddd;
            border-radius: 9px;
            padding: 14px;
            margin-top: 15px;
        }

        .payment-option label {
            margin: 0;
            cursor: pointer;
        }

        .place-order {
            width: 100%;
            margin-top: 25px;
            padding: 15px;
            border: 0;
            border-radius: 9px;
            background: #9f1239;
            color: #fff;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
        }

        .place-order:disabled {
            opacity: .6;
            cursor: not-allowed;
        }

        .error {
            color: #c62828;
        }

        .success {
            color: #16803c;
        }

        @media (max-width: 768px) {
            .checkout-grid {
                grid-template-columns: 1fr;
            }

            .form-grid {
                grid-template-columns: 1fr;
            }

            .form-group.full {
                grid-column: auto;
            }
        }
    </style>
</head>

<body>

<div class="checkout-page">

    <div class="checkout-title">
        <h1>Checkout</h1>
        <p>Complete your order securely</p>
    </div>

    <div id="checkout-error" class="error"></div>

    <div class="checkout-grid">

        <!-- DELIVERY -->
        <div class="checkout-card">

            <h2>Delivery Address</h2>

            <form id="checkout-form">

                <div class="form-grid">

                    <div class="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            id="name"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            id="email"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>Pincode</label>
                        <input
                            type="text"
                            id="pincode"
                            required
                        >
                    </div>

                    <div class="form-group full">
                        <label>Address</label>
                        <textarea
                            id="address"
                            required
                        ></textarea>
                    </div>

                    <div class="form-group">
                        <label>City</label>
                        <input
                            type="text"
                            id="city"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>State</label>
                        <input
                            type="text"
                            id="state"
                            required
                        >
                    </div>

                </div>

            </form>

        </div>

        <!-- ORDER SUMMARY -->
        <div class="checkout-card">

            <h2>Order Summary</h2>

            <div id="product-container">
                Loading product...
            </div>

            <div class="coupon-box">

                <input
                    type="text"
                    id="coupon"
                    placeholder="Enter coupon code"
                >

                <button
                    type="button"
                    class="coupon-btn"
                    id="apply-coupon"
                >
                    Apply
                </button>

            </div>

            <div
                id="coupon-message"
                class="coupon-message"
            ></div>

            <div class="summary-row">
                <span>Subtotal</span>
                <strong id="subtotal">₹0</strong>
            </div>

            <div class="summary-row">
                <span>Shipping</span>
                <strong id="shipping">₹0</strong>
            </div>

            <div class="summary-row">
                <span>Discount</span>
                <strong id="discount">₹0</strong>
            </div>

            <div class="summary-row summary-total">
                <span>Total</span>
                <strong id="total">₹0</strong>
            </div>

            <div class="payment-option">

                <label>
                    <input
                        type="radio"
                        name="payment_method"
                        value="razorpay"
                        checked
                    >

                    Pay Online — Razorpay
                </label>

            </div>

            <button
                type="submit"
                form="checkout-form"
                class="place-order"
                id="place-order"
            >
                Place Order
            </button>

        </div>

        

    </div>

</div>

<script>

const API_URL = "/api/v1";
const STORAGE_URL = "/storage";

const params = new URLSearchParams(
    window.location.search
);

const productSlug = params.get('product');

let product = null;
let couponDiscount = 0;
let appliedCoupon = null;


/* ==========================================
   LOAD PRODUCT
========================================== */

async function loadProduct() {

            if (!productSlug) {
                showError("No product selected.");
                return;
            }

    try {

           const response = await fetch(
                    `${API_URL}/products/${encodeURIComponent(productSlug)}`
                );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to load product."
            );
        }

        product = result.data;

        renderProduct();

    } catch (error) {

        console.error(error);

        showError(
            "Unable to load the selected product."
        );
    }
}


/* ==========================================
   RENDER PRODUCT
========================================== */

function renderProduct() {

    const price = Number(product.price || 0);

    const image = product.image
        ? `${STORAGE_URL}/${product.image}`
        : "";

    document.getElementById(
        "product-container"
    ).innerHTML = `

        <div class="product-box">

            <img
                src="${image}"
                alt="${escapeHtml(product.name)}"
            >

            <div class="product-info">

                <h3>
                    ${escapeHtml(product.name)}
                </h3>

                <div class="product-price">
                    ₹${price.toLocaleString("en-IN")}
                </div>

                <div>
                    Quantity: 1
                </div>

            </div>

        </div>

    `;

    updateSummary();
}


/* ==========================================
   SUMMARY
========================================== */

function updateSummary() {

    if (!product) return;

    const subtotal = Number(product.price || 0);

    const shipping = 0;

    const total = Math.max(
        0,
        subtotal + shipping - couponDiscount
    );

    document.getElementById("subtotal")
        .textContent = formatPrice(subtotal);

    document.getElementById("shipping")
        .textContent = formatPrice(shipping);

    document.getElementById("discount")
        .textContent = formatPrice(couponDiscount);

    document.getElementById("total")
        .textContent = formatPrice(total);
}


/* ==========================================
   COUPON
========================================== */

document.getElementById(
    "apply-coupon"
).addEventListener("click", async () => {

    const code = document.getElementById(
        "coupon"
    ).value.trim();

    if (!code) {
        showCouponMessage(
            "Please enter a coupon code.",
            false
        );
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/coupons/validate`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                body: JSON.stringify({
                    code: code,
                    subtotal: Number(product.price)
                })
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Invalid coupon."
            );
        }

        couponDiscount = Number(
            result.data.discount_amount || 0
        );

        appliedCoupon = code;

        showCouponMessage(
            result.message || "Coupon applied successfully.",
            true
        );

        updateSummary();

    } catch (error) {

        couponDiscount = 0;
        appliedCoupon = null;

        showCouponMessage(
            error.message,
            false
        );

        updateSummary();
    }
});


/* ==========================================
   CHECKOUT
========================================== */

document.getElementById(
    "checkout-form"
).addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!product) {
        showError("Product is not loaded.");
        return;
    }

    const button = document.getElementById(
        "place-order"
    );

    button.disabled = true;
    button.textContent = "Processing...";
            const customerToken =
                localStorage.getItem("customer_token");

            if (!customerToken) {

                showError(
                    "Please login before placing your order."
                );

                button.disabled = false;
                button.textContent = "Place Order";

                return;
            }

    // Payment/order API will be connected
    // in the next step.

    alert(
        "Checkout information is ready. Payment integration comes next."
    );

    button.disabled = false;
    button.textContent = "Place Order";
});


/* ==========================================
   HELPERS
========================================== */

function formatPrice(value) {

    return "₹" + Number(value || 0)
        .toLocaleString("en-IN");
}


function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function showError(message) {

    document.getElementById(
        "checkout-error"
    ).textContent = message;
}


function showCouponMessage(message, success) {

    const element = document.getElementById(
        "coupon-message"
    );

    element.textContent = message;

    element.className =
        success
            ? "coupon-message success"
            : "coupon-message error";
}


loadProduct();

</script>

</body>
</html>