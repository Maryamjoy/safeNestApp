# 🏠 Rental Listing Verification Platform (Backend)
**Property Module**

This is the core property management engine for a secure rental ecosystem. It solves the "Rental Fraud Gap" in African cities by implementing strict verification workflows and address-fingerprinting.

## 🚀 Key Features
- **Anti-Fraud Hash:** Every property has a unique "fingerprint" based on its address. Scammers cannot list the same house twice.
- **Resale Logic:** Smart detection for property re-listing (Rent/Sale) while requiring updated documents.
- **Nigerian Fee Structure:** Built-in transparency for Rent, Agency, Legal, and Caution fees (The "Total Package").
- **Admin Verification:** A "Gold-Stamp" workflow where properties only appear in searches after Admin review.
- **Smart Filtering:** Advanced search by location, property type, and price range.

## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Cloud)
- **ODM:** Mongoose
- **ID System:** UUID v4

## 📂 API Documentation (How to use my code)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/properties/create` | Landlord/Agent creates a new listing (Starts as 'Pending') |
| **GET** | `/api/properties/all` | View all verified and available properties |
| **GET** | `/api/properties/search` | Search with filters (e.g., `?city=Lekki&maxPrice=500000`) |
| **PATCH** | `/api/properties/update/:id` | Update property details or availability |
| **PATCH** | `/api/properties/verify/:id` | **(Admin Only)** Change status to 'Verified' |
| **DELETE** | `/api/properties/delete/:id` | Remove a listing |

## ⚙️ Local Setup
1. Clone the repository.
2. Run `npm install` to get the dependencies.
3. Create a `.env` file and add your `DATABASE_URL`.
4. Run `node index.js` to start the server.