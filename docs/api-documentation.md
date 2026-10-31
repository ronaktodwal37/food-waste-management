# REST API Specification & Roadmap
**Project: Zero-Waste Food Sharing & Redistribution Platform**

## Base URL
- Unified Dev Server: `http://localhost:3000/api/v1`
- Standalone Backend Server: `http://localhost:5000/api/v1`

---

## Phase 1 Active Endpoints

### 1. Health Check
- **URL**: `GET /api/health` or `GET /api/v1/health`
- **Access**: Public
- **Rate Limit**: 100 requests per 15 min window
- **Sample Response**:
```json
{
  "status": "healthy",
  "application": "Zero-Waste Food Sharing & Redistribution Platform API",
  "phase": "Phase 1 - Foundations & Architecture",
  "timestamp": "2026-10-31T01:45:00.000Z",
  "uptimeSeconds": 142,
  "environment": "development",
  "version": "1.0.0",
  "system": {
    "platform": "linux",
    "nodeVersion": "v22.14.0",
    "memory": {
      "heapUsedMB": 38.2,
      "heapTotalMB": 52.8
    }
  },
  "integrations": {
    "firebaseAdmin": {
      "initialized": false,
      "projectIdConfigured": false,
      "clientEmailConfigured": false,
      "privateKeyConfigured": false
    },
    "database": "Firestore (configured for Phase 2/3)",
    "storage": "Firebase Storage (configured for Phase 10)",
    "maps": "OpenStreetMap + Leaflet (configured for Phase 5)"
  },
  "modules": {
    "auth": "Pending Phase 2",
    "donor": "Pending Phase 3",
    "ngo": "Pending Phase 4",
    "matching": "Pending Phase 5",
    "allocation": "Pending Phase 6",
    "volunteer": "Pending Phase 7-8",
    "community": "Pending Phase 9",
    "admin": "Pending Phase 11"
  }
}
```

### 2. API v1 Catalog Index
- **URL**: `GET /api/v1`
- **Access**: Public
- **Description**: Returns all API version modules and active routes.

---

## Phase 2+ Authentication Header
All future protected endpoints will enforce:
```http
Authorization: Bearer <firebase_id_token>
```
Decoded via Firebase Admin SDK with server-side RBAC verification.
