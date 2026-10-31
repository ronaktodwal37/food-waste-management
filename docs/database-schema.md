# Firestore Database Schema Specification
**Project: Zero-Waste Food Sharing & Redistribution Platform**

This document specifies the exact fields, data types, constraints, and relationships for the 17 Firestore collections.

---

### 1. `users`
- `uid`: string (Primary Document ID, matches Firebase Auth UID)
- `email`: string
- `displayName`: string
- `role`: enum (`'FOOD_DONOR' | 'NGO' | 'VOLUNTEER' | 'COMMUNITY_USER' | 'ADMIN'`)
- `isApproved`: boolean (Admin approved status, default `false` for NGO)
- `status`: enum (`'ACTIVE' | 'SUSPENDED' | 'PENDING'`)
- `phoneNumber`: string (optional)
- `photoURL`: string (optional)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### 2. `organizations`
- `orgId`: string (Primary Document ID)
- `ownerUid`: string (ref: `users.uid`)
- `type`: enum (`'DONOR' | 'NGO'`)
- `name`: string
- `registrationNumber`: string
- `verificationDocUrls`: array of strings
- `isVerified`: boolean (default `false`)
- `verifiedAt`: Timestamp (optional)
- `verifiedByAdminUid`: string (optional)
- `address`: string
- `location`: GeoPoint `{ latitude: number, longitude: number }`
- `geohash`: string
- `serviceRadiusKm`: number (for NGOs, default 10)
- `receivingCapacityServings`: number (for NGOs)
- `currentDailyAllocatedServings`: number
- `dietaryPreferences`: array of strings (`['VEGETARIAN', 'HALAL', 'VEGAN', 'GENERAL']`)
- `operatingHours`: map `{ open: string, close: string }`
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### 3. `volunteerProfiles`
- `volunteerUid`: string (Primary Document ID, ref: `users.uid`)
- `totalCredits`: number (default 0)
- `totalDeliveries`: number (default 0)
- `totalHoursVolunteered`: number (default 0)
- `totalMealsRedistributed`: number (default 0)
- `serviceAreaRadiusKm`: number
- `homeLocation`: GeoPoint
- `geohash`: string
- `vehicleType`: enum (`'WALKING' | 'BICYCLE' | 'SCOOTER' | 'CAR' | 'VAN'`)
- `availabilityStatus`: enum (`'AVAILABLE' | 'BUSY' | 'OFFLINE'`)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### 4. `foodListings`
- `listingId`: string (Primary Document ID)
- `donorUid`: string (ref: `users.uid`)
- `donorOrgId`: string (ref: `organizations.orgId`)
- `foodName`: string
- `category`: enum (`'COOKED_MEALS' | 'BAKERY' | 'PRODUCE' | 'DAIRY' | 'PACKAGED'`)
- `totalServings`: number
- `remainingServings`: number
- `unit`: string (`'meals'`, `'kg'`, `'boxes'`)
- `preparationTime`: Timestamp
- `pickupDeadline`: Timestamp
- `storageCondition`: enum (`'AMBIENT' | 'REFRIGERATED' | 'FROZEN' | 'HOT_HEATED'`)
- `allergens`: array of strings (`['PEANUTS', 'DAIRY', 'GLUTEN', 'SOY', 'NONE']`)
- `safetyDeclarationSigned`: boolean
- `imageUrls`: array of strings
- `pickupLocation`: GeoPoint
- `pickupAddress`: string
- `geohash`: string
- `status`: enum (`'AVAILABLE' | 'PARTIALLY_ALLOCATED' | 'FULLY_ALLOCATED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'`)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### 5. `foodAllocations`
- `allocationId`: string (Primary Document ID)
- `listingId`: string (ref: `foodListings.listingId`)
- `donorUid`: string (ref: `users.uid`)
- `ngoUid`: string (ref: `users.uid`)
- `ngoOrgId`: string (ref: `organizations.orgId`)
- `allocatedServings`: number
- `status`: enum (`'PENDING_VOLUNTEER' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED' | 'REJECTED'`)
- `rejectionReason`: string (optional)
- `allocatedAt`: Timestamp
- `updatedAt`: Timestamp

### 6. `volunteerTasks`
- `taskId`: string (Primary Document ID)
- `allocationId`: string (ref: `foodAllocations.allocationId`)
- `listingId`: string (ref: `foodListings.listingId`)
- `volunteerUid`: string (ref: `users.uid` | null)
- `donorLocation`: GeoPoint
- `ngoLocation`: GeoPoint
- `estimatedDistanceKm`: number
- `isUrgent`: boolean
- `status`: enum (`'OPEN' | 'ACCEPTED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'`)
- `acceptedAt`: Timestamp (optional)
- `completedAt`: Timestamp (optional)

### 7. `deliveries`
- `deliveryId`: string (Primary Document ID)
- `taskId`: string (ref: `volunteerTasks.taskId`)
- `volunteerUid`: string
- `donorUid`: string
- `ngoUid`: string
- `pickupVerifiedAt`: Timestamp (optional)
- `deliveryVerifiedAt`: Timestamp (optional)
- `discrepancyReported`: boolean
- `discrepancyNotes`: string (optional)
- `status`: enum (`'PENDING_PICKUP' | 'IN_TRANSIT' | 'COMPLETED' | 'FAILED'`)

### 8. `deliveryVerifications`
*(Sensitive collection: No direct client reads. Firebase Admin SDK only.)*
- `verificationId`: string (ref: `deliveries.deliveryId`)
- `pickupOtpHashed`: string (SHA-256)
- `pickupExpiresAt`: Timestamp
- `pickupAttempts`: number (max 3)
- `deliveryOtpHashed`: string (SHA-256)
- `deliveryExpiresAt`: Timestamp
- `deliveryAttempts`: number (max 3)

### 9. `volunteerCredits`
- `creditId`: string (Primary Document ID)
- `volunteerUid`: string
- `deliveryId`: string
- `amount`: number
- `reason`: string
- `idempotencyKey`: string (unique per delivery to prevent double-award)
- `createdAt`: Timestamp

### 10. `creditRules`
- `ruleId`: string
- `baseShortDistanceCredits`: number (e.g. 30)
- `baseMediumDistanceCredits`: number (e.g. 50)
- `baseLongDistanceCredits`: number (e.g. 80)
- `urgentBonusCredits`: number (e.g. 20)
- `isActive`: boolean

### 11. `badges` & 12. `volunteerBadges`
- Badges definition and user association with award timestamps.

### 13. `communityRequests`
- Peer-to-peer neighborhood food sharing requests.

### 14. `notifications`
- Recipient alerts with read status.

### 15. `reports`
- Unsafe food and compliance reports for administrator review.

### 16. `impactRecords`
- Verified aggregate metrics (meals diverted, CO2e saved, recipient count).

### 17. `auditLogs`
- Immutable audit records for authentication, allocation transactions, and verifications.
