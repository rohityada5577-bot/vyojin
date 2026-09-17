/* =====================================================
   RANGRIWAAZ / VYOJIN LANDING PAGE
   Laravel API + Products + Cart + Wishlist + Quick View
===================================================== */

"use strict";

/* =====================================================
   CONFIG
===================================================== */

const RANGRIWAAZ_CONFIG = {
    API_URL:
        window.RANGRIWAAZ_CONFIG?.API_URL ||
        "http://127.0.0.1:8000/api/v1",

    STORAGE_URL:
        window.RANGRIWAAZ_CONFIG?.STORAGE_URL ||
        "http://127.0.0.1:8000/storage",

    CHECKOUT_URL:
        window.RANGRIWAAZ_CONFIG?.CHECKOUT_URL ||
        "http://localhost:3000/checkout"
};


/* =====================================================
   PRODUCT STATE
===================================================== */

let products = [];
let newArrivalProducts = [];

let currentFilter = "all";
let searchText = "";

let visibleProducts = 6;
const productsPerLoad = 6;


/* =====================================================
   LOCAL STORAGE
===================================================== */

function readStorage(key, fallback = []) {
    try {
        const value = localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        const parsed = JSON.parse(value);

        return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
        console.error(`Storage read error: ${key}`, error);
        return fallback;
    }
}


let cart = readStorage("rangriwaazCart");
let wishlist = readStorage("rangriwaazWishlist");


/* =====================================================
   DOM ELEMENTS
===================================================== */

const productGrid =
    document.getElementById("productGrid");

const productTotal =
    document.getElementById("productTotal");

const wishlistCount =
    document.getElementById("wishlistCount");

const cartCount =
    document.getElementById("cartCount");

const searchBox =
    document.getElementById("searchBox");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const loadMoreBtn =
    document.getElementById("loadMoreBtn");

const modal =
    document.getElementById("quickViewModal");

const modalBody =
    document.getElementById("modalBody");

const modalClose =
    document.getElementById("modalClose");

const cartButton =
    document.getElementById("cartButton");

const wishlistButton =
    document.getElementById("wishlistButton");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const mobileNav =
    document.getElementById("mobileNav");


/* =====================================================
   HELPERS
===================================================== */

function normalizeArray(value) {

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string") {

        const text = value.trim();

        if (!text) {
            return [];
        }

        try {

            const parsed = JSON.parse(text);

            if (Array.isArray(parsed)) {
                return parsed;
            }

        } catch (error) {
            // Not JSON, continue below.
        }

        return text
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);
    }

    return [];
}


function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getStorageImageUrl(path) {

    if (!path) {
        return "";
    }

    const value = String(path).trim();

    if (!value) {
        return "";
    }

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    return `${RANGRIWAAZ_CONFIG.STORAGE_URL}/${value.replace(/^\/+/, "")}`;
}


function formatPrice(price) {

    const number = Number(price || 0);

    return number.toLocaleString("en-IN");
}


function calculateDiscount(price, comparePrice) {

    const currentPrice = Number(price || 0);
    const oldPrice = Number(comparePrice || 0);

    if (!oldPrice || oldPrice <= currentPrice) {
        return "";
    }

    const discount =
        Math.round(
            ((oldPrice - currentPrice) / oldPrice) * 100
        );

    return `${discount}% OFF`;
}


/* =====================================================
   NORMALIZE API PRODUCT
===================================================== */

/* =====================================================
   NORMALIZE API PRODUCT
===================================================== */

function normalizeApiProduct(product) {

    const imageList =
        normalizeArray(product.images);

    const colors =
        normalizeArray(product.colors);

    const sizes =
        normalizeArray(product.sizes);

    const mainImage =
        getStorageImageUrl(
            product.image || imageList[0]
        );

    const additionalImages =
        imageList
            .map(image => getStorageImageUrl(image))
            .filter(Boolean);

    const price =
        Number(product.price || 0);

    const oldPrice =
        product.compare_price !== null &&
        product.compare_price !== undefined &&
        product.compare_price !== ""
            ? Number(product.compare_price)
            : null;

    const category =
        product.category?.name ||
        product.category_name ||
        "Collection";

    return {

        id:
            Number(product.id),

        name:
            product.name ||
            "Product",

        slug:
            product.slug ||
            "",

        category,

        price,

        oldPrice,

        discount:
            calculateDiscount(
                price,
                oldPrice
            ),

        badge:
            product.badge ||
            (
                product.is_featured
                    ? "Featured"
                    : ""
            ),

        tags:
            category
                ? [category]
                : [],

        colors,

        sizes,

        stock:
            Number(product.stock || 0),

        description:
            product.description ||
            "",

        /*
         * New Arrival
         *
         * Laravel may return this value as:
         * true
         * 1
         * "1"
         * "true"
         */
        is_new_arrival:
            Boolean(
                product.is_new_arrival === true ||
                product.is_new_arrival === 1 ||
                product.is_new_arrival === "1" ||
                product.is_new_arrival === "true"
            ),

        frontImage:
            mainImage,

        backImage:
            additionalImages[0] ||
            mainImage,

        image:
            mainImage,

        image1:
            mainImage,

        image2:
            additionalImages[0] ||
            mainImage,

        image3:
            additionalImages[1] ||
            additionalImages[0] ||
            mainImage,

        image4:
            additionalImages[2] ||
            additionalImages[1] ||
            additionalImages[0] ||
            mainImage
    };
}

/* =====================================================
   GET PRODUCT
===================================================== */

/* =====================================================
   GET PRODUCT
===================================================== */

function getProductById(productId) {

    const id =
        Number(productId);

    return (
        products.find(
            product =>
                Number(product.id) === id
        ) ||

        newArrivalProducts.find(
            product =>
                Number(product.id) === id
        ) ||

        null
    );
}

/* =====================================================
   LOAD PRODUCTS FROM LARAVEL
===================================================== */

async function loadProductsFromLaravel() {

    console.log(
        "Loading products from:",
        `${RANGRIWAAZ_CONFIG.API_URL}/products`
    );

    try {

        const response =
            await fetch(
                `${RANGRIWAAZ_CONFIG.API_URL}/products?per_page=100`,
                {
                    method: "GET",

                    headers: {
                        Accept: "application/json"
                    },

                    cache: "no-store"
                }
            );

        console.log(
            "Products API status:",
            response.status
        );

        if (!response.ok) {

            throw new Error(
                `Products API returned ${response.status}`
            );
        }

        const result =
            await response.json();

        console.log(
            "Laravel products API response:",
            result
        );

        let apiProducts = [];

        /*
            Laravel pagination:

            {
                data: {
                    data: [...]
                }
            }
        */

        if (
            Array.isArray(
                result?.data?.data
            )
        ) {

            apiProducts =
                result.data.data;

        }

        /*
            Non-paginated response:

            {
                data: [...]
            }
        */

        else if (
            Array.isArray(
                result?.data
            )
        ) {

            apiProducts =
                result.data;

        }

        /*
            Direct array response
        */

        else if (
            Array.isArray(result)
        ) {

            apiProducts =
                result;

        }

        else {

            throw new Error(
                "Invalid products API response."
            );
        }


        products =
            apiProducts.map(
                normalizeApiProduct
            );


        visibleProducts = 6;


        console.log(
            `Loaded ${products.length} products from Laravel.`
        );


        renderProducts();


        renderNewArrivals();


    } catch (error) {

        console.error(
            "Laravel product API error:",
            error
        );

        products = [];

        renderProducts();

        renderNewArrivals();
    }
}

/* =====================================================
   LOAD NEW ARRIVALS FROM LARAVEL
===================================================== */

async function loadNewArrivalsFromLaravel() {
    console.log("Loading new arrivals...");

    try {
        const response = await fetch(
            `${RANGRIWAAZ_CONFIG.API_URL}/products?is_new_arrival=1&per_page=100`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json"
                },
                cache: "no-store"
            }
        );

        console.log(
            "New arrivals API status:",
            response.status
        );

        if (!response.ok) {
            throw new Error(
                `New arrivals API returned ${response.status}`
            );
        }

        const result = await response.json();

        let apiProducts = [];

        if (Array.isArray(result?.data?.data)) {
            apiProducts = result.data.data;
        } else if (Array.isArray(result?.data)) {
            apiProducts = result.data;
        } else if (Array.isArray(result)) {
            apiProducts = result;
        }

        newArrivalProducts = apiProducts.map(
            normalizeApiProduct
        );

        console.log(
            "New Arrival Products:",
            newArrivalProducts
        );

        renderNewArrivals();

    } catch (error) {
        console.error(
            "New arrivals loading error:",
            error
        );

        newArrivalProducts = [];

        renderNewArrivals();
    }
}


/* =====================================================
   PRODUCT FILTER
===================================================== */

function getFilteredProducts() {

    const query =
        searchText
            .trim()
            .toLowerCase();

   return products
    .filter(product => product.is_new_arrival !== true)
    .filter(product => {

        const category =
            String(
                product.category || ""
            ).toLowerCase();

        const name =
            String(
                product.name || ""
            ).toLowerCase();

        const filter =
            String(
                currentFilter || "all"
            ).toLowerCase();


        /* ================================
           CATEGORY FILTER
        ================================= */

        let filterMatch = true;


        if (filter !== "all") {

            /*
             * Match filter against both
             * category and product name.
             *
             * Example:
             *
             * filter = "chaniya"
             * category = "women chainya choli"
             *
             * This will now match.
             */

            filterMatch =
                category.includes(filter) ||
                name.includes(filter);


            /*
             * Handle spelling differences
             * such as:
             *
             * chaniya / chainya
             * lehenga / lehnga
             */

            if (
                !filterMatch &&
                (
                    filter.includes("chaniya") ||
                    filter.includes("chainya")
                )
            ) {

                filterMatch =
                    category.includes("chaniya") ||
                    category.includes("chainya") ||
                    name.includes("chaniya") ||
                    name.includes("chainya");
            }


            if (
                !filterMatch &&
                (
                    filter.includes("lehenga") ||
                    filter.includes("lehnga")
                )
            ) {

                filterMatch =
                    category.includes("lehenga") ||
                    category.includes("lehnga") ||
                    name.includes("lehenga") ||
                    name.includes("lehnga");
            }
        }


        /* ================================
           SEARCH
        ================================= */

        const searchMatch =
            !query ||
            name.includes(query) ||
            category.includes(query);


        return (
            filterMatch &&
            searchMatch
        );
    });
}


/* =====================================================
   PRODUCT CARD
===================================================== */

function createProductCard(product) {

    const isWishlisted =
        wishlist.includes(
            Number(product.id)
        );

    const frontImage =
        product.frontImage ||
        product.image ||
        "";

    const backImage =
        product.backImage ||
        frontImage;


    const colors =
        Array.isArray(product.colors)
            ? product.colors
            : [];


    const sizes =
        Array.isArray(product.sizes)
            ? product.sizes
            : [];


    return `

        <article
            class="product-card"
            data-id="${product.id}"
        >

            <div class="product-image">

                ${
                    product.badge
                        ? `
                            <span class="product-badge">
                                ${escapeHtml(product.badge)}
                            </span>
                        `
                        : ""
                }


                <button
                    type="button"
                    class="wishlist-btn ${
                        isWishlisted
                            ? "active"
                            : ""
                    }"
                    data-wishlist="${product.id}"
                    aria-label="Wishlist"
                >
                    ${
                        isWishlisted
                            ? "♥"
                            : "♡"
                    }
                </button>


                <div class="product-image-wrap">

                    ${
                        frontImage
                            ? `
                                <img
                                    src="${escapeHtml(frontImage)}"
                                    alt="${escapeHtml(product.name)}"
                                    class="product-img front-img"
                                    loading="lazy"
                                    onerror="this.style.display='none';"
                                >
                            `
                            : `
                                <div class="product-image-placeholder">
                                    ${escapeHtml(product.name)}
                                </div>
                            `
                    }


                    ${
                        backImage
                            ? `
                                <img
                                    src="${escapeHtml(backImage)}"
                                    alt="${escapeHtml(product.name)} hover view"
                                    class="product-img back-img"
                                    loading="lazy"
                                    onerror="this.style.display='none';"
                                >
                            `
                            : ""
                    }

                </div>


                <button
                    type="button"
                    class="quick-view"
                    data-quick="${product.id}"
                >
                    Quick View
                </button>

            </div>


            <div class="product-info">

                <span
                    class="product-category"
                    data-quick="${product.id}"
                >
                    ${escapeHtml(product.category)}
                </span>


                <h3
                    data-quick="${product.id}"
                >
                    ${escapeHtml(product.name)}
                </h3>


                <div class="product-price">

                    <strong>
                        ₹${formatPrice(product.price)}
                    </strong>

                    ${
                        product.oldPrice
                            ? `
                                <del>
                                    ₹${formatPrice(product.oldPrice)}
                                </del>
                            `
                            : ""
                    }

                </div>


                ${
                    product.discount
                        ? `
                            <span class="discount">
                                ${escapeHtml(product.discount)}
                            </span>
                        `
                        : ""
                }


                ${
                    colors.length
                        ? `
                            <div class="product-colors">

                                ${colors
                                    .map(
                                        color => `
                                            <span
                                                class="color-dot"
                                                title="${escapeHtml(color)}"
                                                style="background:${escapeHtml(color)}"
                                            ></span>
                                        `
                                    )
                                    .join("")
                                }

                            </div>
                        `
                        : ""
                }


                ${
                    sizes.length
                        ? `
                            <div class="product-sizes">

                                ${sizes
                                    .map(
                                        size => `
                                            <span>
                                                ${escapeHtml(size)}
                                            </span>
                                        `
                                    )
                                    .join("")
                                }

                            </div>
                        `
                        : ""
                }


                <button
                    type="button"
                    class="add-cart"
                    data-cart="${product.id}"
                >
                    ${
                        Number(product.stock) > 0
                            ? "Add to Cart"
                            : "Out of Stock"
                    }
                </button>

            </div>

        </article>
    `;
}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

function renderProducts() {

    if (!productGrid) {
        console.warn(
            "productGrid element not found."
        );

        return;
    }


    const filtered =
        getFilteredProducts();


    const visible =
        filtered.slice(
            0,
            visibleProducts
        );


    if (!filtered.length) {

        productGrid.innerHTML = `
            <div class="no-products">
                <p>No products found.</p>
            </div>
        `;

    } else {

        productGrid.innerHTML =
            visible
                .map(createProductCard)
                .join("");
    }


    productGrid.style.display =
        "grid";


    productGrid.style.visibility =
        "visible";


    productGrid.style.opacity =
        "1";


    if (productTotal) {

        productTotal.textContent =
            `${filtered.length} Products`;
    }


    if (loadMoreBtn) {

        loadMoreBtn.style.display =
            visibleProducts < filtered.length
                ? "inline-flex"
                : "none";
    }


    updateCounts();
}


/* =====================================================
   LOAD MORE
===================================================== */

if (loadMoreBtn) {

    loadMoreBtn.addEventListener(
        "click",
        () => {

            visibleProducts +=
                productsPerLoad;

            renderProducts();
        }
    );
}


/* =====================================================
   FILTER BUTTONS
===================================================== */

document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter-btn")
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter ||
                    "all";


                visibleProducts = 6;


                renderProducts();
            }
        );
    });


/* =====================================================
   SEARCH
===================================================== */

if (
    searchButton &&
    searchBox
) {

    searchButton.addEventListener(
        "click",
        () => {

            searchBox.classList.toggle(
                "show"
            );


            if (
                searchBox.classList.contains(
                    "show"
                ) &&
                searchInput
            ) {

                searchInput.focus();
            }
        }
    );
}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        event => {

            searchText =
                event.target.value.trim();

            visibleProducts = 6;

            renderProducts();
        }
    );
}


/* =====================================================
   PRODUCT EVENTS
===================================================== */

if (productGrid) {

    productGrid.addEventListener(
        "click",
        event => {

            const wishlistBtn =
                event.target.closest(
                    "[data-wishlist]"
                );


            if (wishlistBtn) {

                toggleWishlist(
                    Number(
                        wishlistBtn.dataset.wishlist
                    )
                );

                return;
            }


            const cartBtn =
                event.target.closest(
                    "[data-cart]"
                );


            if (cartBtn) {

                const productId =
                    Number(
                        cartBtn.dataset.cart
                    );

                const product =
                    getProductById(
                        productId
                    );


                if (!product) {
                    return;
                }


                if (
                    Number(product.stock) <= 0
                ) {

                    showToast(
                        "This product is out of stock."
                    );

                    return;
                }


                openQuickView(
                    productId
                );

                return;
            }


            const quickBtn =
                event.target.closest(
                    "[data-quick]"
                );


            if (quickBtn) {

                openQuickView(
                    Number(
                        quickBtn.dataset.quick
                    )
                );

                return;
            }


            const card =
                event.target.closest(
                    ".product-card"
                );


            if (card) {

                openQuickView(
                    Number(card.dataset.id)
                );
            }

        }
    );
}


/* =====================================================
   WISHLIST
===================================================== */

function toggleWishlist(productId) {

    productId =
        Number(productId);


    if (
        wishlist.includes(
            productId
        )
    ) {

        wishlist =
            wishlist.filter(
                id =>
                    Number(id) !==
                    productId
            );

    } else {

        wishlist.push(
            productId
        );
    }


    localStorage.setItem(
        "rangriwaazWishlist",
        JSON.stringify(wishlist)
    );


    renderProducts();

    renderNewArrivals();

    updateCounts();
}


/* =====================================================
   CART
===================================================== */

function addToCart(
    productId,
    options = {}
) {

    const product =
        getProductById(productId);


    if (!product) {

        showToast(
            "Product not found."
        );

        return false;
    }


    if (
        Number(product.stock) <= 0
    ) {

        showToast(
            "This product is out of stock."
        );

        return false;
    }


    const quantity =
        Math.max(
            1,
            Number(
                options.quantity || 1
            )
        );


    const size =
        options.size ||
        null;


    const color =
        options.color ||
        null;


    const existing =
        cart.find(item =>
            Number(
                item.product_id ||
                item.id
            ) === Number(product.id) &&

            (item.size || null) === size &&

            (item.color || null) === color
        );


    if (existing) {

        existing.quantity =
            Number(
                existing.quantity || 1
            ) + quantity;

    } else {

        cart.push({

            id:
                product.id,

            product_id:
                product.id,

            slug:
                product.slug,

            name:
                product.name,

            price:
                product.price,

            quantity,

            size,

            color,

            image:
                product.frontImage
        });
    }


    localStorage.setItem(
        "rangriwaazCart",
        JSON.stringify(cart)
    );


    updateCounts();


    showToast(
        `${product.name} added to cart`
    );


    return true;
}


/* =====================================================
   BUY NOW
===================================================== */

function buyNow(
    productId,
    options = {}
) {

    const product =
        getProductById(productId);


    if (!product) {

        console.error(
            "Product not found:",
            productId
        );

        showToast(
            "Product not found."
        );

        return;
    }


    if (
        Number(product.stock) <= 0
    ) {

        showToast(
            "This product is out of stock."
        );

        return;
    }


    if (!product.slug) {

        console.error(
            "Product slug is missing:",
            product
        );

        showToast(
            "Product information is incomplete."
        );

        return;
    }


    /*
        Add product to cart first.
    */

    addToCart(
        productId,
        options
    );


    /*
        Send product slug to Next.js checkout.

        Example:

        http://localhost:3000/checkout?product=chanya-choli
    */

    const checkoutUrl =
        `${RANGRIWAAZ_CONFIG.CHECKOUT_URL}?product=${encodeURIComponent(product.slug)}`;


    console.log(
        "PRODUCT ID:",
        product.id
    );

    console.log(
        "PRODUCT NAME:",
        product.name
    );

    console.log(
        "PRODUCT SLUG:",
        product.slug
    );

    console.log(
        "CHECKOUT URL:",
        checkoutUrl
    );


    window.location.href =
        checkoutUrl;
}


/* =====================================================
   COUNTS
===================================================== */

function updateCounts() {

    if (wishlistCount) {

        wishlistCount.textContent =
            wishlist.length;
    }


    if (cartCount) {

        cartCount.textContent =
            cart.length;
    }
}


/* =====================================================
   QUICK VIEW
===================================================== */

function openQuickView(productId) {

    const product =
        getProductById(productId);


    if (
        !product ||
        !modal ||
        !modalBody
    ) {

        return;
    }


    const images = [

        product.image1 ||
            product.frontImage,

        product.image2 ||
            product.backImage,

        product.image3 ||
            product.frontImage,

        product.image4 ||
            product.backImage

    ].filter(Boolean);


    const uniqueImages =
        [...new Set(images)];


    const finalImages =
        uniqueImages.length
            ? uniqueImages
            : [""];


    modalBody.innerHTML = `

        <div class="modal-product">

            <div class="modal-product-image-area">

                <div class="modal-main-image-wrap">

                    ${
                        finalImages[0]
                            ? `
                                <img
                                    src="${escapeHtml(finalImages[0])}"
                                    alt="${escapeHtml(product.name)}"
                                    id="modalMainImage"
                                    class="modal-main-image"
                                >
                            `
                            : `
                                <div class="modal-image-placeholder">
                                    ${escapeHtml(product.name)}
                                </div>
                            `
                    }

                </div>


                <div class="modal-image-thumbnails">

                    ${finalImages
                        .map(
                            (image, index) => `

                                <button
                                    type="button"
                                    class="modal-thumb ${
                                        index === 0
                                            ? "active"
                                            : ""
                                    }"
                                    data-modal-image="${escapeHtml(image)}"
                                >

                                    <img
                                        src="${escapeHtml(image)}"
                                        alt="${escapeHtml(product.name)} view ${index + 1}"
                                    >

                                </button>
                            `
                        )
                        .join("")
                    }

                </div>

            </div>


            <div class="modal-product-info">

                <span class="modal-product-category">
                    ${escapeHtml(product.category)}
                </span>


                <h2 class="modal-product-title">
                    ${escapeHtml(product.name)}
                </h2>


                <div class="modal-product-quality">

                    <span class="quality-stars">
                        ★★★★★
                    </span>

                    <span>
                        premium festive collection
                    </span>

                </div>


                <div class="modal-price-row">

                    <span class="modal-current-price">
                        ₹${formatPrice(product.price)}
                    </span>


                    ${
                        product.oldPrice
                            ? `
                                <span class="modal-old-price">
                                    ₹${formatPrice(product.oldPrice)}
                                </span>
                            `
                            : ""
                    }


                    ${
                        product.discount
                            ? `
                                <span class="modal-discount">
                                    ${escapeHtml(product.discount)}
                                </span>
                            `
                            : ""
                    }

                </div>


                <div class="modal-detail-block">

                    <h4>
                        about this product
                    </h4>

                    <p>
                        ${
                            escapeHtml(
                                product.description ||
                                `${product.name} is designed for festive celebrations with a premium traditional look.`
                            )
                        }
                    </p>

                </div>


                <div class="modal-detail-block">

                    <h4>
                        product quality
                    </h4>

                    <ul class="product-quality-list">

                        <li>
                            <span>fabric quality</span>
                            <strong>premium festive fabric</strong>
                        </li>

                        <li>
                            <span>craftsmanship</span>
                            <strong>finely detailed finishing</strong>
                        </li>

                        <li>
                            <span>design</span>
                            <strong>traditional ethnic styling</strong>
                        </li>

                        <li>
                            <span>comfort</span>
                            <strong>designed for festive wear</strong>
                        </li>

                        <li>
                            <span>collection</span>
                            <strong>premium Navratri collection</strong>
                        </li>

                    </ul>

                </div>


                ${
                    product.colors.length
                        ? `
                            <div class="modal-detail-block">

                                <h4>
                                    available colours
                                </h4>

                                <div class="modal-colors">

                                    ${product.colors
                                        .map(
                                            color => `
                                                <span class="modal-color">
                                                    ${escapeHtml(color)}
                                                </span>
                                            `
                                        )
                                        .join("")
                                    }

                                </div>

                            </div>
                        `
                        : ""
                }


                ${
                    product.sizes.length
                        ? `
                            <div class="modal-detail-block">

                                <h4>
                                    available sizes
                                </h4>

                                <div class="modal-sizes">

                                    ${product.sizes
                                        .map(
                                            size => `
                                                <span class="modal-size">
                                                    ${escapeHtml(size)}
                                                </span>
                                            `
                                        )
                                        .join("")
                                    }

                                </div>

                            </div>
                        `
                        : ""
                }


                ${
                    product.tags.length
                        ? `
                            <div class="modal-detail-block">

                                <h4>
                                    product highlights
                                </h4>

                                <div class="modal-tags">

                                    ${product.tags
                                        .map(
                                            tag => `
                                                <span class="modal-tag">
                                                    ${escapeHtml(tag)}
                                                </span>
                                            `
                                        )
                                        .join("")
                                    }

                                </div>

                            </div>
                        `
                        : ""
                }


                ${
                    Number(product.stock) > 0
                        ? `
                            <button
                                type="button"
                                class="primary-btn modal-add-cart"
                                id="modalBuyNowButton"
                            >
                                Buy Now
                            </button>
                        `
                        : `
                            <button
                                type="button"
                                class="primary-btn modal-add-cart"
                                disabled
                            >
                                Out of Stock
                            </button>
                        `
                }

            </div>

        </div>
    `;


    /*
        Thumbnail switching
    */

    const mainImage =
        document.getElementById(
            "modalMainImage"
        );


    modalBody
        .querySelectorAll(
            "[data-modal-image]"
        )
        .forEach(thumbnail => {

            thumbnail.addEventListener(
                "click",
                () => {

                    const image =
                        thumbnail.dataset.modalImage;


                    if (
                        mainImage &&
                        image
                    ) {

                        mainImage.src =
                            image;
                    }


                    modalBody
                        .querySelectorAll(
                            ".modal-thumb"
                        )
                        .forEach(item =>
                            item.classList.remove(
                                "active"
                            )
                        );


                    thumbnail.classList.add(
                        "active"
                    );
                }
            );
        });


    /*
        Buy button
    */

    const modalBuyButton =
        document.getElementById(
            "modalBuyNowButton"
        );


    if (modalBuyButton) {

        modalBuyButton.addEventListener(
            "click",
            () => {

                buyNow(
                    product.id
                );

                closeModal();
            }
        );
    }


    modal.classList.add(
        "open"
    );


    document.body.style.overflow =
        "hidden";
}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "open"
    );

    document.body.style.overflow =
        "";
}


if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );
}


if (modal) {

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeModal();
            }
        }
    );
}


/* =====================================================
   HEADER CART
===================================================== */

if (cartButton) {

    cartButton.addEventListener(
        "click",
        () => {

            showToast(
                `You have ${cart.length} item(s) in your cart`
            );
        }
    );
}


/* =====================================================
   HEADER WISHLIST
===================================================== */

if (wishlistButton) {

    wishlistButton.addEventListener(
        "click",
        () => {

            showToast(
                `You have ${wishlist.length} wishlist item(s)`
            );
        }
    );
}


/* =====================================================
   MOBILE MENU
===================================================== */

if (
    mobileMenuButton &&
    mobileNav
) {

    mobileMenuButton.addEventListener(
        "click",
        () => {

            mobileNav.classList.toggle(
                "open"
            );


            const isOpen =
                mobileNav.classList.contains(
                    "open"
                );


            mobileMenuButton.setAttribute(
                "aria-expanded",
                isOpen
                    ? "true"
                    : "false"
            );


            mobileMenuButton.innerHTML =
                isOpen
                    ? '<i class="fa-solid fa-xmark"></i>'
                    : '<i class="fa-solid fa-bars"></i>';
        }
    );


    mobileNav
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    mobileNav.classList.remove(
                        "open"
                    );

                    mobileMenuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    mobileMenuButton.innerHTML =
                        '<i class="fa-solid fa-bars"></i>';
                }
            );
        });
}


/* =====================================================
   NEWSLETTER
===================================================== */

const newsletterForm =
    document.getElementById(
        "newsletterForm"
    );


if (newsletterForm) {

    newsletterForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const newsletterEmail =
                document.getElementById(
                    "newsletterEmail"
                );


            const email =
                newsletterEmail
                    ? newsletterEmail.value.trim()
                    : "";


            if (!email) {

                showToast(
                    "Please enter your email."
                );

                return;
            }


            showToast(
                "Thank you for subscribing!"
            );


            newsletterForm.reset();
        }
    );
}


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {

    const existing =
        document.querySelector(
            ".toast"
        );


    if (existing) {
        existing.remove();
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "toast";


    toast.textContent =
        message;


    Object.assign(
        toast.style,
        {
            position: "fixed",
            bottom: "25px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: "5000",
            padding: "14px 22px",
            background: "#211512",
            color: "#fff",
            fontSize: "11px",
            letterSpacing: "0.5px",
            boxShadow:
                "0 15px 35px rgba(0,0,0,.2)"
        }
    );


    document.body.appendChild(
        toast
    );


    setTimeout(
        () => {

            if (toast) {
                toast.remove();
            }

        },
        2500
    );
}


/* =====================================================
   HERO SLIDER
===================================================== */

const heroSlides =
    document.querySelectorAll(
        ".hero-slide"
    );

const heroDots =
    document.querySelectorAll(
        ".hero-dot"
    );

const heroPrev =
    document.getElementById(
        "heroPrev"
    );

const heroNext =
    document.getElementById(
        "heroNext"
    );

const hero =
    document.querySelector(
        ".hero"
    );


let currentHeroSlide = 0;
let heroSliderTimer = null;


/* =====================================================
   SHOW HERO
===================================================== */

function showHeroSlide(index) {

    if (!heroSlides.length) {
        return;
    }


    if (
        index >=
        heroSlides.length
    ) {

        currentHeroSlide = 0;

    } else if (index < 0) {

        currentHeroSlide =
            heroSlides.length - 1;

    } else {

        currentHeroSlide =
            index;
    }


    heroSlides.forEach(
        (slide, slideIndex) => {

            slide.classList.toggle(
                "active",
                slideIndex ===
                    currentHeroSlide
            );
        }
    );


    heroDots.forEach(
        (dot, dotIndex) => {

            dot.classList.toggle(
                "active",
                dotIndex ===
                    currentHeroSlide
            );
        }
    );
}


/* =====================================================
   HERO NEXT
===================================================== */

function nextHeroSlide() {

    showHeroSlide(
        currentHeroSlide + 1
    );
}


/* =====================================================
   HERO PREVIOUS
===================================================== */

function previousHeroSlide() {

    showHeroSlide(
        currentHeroSlide - 1
    );
}


/* =====================================================
   START HERO
===================================================== */

function startHeroSlider() {

    stopHeroSlider();


    if (
        heroSlides.length <= 1
    ) {
        return;
    }


    heroSliderTimer =
        setInterval(
            () => {

                nextHeroSlide();

            },
            5000
        );
}


/* =====================================================
   STOP HERO
===================================================== */

function stopHeroSlider() {

    if (heroSliderTimer) {

        clearInterval(
            heroSliderTimer
        );

        heroSliderTimer =
            null;
    }
}


/* =====================================================
   HERO BUTTONS
===================================================== */

if (heroNext) {

    heroNext.addEventListener(
        "click",
        () => {

            nextHeroSlide();

            startHeroSlider();
        }
    );
}


if (heroPrev) {

    heroPrev.addEventListener(
        "click",
        () => {

            previousHeroSlide();

            startHeroSlider();
        }
    );
}


/* =====================================================
   HERO DOTS
===================================================== */

heroDots.forEach(
    dot => {

        dot.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        dot.dataset.slideTo
                    );


                showHeroSlide(
                    index
                );


                startHeroSlider();
            }
        );
    }
);


/* =====================================================
   HERO HOVER
===================================================== */

if (hero) {

    hero.addEventListener(
        "mouseenter",
        stopHeroSlider
    );


    hero.addEventListener(
        "mouseleave",
        startHeroSlider
    );
}


/* =====================================================
   NEW ARRIVALS
===================================================== */

const arrivalProductGrid =
    document.getElementById(
        "arrivalProductGrid"
    );

const arrivalProductTotal =
    document.getElementById(
        "arrivalProductTotal"
    );

const arrivalFilterButton =
    document.getElementById(
        "arrivalFilterButton"
    );

const arrivalFilterPanel =
    document.getElementById(
        "arrivalFilterPanel"
    );

const arrivalCategoryFilter =
    document.getElementById(
        "arrivalCategoryFilter"
    );

const arrivalSortFilter =
    document.getElementById(
        "arrivalSortFilter"
    );

const arrivalResetFilter =
    document.getElementById(
        "arrivalResetFilter"
    );


let arrivalFilter = "all";
let arrivalSort = "default";


/* =====================================================
   ARRIVAL CARD
===================================================== */

function createArrivalCard(product) {

    const isWishlisted =
        wishlist.includes(
            Number(product.id)
        );


    return `

        <article
            class="arrival-card"
            data-id="${product.id}"
        >

            <div
                class="arrival-card-image"
                data-arrival-quick="${product.id}"
            >

                ${
                    product.badge
                        ? `
                            <span class="arrival-card-badge">
                                ${escapeHtml(product.badge)}
                            </span>
                        `
                        : ""
                }


                <button
                    type="button"
                    class="arrival-card-wishlist ${
                        isWishlisted
                            ? "active"
                            : ""
                    }"
                    data-arrival-wishlist="${product.id}"
                    aria-label="Add to wishlist"
                >
                    ${
                        isWishlisted
                            ? "♥"
                            : "♡"
                    }
                </button>


                ${
                    product.frontImage
                        ? `
                            <img
                                src="${escapeHtml(product.frontImage)}"
                                alt="${escapeHtml(product.name)}"
                                loading="lazy"
                            >
                        `
                        : ""
                }


                <button
                    type="button"
                    class="arrival-card-quick"
                    data-arrival-quick="${product.id}"
                >
                    Quick View
                </button>

            </div>


            <div class="arrival-card-info">

                <span
                    class="arrival-card-category"
                    data-arrival-quick="${product.id}"
                >
                    ${escapeHtml(product.category)}
                </span>


                <h3
                    class="arrival-card-title"
                    data-arrival-quick="${product.id}"
                >
                    ${escapeHtml(product.name)}
                </h3>


                <span class="arrival-card-source">
                    VYOJIN.COM
                </span>


                <div class="arrival-card-rating">

                    <span class="arrival-card-stars">
                        ★★★★★
                    </span>

                    <span>
                        1 review
                    </span>

                </div>


                <div class="arrival-card-price">

                    <strong>
                        ₹${formatPrice(product.price)}
                    </strong>


                    ${
                        product.oldPrice
                            ? `
                                <del>
                                    ₹${formatPrice(product.oldPrice)}
                                </del>
                            `
                            : ""
                    }

                </div>

            </div>

        </article>
    `;
}


/* =====================================================
   ARRIVAL FILTER
===================================================== */

function getArrivalProducts() {

    let filtered =
        Array.isArray(newArrivalProducts)
            ? [...newArrivalProducts]
            : [];

    if (arrivalFilter !== "all") {

        const filter =
            String(arrivalFilter || "")
                .toLowerCase()
                .trim();

        filtered =
            filtered.filter(product => {

                const category =
                    String(
                        product.category || ""
                    ).toLowerCase();

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();

                const combined =
                    `${category} ${name}`;

                /* chaniya / chainya / choli / lehnga */

                if (
                    filter.includes("chaniya") ||
                    filter.includes("chainya") ||
                    filter.includes("choli") ||
                    filter.includes("lehnga") ||
                    filter.includes("lehenga")
                ) {
                    return (
                        combined.includes("chaniya") ||
                        combined.includes("chainya") ||
                        combined.includes("choli") ||
                        combined.includes("lehnga") ||
                        combined.includes("lehenga")
                    );
                }

                /* bandhani */

                if (
                    filter.includes("bandhani")
                ) {
                    return combined.includes(
                        "bandhani"
                    );
                }

                /* mirror work */

                if (
                    filter.includes("mirror")
                ) {
                    return (
                        combined.includes("mirror") ||
                        combined.includes("work")
                    );
                }

                /* navratri */

                if (
                    filter.includes("navratri")
                ) {
                    return combined.includes(
                        "navratri"
                    );
                }

                /* garba */

                if (
                    filter.includes("garba")
                ) {
                    return combined.includes(
                        "garba"
                    );
                }

                /* premium */

                if (
                    filter.includes("premium")
                ) {
                    return combined.includes(
                        "premium"
                    );
                }

                /* normal matching */

                return (
                    category.includes(filter) ||
                    name.includes(filter)
                );
            });
    }

    switch (arrivalSort) {

        case "price-low":

            filtered.sort(
                (a, b) =>
                    Number(a.price) -
                    Number(b.price)
            );

            break;

        case "price-high":

            filtered.sort(
                (a, b) =>
                    Number(b.price) -
                    Number(a.price)
            );

            break;

        case "name":

            filtered.sort(
                (a, b) =>
                    String(a.name).localeCompare(
                        String(b.name)
                    )
            );

            break;

        case "new":

            filtered.sort(
                (a, b) =>
                    Number(b.id) -
                    Number(a.id)
            );

            break;

        default:
            break;
    }

    return filtered;
}


/* =====================================================
   RENDER NEW ARRIVALS
===================================================== */

function renderNewArrivals() {

    if (!arrivalProductGrid) {
        return;
    }


    const filtered =
        getArrivalProducts();


    const visible =
        filtered.slice(
            0,
            6
        );


    if (!visible.length) {

        arrivalProductGrid.innerHTML = `
            <div class="no-products">
                <p>No products found.</p>
            </div>
        `;

    } else {

        arrivalProductGrid.innerHTML =
            visible
                .map(
                    createArrivalCard
                )
                .join("");
    }


    if (arrivalProductTotal) {

        arrivalProductTotal.textContent =
            `${filtered.length} newArrivalProducts`;
    }
}


/* =====================================================
   ARRIVAL FILTER BUTTON
===================================================== */

if (arrivalFilterButton) {

    arrivalFilterButton.addEventListener(
        "click",
        () => {

            if (arrivalFilterPanel) {

                arrivalFilterPanel.classList.toggle(
                    "open"
                );
            }


            arrivalFilterButton.classList.toggle(
                "active"
            );
        }
    );
}


/* =====================================================
   ARRIVAL CATEGORY
===================================================== */

if (arrivalCategoryFilter) {

    arrivalCategoryFilter.addEventListener(
        "change",
        () => {

            arrivalFilter =
                arrivalCategoryFilter.value ||
                "all";


            renderNewArrivals();
        }
    );
}


/* =====================================================
   ARRIVAL SORT
===================================================== */

if (arrivalSortFilter) {

    arrivalSortFilter.addEventListener(
        "change",
        () => {

            arrivalSort =
                arrivalSortFilter.value ||
                "default";


            renderNewArrivals();
        }
    );
}


/* =====================================================
   ARRIVAL RESET
===================================================== */

if (arrivalResetFilter) {

    arrivalResetFilter.addEventListener(
        "click",
        () => {

            arrivalFilter =
                "all";


            arrivalSort =
                "default";


            if (arrivalCategoryFilter) {

                arrivalCategoryFilter.value =
                    "all";
            }


            if (arrivalSortFilter) {

                arrivalSortFilter.value =
                    "default";
            }


            renderNewArrivals();
        }
    );
}


/* =====================================================
   ARRIVAL PRODUCT EVENTS
===================================================== */

if (arrivalProductGrid) {

    arrivalProductGrid.addEventListener(
        "click",
        event => {

            const wishlistBtn =
                event.target.closest(
                    "[data-arrival-wishlist]"
                );


            if (wishlistBtn) {

                toggleWishlist(
                    Number(
                        wishlistBtn.dataset
                            .arrivalWishlist
                    )
                );

                return;
            }


            const quickBtn =
                event.target.closest(
                    "[data-arrival-quick]"
                );


            if (quickBtn) {

                openQuickView(
                    Number(
                        quickBtn.dataset
                            .arrivalQuick
                    )
                );

                return;
            }

        }
    );
}


/* =====================================================
   ARRIVAL CATEGORY CIRCLES
===================================================== */

document
    .querySelectorAll(
        ".arrival-category"
    )
    .forEach(category => {

        category.addEventListener(
            "click",
            event => {

                event.preventDefault();


                document
                    .querySelectorAll(
                        ".arrival-category"
                    )
                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );


                category.classList.add(
                    "active"
                );


                arrivalFilter =
                    category.dataset
                        .arrivalFilter ||
                    "all";


                if (
                    arrivalCategoryFilter
                ) {

                    const option =
                        [
                            ...arrivalCategoryFilter.options
                        ].find(
                            item =>
                                item.value
                                    .toLowerCase() ===
                                arrivalFilter
                                    .toLowerCase()
                        );


                    if (option) {

                        arrivalCategoryFilter.value =
                            option.value;
                    }
                }


                renderNewArrivals();


                const section =
                    document.getElementById(
                        "new-arrivals"
                    );


                if (section) {

                    section.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }
        );
    });


/* =====================================================
   INITIAL UI
===================================================== */

updateCounts();

renderProducts();

renderNewArrivals();


/* =====================================================
   HERO INIT
===================================================== */

if (
    heroSlides.length
) {

    showHeroSlide(
        0
    );

    startHeroSlider();
}


/* =====================================================
   LOAD LIVE PRODUCTS
===================================================== */

loadProductsFromLaravel();
loadNewArrivalsFromLaravel();


/* =====================================================
   DEBUG
===================================================== */

console.log(
    "RangRiwaaz landing JavaScript loaded."
);

console.log(
    "API URL:",
    RANGRIWAAZ_CONFIG.API_URL
);

console.log(
    "Storage URL:",
    RANGRIWAAZ_CONFIG.STORAGE_URL
);

console.log(
    "Checkout URL:",
    RANGRIWAAZ_CONFIG.CHECKOUT_URL
);