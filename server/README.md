# Cloth Rental Backend

Comprehensive Node.js + Express + MongoDB (Mongoose) API powering a dynamic cloth rental platform. Supports:

- Admin Authentication (JWT access + refresh tokens)
- Category-driven product listing (Category -> Products -> Product detail)
- Multi-image Product uploads to Cloudinary
- Banner Management (single `banners` folder)
- Instagram Post Link Management
- Secure deletion of Cloudinary assets
- Environment variable configuration with `dotenv`

---

## 1. Technology Stack
- Node.js / Express
- MongoDB Atlas via Mongoose
- Cloudinary (image storage)
- Multer + multer-storage-cloudinary
- JWT (access + refresh tokens)
- bcrypt (password hashing)
- cors, dotenv

---

## 2. Folder Structure (Key Files)
```
server.js
.env
config/
  db.js
  cloudinary.js
models/
  Product.js
  Category.js
  Banner.js
  InstaPost.js
  Admin.js
  User.js
controllers/
  productController.js
  categoryController.js
  bannerController.js
  instaController.js
  authController.js
middlewares/
  upload.js
  authMiddleware.js
routes/
  productRoutes.js
  categoryRoutes.js
  bannerRoutes.js
  instaRoutes.js
  authRoutes.js
```

---

## 3. Environment Variables (`.env`)
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```
Change secrets to long random strings. Never commit real secrets.

---

## 4. Data Models

### 4.1 Category (`models/Category.js`)
```
name: String (required, unique)
description: String
image: String (URL)
timestamps
```

### 4.2 Product (`models/Product.js`)
```
name: String (required)
category: ObjectId (ref: Category, required)
price: Number (default 0)
description: String
images: [ { url: String (required), publicId: String (required) } ] (up to 4 uploads)
available: Boolean (default true)
timestamps
```

### 4.3 Banner (`models/Banner.js`)
```
title: String (optional)
imageUrl: String (required)
imagePublicId: String (required)
timestamps
```

### 4.4 Instagram Post (`models/InstaPost.js`)
```
caption: String (optional)
postUrl: String (required, validated as Instagram URL)
timestamps
`````
  
### 4.5 Admin (`models/Admin.js`)
```
name: String
email: String (required, unique)
password: String (hashed)
role: String (default 'admin')
refreshTokens: [String]
timestamps
```

### 4.6 User (`models/User.js`)
```
name: String (required)
email: String (required, unique, lowercase)
password: String (hashed)
role: String (default 'user')
refreshTokens: [String]
timestamps
```

---

## 5. Authentication Flow
All authentication is now handled via unified endpoints under `/api/auth/...` which support BOTH admins and users. Admin creation is still limited (you may manually insert an Admin document if needed). Typical flow:

| Action | Endpoint | Body | Notes |
|--------|----------|------|-------|
| User Register | POST /api/auth/register | `{ name,email,password }` | Creates standard user |
| Login | POST /api/auth/login | `{ email,password, role? }` | If `role` omitted, auto-detect (admin first) |
| Profile | GET /api/auth/profile | Header: `Authorization: Bearer <accessToken>` | Returns unified user object |
| Refresh | POST /api/auth/token | `{ refreshToken }` | Rotates refresh token |
| Logout | POST /api/auth/logout | `{ refreshToken }` | Invalidates provided refresh token |

Tokens:
- Access token (JWT_SECRET, 15m) contains `{ id, role }`.
- Refresh token (JWT_REFRESH_SECRET, 7d) stored in `refreshTokens` array of User or Admin; rotated on refresh.
- Provide `role` during login for slightly faster lookup (skips one collection query) but it's optional.

---

## 6. Image Uploads
- Multer + Cloudinary Storage.
- Products stored in folder `products`.
- Banners stored in folder `banners`.
- Each uploaded file sets `file.path` (URL) and `file.filename` (publicId including folder).
- On deletion, `cloudinary.uploader.destroy(publicId)` is called for each asset.

Product multi-image Upload: field name `images`, max 4.

---

## 7. API Endpoints (Detailed)

### 7.1 Root
`GET /` → Returns simple health message.

### 7.2 Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/categories | List all categories (for homepage) |
| GET | /api/categories/:id/products | List products in a category (populated category) |
| POST | /api/categories | Create category (admin auth required) |

POST Body Example:
```json
{
  "name": "Lehengas",
  "description": "Traditional Indian outfits",
  "image": "https://cdn.example.com/images/lehengas.png"
}
```

### 7.3 Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List all products (category populated) |
| GET | /api/products/:id | Get single product detail (category populated) |
| POST | /api/products | Create product (admin auth + multi-image upload) |
| DELETE | /api/products/:id | Delete product (admin auth) |

Multipart POST Fields:
```
name (text, required)
category (text, Category ObjectId required)
price (text/number)
description (text)
available (text 'true'/'false')
images (file) repeated up to 4 times
```

Response includes populated category and array `images` with URLs.

### 7.4 Banners
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/banners | List banners |
| POST | /api/banners | Upload banner image (multipart) |
| DELETE | /api/banners/:id | Delete banner and Cloudinary image |

Multipart POST: `title` (optional), `image` (file).

### 7.5 Instagram Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/insta | List Instagram posts |
| POST | /api/insta | Add post (caption, postUrl) |
| DELETE | /api/insta/:id | Delete post |

Validation: `postUrl` must match pattern for `instagram.com/p|reel|tv/...`.

### 7.6 Admin Auth
| Method | Endpoint | Body |
|--------|----------|------|
| POST | /api/admin/register | `{ name, email, password }` |
| POST | /api/admin/login | `{ email, password }` |
| GET | /api/admin/profile | Header: `Authorization: Bearer <accessToken>` |
| POST | /api/admin/token | `{ refreshToken }` |
| POST | /api/admin/logout | `{ refreshToken }` |

Error Handling:
- 400 for missing required fields
- 401 for invalid/expired tokens or credentials
- 403 for forbidden operations (e.g., second admin register)
- 404 for not found resources
- 409 for conflicts (duplicate category/email)
- 500 for server errors

---

## 8. Curl Examples (PowerShell style)

### Create Category (Admin)
```powershell
curl.exe -X POST http://localhost:5000/api/admin/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@example.com","password":"Passw0rd!"}'
# Use returned accessToken below

curl.exe -X POST http://localhost:5000/api/categories `
  -H "Authorization: Bearer <ACCESS_TOKEN>" `
  -H "Content-Type: application/json" `
  -d '{"name":"Lehengas","description":"Traditional outfits"}'
```

### Create Product (Up to 4 Images)
```powershell
curl.exe -X POST http://localhost:5000/api/products `
  -H "Authorization: Bearer <ACCESS_TOKEN>" `
  -F "name=Emerald Lehenga" `
  -F "category=<CATEGORY_ID>" `
  -F "price=129.99" `
  -F "description=Designer multi-piece set" `
  -F "images=@'C:\Images\p1.jpg'" `
  -F "images=@'C:\Images\p2.jpg'" `
  -F "images=@'C:\Images\p3.jpg'" `
  -F "images=@'C:\Images\p4.jpg'"
```

### Get Products by Category
```powershell
curl.exe http://localhost:5000/api/categories/<CATEGORY_ID>/products
```

### Banner Upload
```powershell
curl.exe -X POST http://localhost:5000/api/banners `
  -F "title=Homepage Hero" `
  -F "image=@'C:\Images\hero.png'"
```

### Instagram Post Add
```powershell
curl.exe -X POST http://localhost:5000/api/insta `
  -H "Content-Type: application/json" `
  -d '{"caption":"Holiday Reel","postUrl":"https://www.instagram.com/reel/ABC12345/"}'
```

### Admin Token Refresh
```powershell
curl.exe -X POST http://localhost:5000/api/admin/token `
  -H "Content-Type: application/json" `
  -d '{"refreshToken":"<REFRESH_TOKEN>"}'
```

### Delete Product
```powershell
curl.exe -X DELETE http://localhost:5000/api/products/<PRODUCT_ID> `
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 9. Dynamic Frontend Usage Pattern
1. Home: call `GET /api/categories` -> render categories.
2. Category page: `GET /api/categories/:id/products` -> show product grid.
3. Product detail: `GET /api/products/:id` -> show images, category data.
4. Admin dashboard uses protected POST endpoints to add categories/products.
5. No hardcoding; newly added categories/products show immediately because frontend reads live endpoints.

---

## 10. Common Errors & Troubleshooting
| Issue | Cause | Resolution |
|-------|-------|------------|
| 401 Access token missing | No Authorization header | Add `Bearer <token>` |
| 401 Token expired | 15m access token lifetime | Use refresh endpoint to get new token |
| 409 Category already exists | Duplicate name | Choose a different name |
| 400 Missing category on product create | Category field omitted | Include valid Category ObjectId |
| Cloudinary delete fails | Wrong publicId or already deleted | Ignore; log shows error |
| SELF_SIGNED_CERT_IN_CHAIN | Corporate proxy | `npm config set strict-ssl false` temporarily |

---

## 11. Future Enhancements (Optional)
- Pagination & filtering on products (`?page=1&limit=20&search=lehenga`)
- Soft delete / archival
- Image transformations (thumbnails)
- Role-based auth (extend beyond single admin)
- Rate limiting & request logging
- Automated tests (Jest + Supertest + mongodb-memory-server)

---

## 12. Setup & Run
```powershell
npm install
npm run start   # or npm run dev
```

Ensure `.env` filled. When running locally behind company proxy disable strict SSL if needed.

---

## 13. License
ISC

---

## 14. Quick Reference Cheat Sheet
| Resource | List | Detail | Create | Delete |
|----------|------|--------|--------|--------|
| Categories | GET /api/categories | - | POST /api/categories | - |
| Category Products | GET /api/categories/:id/products | - | - | - |
| Products | GET /api/products | GET /api/products/:id | POST /api/products | DELETE /api/products/:id |
| Banners | GET /api/banners | - | POST /api/banners | DELETE /api/banners/:id |
| Instagram Posts | GET /api/insta | - | POST /api/insta | DELETE /api/insta/:id |
| Auth | - | GET /api/auth/profile | POST /api/auth/register /login /token /logout | - |

