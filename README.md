# PERfume — Luxury Fragrance E-Commerce Platform

A **production-quality full-stack perfume e-commerce website** with a separate User and Admin panel, built with a modern luxury aesthetic.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Spring Boot 3 + Spring Data JPA |
| Database | MySQL |
| Image Storage | Cloudinary |
| Session Auth | HTTP Session (no JWT) |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 20+
- MySQL 8+

### 1. Configure Backend

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/perfume_db
spring.datasource.username=root
spring.datasource.password=yourpassword

cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=your-api-key
cloudinary.api-secret=your-api-secret
```

### 2. Run Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`. The `DataSeeder` automatically creates:
- **Admin account**: `admin@perfume.com` / `Admin@123`
- Sample categories, products, coupons, and banners

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`

---

## 📱 Features

### User Side
- **Home Page** — Hero slider, featured/best-seller/luxury/new-arrival sections, testimonials
- **Product Listing** — Filter by category, gender, fragrance family, price, rating; sort options; pagination
- **Product Detail** — Image gallery, fragrance notes (top/heart/base), reviews, related products
- **Fragrance Quiz** — 3-step personalized recommendation quiz
- **Cart** — Quantity controls, coupon codes, gift packaging option
- **Checkout** — Address management, COD payment, order notes
- **Orders** — Visual order tracker with status pipeline
- **Profile** — Edit info, change password, manage addresses
- **Wishlist** — Save & move to cart

### Admin Panel (`/admin`)
- **Dashboard** — KPI cards, revenue chart, low-stock alerts, recent orders
- **Products** — Full CRUD with Cloudinary image upload
- **Categories**, **Coupons**, **Banners** — Full management
- **Orders** — Inline status updates (Pending → Delivered)
- **Customers** — Block/unblock
- **Reviews** — Approve/reject/delete
- **Inventory** — Inline stock updates

### Sample Coupon Codes
| Code | Discount |
|------|---------|
| `WELCOME10` | 10% off |
| `FLAT500` | ₹500 off |
| `FIRST20` | 20% off |

---

## 🌐 Deployment

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` environment variable to your backend URL

### Backend → Railway
1. Push `backend/` with `Dockerfile` to GitHub
2. Create a new Railway project, connect the repo
3. Add MySQL service; set environment variables:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `FRONTEND_URL` (Vercel URL for CORS)

---

## 🎨 Design System

- **Theme**: Black `#0A0A0A` + Gold `#D4AF37` luxury palette
- **Typography**: Cormorant Garamond (display) + Inter (body)
- **Effects**: Glassmorphism, shimmer loading, hover animations, gold borders

---

*Built with ❤️ by the PERfume team*
