# Backend API Documentation

## Overview
- This is an Express + MongoDB (Mongoose) backend for a cloth rental website. It manages products, categories, banners, Instagram posts, testimonials, and authentication for users and admins.
- All Express routes are defined in the `/routes` folder and controllers are in `/controllers`.
- All Mongoose models are defined in the `/models` folder.

## Base URL
- Local base URL: `http://localhost:5000/`
- Route mounts (from `server.js`):
  - `/api/products` -> product routes
  - `/api/banners` -> banner routes
  - `/api/insta` -> instagram post routes
  - `/api/auth` -> authentication routes (users + admins)
  - `/api/categories` -> category routes
  - `/api/testimonials` -> testimonial routes

---

## Models

### Model: Admin
- Collection: `admins` (default pluralized name)
- Fields:

| Field | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| name | String | no | - | Admin display name |
| email | String | yes | - | Admin email, unique, lowercased and trimmed |
| password | String | yes | - | Hashed password |
| role | String | no | `admin` | Enum of `['admin']` |
| refreshTokens | Array<String> | no | [] | Stored refresh tokens for session rotation |
| createdAt / updatedAt | Date | - | set by timestamps | Timestamps (auto)

Example JSON object:

```json
{
  "_id": "64a1f2e9b9c8a0d1e2f3a456",
  "name": "Site Admin",
  "email": "admin@example.com",
  "role": "admin",
  "refreshTokens": [],
  "createdAt": "2025-11-17T00:00:00.000Z",
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

---

### Model: Banner
- Collection: `banners`
- Fields:

| Field | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| title | String | no | - | Optional banner title |
| category | String | no | - | Optional category label for banner |
| imageUrl | String | yes | - | URL returned by Cloudinary for the banner image |
| imagePublicId | String | yes | - | Cloudinary public id used to delete the image |
| createdAt / updatedAt | Date | - | set by timestamps | Timestamps (auto)

Example JSON object:

```json
{
  "_id": "64a1f3b7b9c8a0d1e2f3a457",
  "title": "Diwali Collection",
  "category": "Festive",
  "imageUrl": "https://res.cloudinary.com/.../v12345/banners/1234.jpg",
  "imagePublicId": "banners/169",
  "createdAt": "2025-11-17T00:00:00.000Z",
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

---

### Model: Category
- Collection: `categories`
- Fields:

| Field | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| name | String | yes | - | Category name (unique, trimmed) |
| description | String | no | - | Optional description |
| image | String | no | - | Optional URL for category thumbnail/banner |
| createdAt / updatedAt | Date | - | set by timestamps | Timestamps (auto)

Example JSON object:

```json
{
  "_id": "64a1f4d0b9c8a0d1e2f3a458",
  "name": "Sarees",
  "description": "Traditional sarees",
  "image": "https://.../categories/sarees.jpg",
  "createdAt": "2025-11-17T00:00:00.000Z",
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

---

### Model: InstaPost
- Collection: `instaposts`
- Fields:

| Field | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| caption | String | no | - | Optional caption for the Instagram post |
| postUrl | String | yes | - | Instagram post URL (validated against Instagram patterns) |
| createdAt / updatedAt | Date | - | set by timestamps | Timestamps (auto)

Validation:
- `postUrl` is validated with a regex to match Instagram post/reel/tv URLs. If invalid, Mongoose validation error occurs.

Example JSON object:

```json
{
  "_id": "64a1f5a1b9c8a0d1e2f3a459",
  "caption": "New arrivals!",
  "postUrl": "https://www.instagram.com/p/ABC123xyz/",
  "createdAt": "2025-11-17T00:00:00.000Z",
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

---

### Model: Product
- Collection: `products`
- Fields:

| Field | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| name | String | yes | - | Product name, trimmed |
| category | ObjectId (`Category`) | yes | - | Reference to `Category` model |
| price | Number | yes | - | Product price (number) |
| description | String | no | - | Optional description |
| stock | Number | no | 0 | Units in stock |
| rating | Number | no | 0 | Rating between 0 and 5 (min 0, max 5) |
| images | Array of {url, publicId} | depends | - | Image objects uploaded to Cloudinary (url and publicId required per image) |
| available | Boolean | no | true | Whether product is available for rent |
| createdAt / updatedAt | Date | - | set by timestamps | Timestamps (auto)

Example JSON object:

```json
{
  "_id": "64a1f6c3b9c8a0d1e2f3a460",
  "name": "Red Banarasi Saree",
  "category": {
    "_id": "64a1f4d0b9c8a0d1e2f3a458",
    "name": "Sarees"
  },
  "price": 1200,
  "description": "Silk banarasi saree",
  "stock": 3,
  "rating": 4.5,
  "images": [
    { "url": "https://res.cloudinary.com/.../products/1.jpg", "publicId": "products/169-1" }
  ],
  "available": true,
  "createdAt": "2025-11-17T00:00:00.000Z",
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

---

### Model: Testimonial
- Collection: `testimonials`
- Fields:

| Field | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| userName | String | yes | - | Name of the user leaving testimonial |
| comment | String | yes | - | Testimonial comment |
| rating | Number | yes | - | Rating between 1 and 5 (min 1, max 5) |
| product | ObjectId (`Product`) | yes | - | Reference to a product |
| createdAt | Date | no | Date.now | Creation date (also timestamps applied)
| createdAt / updatedAt | Date | - | set by timestamps | Timestamps (auto)

Example JSON object:

```json
{
  "_id": "64a1f7d2b9c8a0d1e2f3a461",
  "userName": "Priya",
  "comment": "Lovely saree, great condition.",
  "rating": 5,
  "product": "64a1f6c3b9c8a0d1e2f3a460",
  "createdAt": "2025-11-17T00:00:00.000Z"
}
```

---

### Model: User
- Collection: `users`
- Fields:

| Field | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| name | String | yes | - | User's full name (trimmed) |
| email | String | yes | - | Unique user email, lowercased and trimmed |
| password | String | yes | - | Hashed password |
| role | String | no | `user` | Enum of `['user']` |
| refreshTokens | Array<String> | no | [] | Stored refresh tokens for session rotation |
| createdAt / updatedAt | Date | - | set by timestamps | Timestamps (auto)

Example JSON object:

```json
{
  "_id": "64a1f8e1b9c8a0d1e2f3a462",
  "name": "Rohit",
  "email": "rohit@example.com",
  "role": "user",
  "refreshTokens": [],
  "createdAt": "2025-11-17T00:00:00.000Z",
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

---

## Routes

Below each router's endpoints are documented. Full base URLs use `http://localhost:5000` as root.

### Auth Routes (`/api/auth`)
Located in `routes/authRoutes.js` and handled by `controllers/authController.js`.

#### POST /api/auth/register
**Description:** Register a new user (route enabled but optional).  
**Path Params:** none.  
**Query Params:** none.
**Request Body:**
- `name` (String) **required**
- `email` (String) **required**
- `password` (String) **required**

Example request:

```json
{ "name": "Rohit", "email": "rohit@example.com", "password": "secret" }
```

**Response:** 201 Created on success
```json
{ "message": "User registered successfully", "user": { "id": "...", "name": "Rohit", "email": "rohit@example.com", "role": "user" } }
```

**Errors:** 400 (missing fields), 409 (email exists), 500 (server error)

#### POST /api/auth/login
**Description:** Unified login for admins and users.  
**Request Body:**
- `email` (String) **required**
- `password` (String) **required**
- `role` (String) optional — `admin` or `user` to hint which collection to check

Example request:

```json
{ "email": "admin@example.com", "password": "secret", "role": "admin" }
```

**Response:** 200 OK
```json
{
  "message": "Login successful",
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "user": { "id": "...", "name": "Admin", "email": "admin@example.com", "role": "admin" }
}
```

**Errors:** 400 (missing fields), 401 (invalid credentials), 500 (server error)

#### POST /api/auth/logout
**Description:** Logout by invalidating a refresh token.  
**Request Body:**
- `refreshToken` (String) **required**

Example request:

```json
{ "refreshToken": "<refresh-token>" }
```

**Response:** 200 OK
```json
{ "message": "Logout successful" }
```

**Errors:** 400 (missing/invalid token), 500

#### POST /api/auth/token
**Description:** Refresh access token using a refresh token.  
**Request Body:**
- `refreshToken` (String) **required**

Example response:

```json
{ "message": "Token refreshed successfully", "accessToken": "<jwt>", "refreshToken": "<new-refresh>" }
```

**Errors:** 400, 401 (invalid/expired), 500

#### GET /api/auth/profile
**Description:** Return the authenticated account profile (works for admin or user).  
**Headers:** `Authorization: Bearer <accessToken>` required. Uses `verifyToken` middleware.  
**Response:** 200 OK
```json
{ "user": { "_id": "...", "name": "...", "email": "...", "role": "..." } }
```

**Errors:** 401 (missing/invalid token), 404 (not found), 500

---

### Banner Routes (`/api/banners`)
Located in `routes/bannerRoutes.js` and `controllers/bannerController.js`.

#### POST /api/banners
**Description:** Upload a banner image (Cloudinary) and create Banner document.  
**Middleware:** `bannerUpload.single('image')` — multipart/form-data with field `image`.  
**Request Body (form-data):**
- `image` file (image) **required**
- `title` (String) optional
- `category` (String) optional

Example response: 201 Created
```json
{ "message": "Banner uploaded successfully", "banner": { "title": "...", "category": "...", "imageUrl": "...", "imagePublicId": "...", "_id": "..." } }
```

**Errors:** 400 (missing image), 500

#### GET /api/banners
**Description:** Get all banners, sorted by newest first.  
**Response:** 200 OK — array of banner objects (see Banner model)

#### DELETE /api/banners/:id
**Description:** Delete a banner by id. Also attempts to remove image from Cloudinary.  
**Path Params:** `id` banner ObjectId  
**Response:** 200 OK
```json
{ "message": "Banner deleted successfully" }
```
**Errors:** 404 (not found), 500

---

### Category Routes (`/api/categories`)
Located in `routes/categoryRoutes.js` and `controllers/categoryController.js`.

#### GET /api/categories
**Description:** Fetch all categories.  
**Response:** 200 OK — array of category objects

#### GET /api/categories/:id/products
**Description:** Fetch products for a given category id.  
**Path Params:** `id` (Category ObjectId)  
**Response:** 200 OK — array of populated product objects

#### POST /api/categories
**Description:** Create a new category (protected).  
**Middleware:** `verifyToken` required (admin token expected).  
**Request Body (JSON):**
- `name` (String) **required**
- `description` (String) optional
- `image` (String) optional (URL)

Example request:

```json
{ "name": "Sarees", "description": "Traditional sarees" }
```

**Response:** 201 Created — created category object

**Errors:** 400 (missing name), 409 (already exists), 500

---

### Instagram Routes (`/api/insta`)
Located in `routes/instaRoutes.js` and `controllers/instaController.js`.

#### POST /api/insta
**Description:** Add an Instagram post record.  
**Request Body:**
- `postUrl` (String) **required** — must be a valid Instagram post/reel/tv URL
- `caption` (String) optional

Example request:

```json
{ "postUrl": "https://www.instagram.com/p/ABC123/", "caption": "New drop" }
```

**Response:** 201 Created
```json
{ "message": "Instagram post added successfully", "post": { /* InstaPost model */ } }
```

**Errors:** 400 (missing/invalid postUrl), 500

#### GET /api/insta
**Description:** Get all Instagram posts.  
**Response:** 200 OK — array of InstaPost objects

#### DELETE /api/insta/:id
**Description:** Delete a post by id.  
**Path Params:** `id` Instagram post ObjectId
**Response:** 200 OK
```json
{ "message": "Instagram post deleted successfully" }
```
**Errors:** 404 (not found), 500

---

### Product Routes (`/api/products`)
Located in `routes/productRoutes.js` and `controllers/productController.js`.

#### GET /api/products
**Description:** Get all products (populates `category`).  
**Response:** 200 OK — array of Product objects

#### GET /api/products/top-picks
**Description:** Get products with `rating >= 4`, sorted by rating desc, limited to 10.  
**Response:** 200 OK — array of Product objects

#### GET /api/products/:id
**Description:** Get a single product by id (populates `category`).  
**Path Params:** `id` Product ObjectId  
**Response:** 200 OK — Product object or 404 if not found

#### POST /api/products
**Description:** Create a new product.  
**Middleware:** `verifyToken` required; `productUpload.array('images', 4)` handles up to 4 image files as `images` field (multipart/form-data).  
**Request Body (form-data):**
- `images` files (0..4) optional — each image saved to Cloudinary
- `name` (String) **required**
- `category` (String/ObjectId) **required**
- `price` (Number) optional (but controller checks presence)
- `description` (String) optional
- `available` (Boolean) optional

Example request (form-data): fields `name`, `category`, `price`, files `images`.

**Response:** 201 Created — created Product object (populated `category`)

**Errors:** 400 (missing name/category), 500

#### DELETE /api/products/:id
**Description:** Delete a product and all images from Cloudinary.  
**Middleware:** `verifyToken` required.  
**Path Params:** `id` Product ObjectId  
**Response:** 200 OK
```json
{ "message": "Product deleted successfully" }
```
**Errors:** 404 (not found), 500

---

### Testimonial Routes (`/api/testimonials`)
Located in `routes/testimonialRoutes.js` and `controllers/testimonialController.js`.

#### POST /api/testimonials
**Description:** Create a testimonial for a product.  
**Request Body (JSON):**
- `userName` (String) **required**
- `comment` (String) **required**
- `rating` (Number) **required** (1..5)
- `product` (String/ObjectId) **required**

Example request:

```json
{ "userName": "Priya", "comment": "Great!", "rating": 5, "product": "64a1f6c3..." }
```

**Response:** 201 Created — saved testimonial object

**Errors:** 400 (missing fields), 500

#### GET /api/testimonials
**Description:** Get all testimonials (populates product name).  
**Response:** 200 OK — array of testimonial objects

#### GET /api/testimonials/product/:productId
**Description:** Get testimonials for a given product.  
**Path Params:** `productId` Product ObjectId  
**Response:** 200 OK — array of testimonial objects

#### PUT /api/testimonials/:id
**Description:** Update a testimonial (partial updates allowed).  
**Request Body:** fields to update (e.g., `comment`, `rating`, `userName`)  
**Response:** 200 OK — updated testimonial object, 404 if not found

#### DELETE /api/testimonials/:id
**Description:** Delete a testimonial by id.  
**Response:** 200 OK — `{ "message": "Testimonial deleted" }` or 404 if not found

---

## Error Handling

- Common error response format used across controllers:

```json
{ "message": "Some error message" }
```

- Common status codes used:
  - `200 OK` — successful GET/DELETE/PUT where appropriate
  - `201 Created` — successful resource creation (POST)
  - `400 Bad Request` — missing or invalid input
  - `401 Unauthorized` — missing/invalid access token
  - `404 Not Found` — resource not found
  - `409 Conflict` — duplicates (e.g., category/user email)
  - `500 Internal Server Error` — server-side errors

Example error response:

```json
{ "message": "Server error creating product" }
```

---

## Notes & Implementation Details
- Authentication: `verifyToken` middleware (`middlewares/authMiddleware.js`) expects an `Authorization: Bearer <token>` header and verifies using `process.env.JWT_SECRET`. It sets `req.adminId` from token payload.
- Tokens: Access tokens expire in `15m`, refresh tokens expire in `7d` according to `controllers/authController.js` constants.
- File uploads: Cloudinary storage is configured via `multer-storage-cloudinary` in `middlewares/upload.js`. `productUpload` allows up to 4 images; `bannerUpload` expects a single `image` file.
- DB: Connection string taken from `process.env.MONGODB_URI` in `config/db.js`.

---

If you'd like, I can:
- Add this file to the repository (already created as `API_DOCUMENTATION.md`).
- Generate an OpenAPI (Swagger) spec from this extracted information.
- Run any additional scans to include sample cURL requests.

Would you like me to also produce cURL examples or a Swagger/OpenAPI spec next? 
