# 🏛️ LuxeStay | Global Luxury Property Rental Platform

An enterprise full-stack luxury hospitality platform engineered for high-concurrency reservation workflows, zero-loss ACID transactions, and zero-trust edge security.

---

## 🛠️ Tech Stack

### Frontend
[![React 18](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

### Backend & Middleware
[![Node.js LTS](https://img.shields.io/badge/Node.js_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express 5](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Stripe SDK](https://img.shields.io/badge/Stripe_SDK-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

### Database & DevOps
[![MongoDB 7.0](https://img.shields.io/badge/MongoDB_7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker Multi-Stage](https://img.shields.io/badge/Docker_Multi_Stage-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Nginx Alpine](https://img.shields.io/badge/Nginx_Alpine-009639?style=for-the-badge&logo=nginx&logoColor=white)](https://www.nginx.com/)

---

### Architecture Overview

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons, i18n Translation Dictionary |
| **Backend** | Node.js (ESM), Express 5, Mongoose ODM, JWT Authentication Pipeline |
| **Database** | MongoDB Atlas 7.0 (Multi-Document ACID Transactions, 2dsphere Spatial Index) |
| **DevOps & Edge** | Docker, Docker Compose (Multi-stage builds), Nginx (Alpine), Gzip Compression |

---

## 🚀 1. System Architecture & Topology

LuxeStay employs an N-Tier architecture designed to prevent race conditions during high-volume booking conflicts, isolate client state across an Alpine Nginx reverse proxy, and guard core resources behind stateless JWT session tokens.

```text
                              [ HTTPS Edge Traffic ]
                                         │
                                         ▼
                   ┌───────────────────────────────────────────┐
                   │             Alpine Nginx Proxy            │
                   │  - SPA Fallback (`/index.html`)           │
                   │  - Gzip / Brotli Static Asset Caching     │
                   │  - Hardened Headers (CSP, HSTS, Sniff)    │
                   └─────────────────────┬─────────────────────┘
                                         │
                        ┌────────────────┴────────────────┐
                        │ /api/v1/*                       │ /* (Static SPA)
                        ▼                                 ▼
      ┌───────────────────────────────────┐     ┌───────────────────┐
      │      Express 5 Node API Cluster   │     │  Vite React 18    │
      │  - Unprivileged `node` container  │     │  SPA Distribution │
      │  - In-Place NoSQL Sanitization    │     └───────────────────┘
      │  - Dual-Token Auth Pipeline       │
      └─────────────────┬─────────────────┘
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│     MongoDB Atlas Cluster    │   │      Stripe Billing API      │
│  - Multi-Document ACID       │   │  - Idempotent Webhooks       │
│  - 2dsphere Spatial Index    │   │  - Dynamic Session Quotes    │
│  - SHA-256 Token Vault       │   └──────────────────────────────┘
└──────────────────────────────┘



⚙️ 2. Technical Case Study: Concurrency & ACID Transactions

Concurrency Challenge: Double-Booking in Distributed Systems

In luxury accommodation platforms with multi-night reservations, race conditions present critical integrity risks. When two guests concurrently book overlapping dates for the same sanctuary, standard check-then-insert patterns fail due to execution interleaving between the check and commit phases.

Engineering Solution: Multi-Document ACID Transactions
LuxeStay mitigates collision vulnerabilities through an atomic booking engine utilizing MongoDB replica set sessions (session.startTransaction()).

Overlap Formula Matrix:
Two intervals $[A_{\text{start}}, A_{\text{end}}]$ and $[B_{\text{start}}, B_{\text{end}}]$ overlap if and only if:
             
               $$\text{Overlap} \iff (A_{\text{start}} < B_{\text{end}}) \land (A_{\text{end}} > B_{\text{start}})$$

        // Atomically isolated inside an active transaction session
                const collision = await Booking.findOne({
                property: propertyId,
                status: { $in: ['confirmed', 'pre-allocated'] },$and: [
                    { checkIn: { $lt: requestedCheckOut } },
                    { checkOut: { $gt: requestedCheckIn } }
                ]
                }).session(mongoSession);

                if (collision) {
                await mongoSession.abortTransaction();
                throw new ApiError('Sanctuary already allocated for selected window.', 409);
                }


🔒 3. Defense-in-Depth Security Model


Security Vector,Implementation Mechanism,Defensive Guarantee
Authentication,"Dual-Token JWT (httpOnly, Secure, SameSite=Strict)",Eliminates XSS script token theft; local storage remains token-free.
Token Hijacking,SHA-256 database-level token hashing with automatic rotation,A compromised refresh token revokes all existing sessions upon reuse.
NoSQL Injection,Express 5 native recursive object key sanitization,"Disarms $where, $gt, and prototype poisoning attacks."
Data Integrity,Strict Zod contracts + Server-side fee calculation,Ignores client-supplied pricing; calculates nights and 12% concierge fees server-side.
Spatial Indexing,Geospatial GeoJSON point validation (2dsphere),Enables bounding-box filtering and geographic proximity queries.


📦 4. Production Containerization & Deployment
Environment Preparation (.env):


        PORT=5000
        MONGO_URI=mongodb+srv://<user>:<password>@cluster0.tmr068v.mongodb.net/luxestay?retryWrites=true&w=majority
        JWT_ACCESS_SECRET=your_32_char_random_cryptographic_access_key
        JWT_REFRESH_SECRET=your_32_char_random_cryptographic_refresh_key
        STRIPE_SECRET_KEY=sk_test_...
        STRIPE_WEBHOOK_SECRET=whsec_...
        CLIENT_URL=http://localhost


Orchestrated Launch (Docker Compose):

        # Build production images and run in background
        docker compose up --build -d

        # Verify container runtime health
        docker compose ps


🔌 5. API Reference Matrix


        Method  Endpoint          Description
        POST   /api/v1/auth/         register,Create Guest or Host account
        POST   /api/v1/auth/login    Authenticate & issue secure cookies
        GET    /api/v1/auth/me       Retrieve verified identity context
        GET    /api/v1/properties    "Faceted search, filtering, and pagination"
        POST   /api/v1/properties   Publish architectural residence [Host/Admin]
        POST   /api/v1/bookings     Atomic reservation pre-allocation (ACID)
        GET    /api/v1/bookings/my-bookings  List authenticated guest stay history
        POST   /api/v1/payments/checkout-session/:bookingId   Initialize Stripe checkout


<FollowUp label="Would you like me to help you push this updated README to your GitHub repository now?" query="How do I commit and push this updated README.md to GitHub?"/>