# 🌸 Liorix — Luxury Perfume E-Commerce Store

A full-stack luxury perfume e-commerce web application built with **Spring Boot** (backend) and **React + Vite** (frontend). Features a rich, premium dark-gold UI, complete shopping flow, admin dashboard, and secure JWT-based authentication.

🚀 **Live Website Demo**: [https://perfume-frontend-qj60.onrender.com](https://perfume-frontend-qj60.onrender.com)

---

## ✨ Features

### 🛍️ User Features
- Browse products with filtering by category, gender, fragrance family, and price
- Product detail pages with image gallery, reviews, and related products
- Shopping cart with coupon code support
- Wishlist management with move-to-cart
- Full checkout and order placement
- Order history and order detail tracking
- User profile management with address book
- Fragrance quiz for personalized recommendations
- **Forgot Password** — secure token-based password reset flow
- JWT-based authentication (login, register, logout)

### 🔐 Admin Features
- Admin dashboard with sales analytics and metrics
- Product management (CRUD) with Cloudinary image uploads
- Category management
- Order management with status updates
- Customer management (block/unblock)
- Coupon management
- Banner management
- Review moderation
- Inventory tracking

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 17 | Language |
| Spring Boot 3.2 | Framework |
| Spring Security + JWT | Authentication |
| Spring Data JPA / Hibernate | ORM / Database |
| MySQL | Database |
| Cloudinary | Image storage |
| Lombok | Boilerplate reduction |
| Springdoc / Swagger UI | API documentation |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Framer Motion | Animations |
| React Hot Toast | Notifications |
| React Icons | Icon library |
| Vanilla CSS | Styling |

---

## 📁 Project Structure

```
PERfume/
├── backend/                          # Spring Boot API
│   └── src/main/java/com/perfume/
│       ├── config/                   # Security, CORS, JWT filter
│       ├── controller/               # REST controllers
│       ├── dto/                      # Request & response DTOs
│       ├── model/                    # JPA entities
│       ├── repository/               # Spring Data repositories
│       ├── service/                  # Business logic
│       └── util/                     # JWT, session utilities
│
└── frontend/                         # React + Vite app
    └── src/
        ├── components/               # Reusable UI components
        ├── context/                  # Auth, Cart, Wishlist context
        ├── pages/
        │   ├── user/                 # User-facing pages
        │   └── admin/                # Admin dashboard pages
        └── services/                 # Axios API service layer
```

---

## ⚙️ Setup & Running Locally

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8+

---

### 1. Clone the Repository

```bash
git clone https://github.com/akas-coder/Perfume-store.git
cd Perfume-store
```

---

### 2. Backend Setup

**Configure `application.properties`:**
```
cd backend/src/main/resources
```

Edit `application.properties` and update:
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/perfume_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Cloudinary (for image uploads)
cloudinary.cloud-name=YOUR_CLOUD_NAME
cloudinary.api-key=YOUR_API_KEY
cloudinary.api-secret=YOUR_API_SECRET

# JWT Secret
jwt.secret=YOUR_SECURE_SECRET_KEY
```

**Run the backend:**
```bash
cd backend
mvn spring-boot:run
```

The API will start at `http://localhost:8080`.  
Swagger UI is available at: `http://localhost:8080/swagger-ui.html`

> Hibernate will auto-create all database tables on first run (`ddl-auto=update`).

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will start at `http://localhost:5173`.

---

## 🔑 Default Admin Credentials

An admin account is seeded automatically on startup via `DataSeeder.java`.  
Navigate to `/admin/login` and use:

```
Email:    admin@perfume.com
Password: admin123
```

---

## 🔒 Forgot Password Flow

1. Click **"Forgot Password?"** on the login page
2. Enter your registered email address
3. Copy the generated reset link and open it in your browser
4. Enter your new password — tokens expire in **30 minutes** and are single-use

> In production, configure an SMTP service to send reset links via email.

---

## 📡 Key API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | User login | Public |
| `POST` | `/api/auth/forgot-password` | Request password reset | Public |
| `POST` | `/api/auth/reset-password` | Reset password with token | Public |
| `GET` | `/api/products` | List all products | Public |
| `GET` | `/api/products/{id}` | Product detail | Public |
| `GET` | `/api/cart` | Get user cart | User |
| `POST` | `/api/orders` | Place order | User |
| `GET` | `/api/admin/dashboard` | Admin analytics | Admin |

Full API docs: `http://localhost:8080/swagger-ui.html`

---

## 🖼️ Screenshots

> Coming soon

---

## 📄 License

This project is for educational purposes.

---

<div align="center">Made with ❤️ by <a href="https://github.com/akas-coder">akas-coder</a></div>
