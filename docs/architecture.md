# Architecture & System Design
**Project: Zero-Waste Food Sharing & Redistribution Platform**

## 1. High-Level Architectural Overview

```
                      +---------------------------------------+
                      |          React 19 SPA (Vite)          |
                      |   - OpenStreetMap + Leaflet           |
                      |   - Tailwind CSS Light Theme UI       |
                      |   - Firebase Auth Client SDK          |
                      +-------------------+-------------------+
                                          |
                        Bearer <firebase_id_token>
                                          v
                      +---------------------------------------+
                      |          Express.js REST API          |
                      |   - Helmet, CORS, Rate Limiters       |
                      |   - Firebase Admin SDK Token Verifier |
                      |   - Server-Side RBAC Middleware       |
                      |   - Transactional Allocation Engine   |
                      |   - Explainable Matching Algorithm    |
                      |   - Cryptographic OTP Handshake       |
                      +-------------------+-------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
                      v                                       v
          +------------------------+              +------------------------+
          | Cloud Firestore (DB)   |              | Firebase Cloud Storage |
          | 17 Scalable Colls      |              | - Food photos (Public) |
          | GeoPoints & Geohashes  |              | - NGO Docs (Private)   |
          | Strict Security Rules  |              | - Org Logos            |
          +------------------------+              +------------------------+
```

## 2. Core Architectural Principles

1. **Zero-Trust Client Identity & Role Control**:
   - The frontend never dictates user roles or verification states.
   - Roles (`FOOD_DONOR`, `NGO`, `VOLUNTEER`, `COMMUNITY_USER`, `ADMIN`) are stored securely in Firestore and verified through Firebase Admin SDK on every protected endpoint.
   - NGO verification requires administrative review and approval.

2. **Atomic Multi-NGO Allocations (ACID Concurrency)**:
   - When a donor lists 100 servings, multiple verified NGOs can claim portions (e.g., 40, 35, 25).
   - All claims are executed using Firestore atomic transactions (`runTransaction`), checking `status == AVAILABLE` and `remainingQuantity >= requestedQuantity` atomically to eliminate race conditions and double-claims.

3. **Dual OTP Custody Handshake**:
   - Server generates cryptographic OTPs.
   - Donor holds pickup OTP -> Volunteer enters OTP to verify physical collection.
   - NGO holds delivery OTP -> Volunteer enters OTP to confirm physical drop-off.
   - Server hashes OTPs and enforces rate-limited verification attempts.

4. **Explainable Matching Engine**:
   - Scores nearby NGOs (0 to 100) using transparent, configurable weighted logic:
     - Distance: 30%
     - Capacity: 30%
     - Urgency: 25%
     - Food Compatibility: 15%
   - Geohash queries (`geofire-common`) minimize query bandwidth.

5. **Volunteer Non-Cash Credit Ledger**:
   - Idempotent credit issuance upon verified delivery.
   - Badges, milestones, and monthly recognition leaderboards.
