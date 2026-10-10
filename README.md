# 🛍️ ShopWave - Modern E-Commerce Web Application

**ShopWave** is a responsive, feature-rich, and accessible e-commerce web application built using **Vanilla HTML5, CSS3, and JavaScript**. It delivers a smooth shopping experience featuring interactive product catalogs, live search, cart drawer, wishlist, order history, accessibility settings, and rich media previews.

---

## 🌟 Key Features

### 🛒 Shopping & Checkout Experience
- **Interactive Product Catalog**: Browse products across multiple categories (Electronics, Clothing, Food & Drink).
- **Search & Auto-Suggestions**: Live search bar with accessible combobox suggestions and keyboard navigation.
- **Advanced Filtering & Sorting**: Filter by category, in-stock items, price range slider, and sort by price, rating, or name.
- **Cart Drawer**: Slide-out shopping basket with item counter, quantity controls, dynamic price computation, and subtotal calculation.
- **Promo Codes & Free Delivery**: Built-in support for discount coupons (e.g., `SAVE10` for 10% off) and free delivery calculation on orders over Rs. 15,000.
- **Interactive Checkout Flow**: Smooth demo checkout process with instant order placement confirmation.

### 💖 Wishlist & Order History
- **Persistent Wishlist**: Save favorite items with persistent state via browser `localStorage`.
- **Order Tracking / History**: Review past orders, ordered items, date, and status.

### 🎨 Display & Accessibility (a11y)
- **Theme Modes**: Seamlessly switch between **Light**, **Dark**, and **High Contrast** modes.
- **Text Scaling**: Quick font size resizing controls (`A−`, `A`, `A+`).
- **Reduced Motion Support**: Toggle animation reduction (respects `prefers-reduced-motion` system settings).
- **Accessible Design**: Full ARIA roles, skip-to-content links, screen-reader-friendly labels, and keyboard navigation.

### 🎬 Rich Media & Interactive Elements
- **Hero Carousel**: Video background banner and animated image previews with controls.
- **Hover Micro-Animations**: WebP animated previews on hover/focus with lightweight JPEG stills as fallbacks.
- **Promo Showcase**: Embedded video player with synchronized interactive transcript.

---

## 📁 Project Structure

```text
E-commerce-web/
├── index.html        # Main HTML structure with semantic elements
├── styles.css        # Pure CSS design system, responsive styles & themes
├── app.js            # Core application logic, state, and localStorage handlers
├── images/           # All product photos, hero banners, and video posters
│   ├── product-*.webp
│   ├── product-*-still.jpg
│   └── hero-*.webp
└── videos/           # Optimized promo and ambient background videos
    ├── hero-bg.mp4
    ├── hero-bg.webm
    ├── promo.mp4
    └── promo.webm
```

---

## 🚀 Getting Started

No build tools, bundlers, or package installations are required!

### Option 1: Direct File Opening
Double-click `index.html` or open it with your web browser:
```bash
open index.html # On macOS
```

### Option 2: Local HTTP Server (Recommended)
Run a lightweight local web server for the best media playback experience:

**Using Python:**
```bash
python3 -m http.server 8000
```
Then visit [http://localhost:8000](http://localhost:8000) in your browser.

**Using Node.js (Live Server / npx):**
```bash
npx serve .
```

---

## 🛠️ Built With

- **HTML5**: Semantic tags, ARIA attributes, video & audio elements.
- **CSS3**: CSS Custom Properties (Variables), Flexbox, CSS Grid, animations, and dark/contrast themes.
- **JavaScript (ES6+)**: Vanilla JS DOM manipulation, event delegation, and `localStorage` state management.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - feel free to use and customize for your own projects.
