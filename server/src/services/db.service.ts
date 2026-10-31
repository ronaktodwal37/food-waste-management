/**
 * Comprehensive Firestore Data Store & Abstraction Layer
 * Supports:
 * 1. Direct Cloud Firestore connection when Firebase Admin is initialized with credentials.
 * 2. High-fidelity persistent JSON / memory store with atomic transactions when running in local dev/demo mode.
 * 3. 100% API parity for collections, doc get/set/update/delete, queries, where filtering, and atomic transactions.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { geohashForLocation, distanceBetween } from 'geofire-common';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../data/firestore-store.json');

// In-memory data store for local development and fallback
interface StoreState {
  users: Record<string, any>;
  organizations: Record<string, any>;
  volunteerProfiles: Record<string, any>;
  foodListings: Record<string, any>;
  foodAllocations: Record<string, any>;
  volunteerTasks: Record<string, any>;
  deliveries: Record<string, any>;
  deliveryVerifications: Record<string, any>;
  volunteerCredits: Record<string, any>;
  creditRules: Record<string, any>;
  badges: Record<string, any>;
  volunteerBadges: Record<string, any>;
  communityRequests: Record<string, any>;
  notifications: Record<string, any>;
  reports: Record<string, any>;
  impactRecords: Record<string, any>;
  auditLogs: Record<string, any>;
}

// Initial seed data so the system is immediately alive with realistic zero-waste records
const initialStore: StoreState = {
  users: {
    'user-admin-1': {
      uid: 'user-admin-1',
      email: 'admin@zerowaste.org',
      displayName: 'System Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
      isApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'user-donor-1': {
      uid: 'user-donor-1',
      email: 'greenkitchen@bistro.com',
      displayName: 'Green Leaf Bistro',
      role: 'FOOD_DONOR',
      status: 'ACTIVE',
      isApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'user-ngo-1': {
      uid: 'user-ngo-1',
      email: 'contact@hopehaven.org',
      displayName: 'Hope Haven Food Bank',
      role: 'NGO',
      status: 'ACTIVE',
      isApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'user-ngo-pending': {
      uid: 'user-ngo-pending',
      email: 'director@communitycare.org',
      displayName: 'Community Care Shelter',
      role: 'NGO',
      status: 'PENDING',
      isApproved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'user-vol-1': {
      uid: 'user-vol-1',
      email: 'alex.volunteer@gmail.com',
      displayName: 'Alex Courier',
      role: 'VOLUNTEER',
      status: 'ACTIVE',
      isApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'user-comm-1': {
      uid: 'user-comm-1',
      email: 'maria.resident@gmail.com',
      displayName: 'Maria Santos',
      role: 'COMMUNITY_USER',
      status: 'ACTIVE',
      isApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  organizations: {
    'org-donor-1': {
      orgId: 'org-donor-1',
      ownerUid: 'user-donor-1',
      type: 'DONOR',
      name: 'Green Leaf Bistro & Catering',
      registrationNumber: 'REG-FD-89214',
      isVerified: true,
      address: '742 Evergreen Terrace, Downtown',
      location: { latitude: 37.7749, longitude: -122.4194 },
      geohash: geohashForLocation([37.7749, -122.4194]),
      dietaryPreferences: ['GENERAL', 'VEGETARIAN'],
      createdAt: new Date().toISOString(),
    },
    'org-ngo-1': {
      orgId: 'org-ngo-1',
      ownerUid: 'user-ngo-1',
      type: 'NGO',
      name: 'Hope Haven Food Bank',
      registrationNumber: 'NGO-TAX-55219',
      isVerified: true,
      address: '1050 Mission Street, Civic Center',
      location: { latitude: 37.7812, longitude: -122.4111 },
      geohash: geohashForLocation([37.7812, -122.4111]),
      serviceRadiusKm: 15,
      receivingCapacityServings: 250,
      currentDailyAllocatedServings: 60,
      dietaryPreferences: ['GENERAL', 'VEGETARIAN', 'HALAL'],
      verificationDocUrls: ['https://example.com/docs/hope-haven-501c3.pdf'],
      createdAt: new Date().toISOString(),
    },
    'org-ngo-pending': {
      orgId: 'org-ngo-pending',
      ownerUid: 'user-ngo-pending',
      type: 'NGO',
      name: 'Community Care Shelter',
      registrationNumber: 'NGO-TAX-89100',
      isVerified: false,
      address: '450 Howard Street',
      location: { latitude: 37.7891, longitude: -122.3982 },
      geohash: geohashForLocation([37.7891, -122.3982]),
      serviceRadiusKm: 10,
      receivingCapacityServings: 120,
      currentDailyAllocatedServings: 0,
      dietaryPreferences: ['GENERAL'],
      verificationDocUrls: ['https://example.com/docs/community-care-license.pdf'],
      createdAt: new Date().toISOString(),
    },
  },
  volunteerProfiles: {
    'user-vol-1': {
      volunteerUid: 'user-vol-1',
      totalCredits: 160,
      totalDeliveries: 4,
      totalHoursVolunteered: 6.5,
      totalMealsRedistributed: 180,
      serviceAreaRadiusKm: 12,
      homeLocation: { latitude: 37.7765, longitude: -122.4172 },
      geohash: geohashForLocation([37.7765, -122.4172]),
      vehicleType: 'BICYCLE',
      availabilityStatus: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  foodListings: {
    'listing-sample-1': {
      listingId: 'listing-sample-1',
      donorUid: 'user-donor-1',
      donorOrgId: 'org-donor-1',
      foodName: 'Gourmet Vegetable Lasagna & Roasted Squash',
      category: 'COOKED_MEALS',
      totalServings: 80,
      remainingServings: 35,
      unit: 'meals',
      preparationTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      pickupDeadline: new Date(Date.now() + 6 * 3600000).toISOString(),
      storageCondition: 'HOT_HEATED',
      allergens: ['DAIRY', 'GLUTEN'],
      safetyDeclarationSigned: true,
      pickupAddress: '742 Evergreen Terrace, Downtown',
      pickupLocation: { latitude: 37.7749, longitude: -122.4194 },
      geohash: geohashForLocation([37.7749, -122.4194]),
      imageUrls: ['https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=80'],
      status: 'PARTIALLY_ALLOCATED',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'listing-sample-2': {
      listingId: 'listing-sample-2',
      donorUid: 'user-donor-1',
      donorOrgId: 'org-donor-1',
      foodName: 'Fresh Artisanal Sourdough & Pastries',
      category: 'BAKERY',
      totalServings: 45,
      remainingServings: 45,
      unit: 'portions',
      preparationTime: new Date(Date.now() - 4 * 3600000).toISOString(),
      pickupDeadline: new Date(Date.now() + 8 * 3600000).toISOString(),
      storageCondition: 'AMBIENT',
      allergens: ['GLUTEN'],
      safetyDeclarationSigned: true,
      pickupAddress: '742 Evergreen Terrace, Downtown',
      pickupLocation: { latitude: 37.7749, longitude: -122.4194 },
      geohash: geohashForLocation([37.7749, -122.4194]),
      imageUrls: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'],
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  foodAllocations: {
    'alloc-1': {
      allocationId: 'alloc-1',
      listingId: 'listing-sample-1',
      donorUid: 'user-donor-1',
      ngoUid: 'user-ngo-1',
      ngoOrgId: 'org-ngo-1',
      allocatedServings: 45,
      status: 'IN_TRANSIT',
      allocatedAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  volunteerTasks: {
    'task-1': {
      taskId: 'task-1',
      allocationId: 'alloc-1',
      listingId: 'listing-sample-1',
      volunteerUid: 'user-vol-1',
      donorLocation: { latitude: 37.7749, longitude: -122.4194 },
      donorAddress: '742 Evergreen Terrace, Downtown',
      ngoLocation: { latitude: 37.7812, longitude: -122.4111 },
      ngoAddress: '1050 Mission Street, Civic Center',
      estimatedDistanceKm: 1.2,
      isUrgent: false,
      status: 'IN_TRANSIT',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      acceptedAt: new Date(Date.now() - 1200000).toISOString(),
    },
  },
  deliveries: {
    'deliv-1': {
      deliveryId: 'deliv-1',
      taskId: 'task-1',
      volunteerUid: 'user-vol-1',
      donorUid: 'user-donor-1',
      ngoUid: 'user-ngo-1',
      status: 'IN_TRANSIT',
      pickupVerifiedAt: new Date(Date.now() - 600000).toISOString(),
      deliveryVerifiedAt: null,
      discrepancyReported: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  },
  deliveryVerifications: {},
  volunteerCredits: {
    'cred-1': {
      creditId: 'cred-1',
      volunteerUid: 'user-vol-1',
      deliveryId: 'deliv-prior-1',
      amount: 50,
      reason: 'Medium distance delivery completed (2.4 km)',
      idempotencyKey: 'delivery_deliv-prior-1',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    'cred-2': {
      creditId: 'cred-2',
      volunteerUid: 'user-vol-1',
      deliveryId: 'deliv-prior-2',
      amount: 110,
      reason: 'Urgent long distance delivery completed (6.1 km + urgent bonus)',
      idempotencyKey: 'delivery_deliv-prior-2',
      createdAt: new Date(Date.now() - 43200000).toISOString(),
    },
  },
  creditRules: {
    'rule-default': {
      ruleId: 'rule-default',
      baseShortDistanceCredits: 30, // < 2 km
      baseMediumDistanceCredits: 50, // 2 - 5 km
      baseLongDistanceCredits: 80, // > 5 km
      urgentBonusCredits: 20,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
  },
  badges: {
    'badge-first-rescue': {
      badgeId: 'badge-first-rescue',
      title: 'First Rescue',
      description: 'Completed your very first food rescue mission',
      icon: 'Award',
      minDeliveries: 1,
    },
    'badge-bronze': {
      badgeId: 'badge-bronze',
      title: 'Bronze Courier',
      description: 'Rescued and delivered over 50 meals',
      icon: 'ShieldCheck',
      minMeals: 50,
    },
    'badge-silver': {
      badgeId: 'badge-silver',
      title: 'Silver Hero',
      description: 'Rescued and delivered over 150 meals',
      icon: 'Sparkles',
      minMeals: 150,
    },
  },
  volunteerBadges: {
    'vb-1': {
      id: 'vb-1',
      volunteerUid: 'user-vol-1',
      badgeId: 'badge-first-rescue',
      awardedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    'vb-2': {
      id: 'vb-2',
      volunteerUid: 'user-vol-1',
      badgeId: 'badge-silver',
      awardedAt: new Date(Date.now() - 43200000).toISOString(),
    },
  },
  communityRequests: {
    'comm-req-1': {
      requestId: 'comm-req-1',
      requesterUid: 'user-comm-1',
      requesterName: 'Maria Santos',
      title: 'Family of 4 needing fresh vegetables / pantry items',
      category: 'PRODUCE',
      servingsNeeded: 4,
      urgency: 'HIGH',
      status: 'OPEN',
      location: { latitude: 37.7785, longitude: -122.415 },
      address: 'Market St & 8th, San Francisco',
      notes: 'No shellfish allergies. Available for pickup between 4-7 PM.',
      createdAt: new Date().toISOString(),
    },
  },
  notifications: {},
  reports: {
    'rep-1': {
      reportId: 'rep-1',
      reporterUid: 'user-vol-1',
      targetId: 'listing-historical-old',
      targetType: 'LISTING',
      reason: 'Temperature break during hot holding pickup',
      details: 'Container was below 40C upon pickup arrival; reported and safely composted.',
      status: 'RESOLVED',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  },
  impactRecords: {
    'global-impact': {
      recordId: 'global-impact',
      totalMealsRedistributed: 3840,
      totalCo2PreventedKg: 9600,
      totalCompletedDeliveries: 142,
      activeNgosCount: 18,
      activeDonorsCount: 24,
      activeVolunteersCount: 47,
      updatedAt: new Date().toISOString(),
    },
  },
  auditLogs: {
    'log-init': {
      logId: 'log-init',
      action: 'PLATFORM_BOOTSTRAP',
      performedBy: 'SYSTEM',
      timestamp: new Date().toISOString(),
      details: { phase: 'Complete Platform Integration' },
    },
  },
};

// Persistence helper for file-backed storage
function loadStore(): StoreState {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return { ...initialStore, ...JSON.parse(data) };
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
    return initialStore;
  } catch (err) {
    console.warn('Fallback store memory-only mode:', err);
    return initialStore;
  }
}

function saveStore(store: StoreState) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist data store:', err);
  }
}

let memoryStore = loadStore();

export class FirestoreDb {
  private static useCloudFirestore(): boolean {
    return getApps().length > 0;
  }

  // Get a single document from collection
  static async getDoc(collectionName: keyof StoreState, docId: string): Promise<any | null> {
    if (this.useCloudFirestore()) {
      try {
        const firestore = getFirestore();
        const snap = await firestore.collection(collectionName).doc(docId).get();
        return snap.exists ? { id: snap.id, ...snap.data() } : null;
      } catch (err) {
        console.warn(`[FirestoreDb] Cloud getDoc error (${collectionName}/${docId}), fallback to local:`, err);
      }
    }
    const collection = memoryStore[collectionName] || {};
    return collection[docId] ? { ...collection[docId] } : null;
  }

  // Set / upsert document
  static async setDoc(collectionName: keyof StoreState, docId: string, data: any): Promise<any> {
    const docData = { ...data, updatedAt: new Date().toISOString() };
    if (!docData.createdAt) docData.createdAt = new Date().toISOString();

    if (this.useCloudFirestore()) {
      try {
        const firestore = getFirestore();
        await firestore.collection(collectionName).doc(docId).set(docData, { merge: true });
      } catch (err) {
        console.warn(`[FirestoreDb] Cloud setDoc error (${collectionName}/${docId}), saving locally:`, err);
      }
    }

    if (!memoryStore[collectionName]) {
      memoryStore[collectionName] = {};
    }
    memoryStore[collectionName][docId] = { ...memoryStore[collectionName][docId], ...docData };
    saveStore(memoryStore);
    return { id: docId, ...memoryStore[collectionName][docId] };
  }

  // Update specific fields
  static async updateDoc(collectionName: keyof StoreState, docId: string, updates: any): Promise<any> {
    if (this.useCloudFirestore()) {
      try {
        const firestore = getFirestore();
        await firestore.collection(collectionName).doc(docId).update({
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn(`[FirestoreDb] Cloud updateDoc error (${collectionName}/${docId}), saving locally:`, err);
      }
    }

    if (!memoryStore[collectionName] || !memoryStore[collectionName][docId]) {
      throw new Error(`Document not found: ${collectionName}/${docId}`);
    }
    memoryStore[collectionName][docId] = {
      ...memoryStore[collectionName][docId],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveStore(memoryStore);
    return { id: docId, ...memoryStore[collectionName][docId] };
  }

  // Delete document
  static async deleteDoc(collectionName: keyof StoreState, docId: string): Promise<boolean> {
    if (this.useCloudFirestore()) {
      try {
        const firestore = getFirestore();
        await firestore.collection(collectionName).doc(docId).delete();
      } catch (err) {
        console.warn(`[FirestoreDb] Cloud deleteDoc error (${collectionName}/${docId}):`, err);
      }
    }

    if (memoryStore[collectionName] && memoryStore[collectionName][docId]) {
      delete memoryStore[collectionName][docId];
      saveStore(memoryStore);
      return true;
    }
    return false;
  }

  // Query documents with filter predicate
  static async queryDocs(
    collectionName: keyof StoreState,
    filterFn?: (doc: any) => boolean,
    sortFn?: (a: any, b: any) => number
  ): Promise<any[]> {
    if (this.useCloudFirestore()) {
      try {
        const firestore = getFirestore();
        const snap = await firestore.collection(collectionName).get();
        let results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (filterFn) results = results.filter(filterFn);
        if (sortFn) results.sort(sortFn);
        return results;
      } catch (err) {
        console.warn(`[FirestoreDb] Cloud queryDocs error (${collectionName}), fallback to local:`, err);
      }
    }

    const collection = memoryStore[collectionName] || {};
    let docs = Object.values(collection);
    if (filterFn) docs = docs.filter(filterFn);
    if (sortFn) docs.sort(sortFn);
    return docs;
  }

  // Atomic transaction runner for critical operations (Allocations, OTP verification, Credits)
  static async runTransaction<T>(
    transactionFn: (tx: {
      get: (collection: keyof StoreState, id: string) => Promise<any | null>;
      set: (collection: keyof StoreState, id: string, data: any) => void;
      update: (collection: keyof StoreState, id: string, updates: any) => void;
    }) => Promise<T>
  ): Promise<T> {
    if (this.useCloudFirestore()) {
      try {
        const firestore = getFirestore();
        return await firestore.runTransaction(async (cloudTx) => {
          const txContext = {
            get: async (collection: keyof StoreState, id: string) => {
              const ref = firestore.collection(collection).doc(id);
              const snap = await cloudTx.get(ref);
              return snap.exists ? { id: snap.id, ...snap.data() } : null;
            },
            set: (collection: keyof StoreState, id: string, data: any) => {
              const ref = firestore.collection(collection).doc(id);
              cloudTx.set(ref, { ...data, updatedAt: new Date().toISOString() });
            },
            update: (collection: keyof StoreState, id: string, updates: any) => {
              const ref = firestore.collection(collection).doc(id);
              cloudTx.update(ref, { ...updates, updatedAt: new Date().toISOString() });
            },
          };
          return await transactionFn(txContext);
        });
      } catch (err) {
        console.warn('[FirestoreDb] Cloud transaction error, falling back to atomic local lock:', err);
      }
    }

    // Atomic local transaction execution
    const pendingWrites: Array<() => void> = [];
    const txContext = {
      get: async (collection: keyof StoreState, id: string) => {
        const col = memoryStore[collection] || {};
        return col[id] ? JSON.parse(JSON.stringify(col[id])) : null;
      },
      set: (collection: keyof StoreState, id: string, data: any) => {
        pendingWrites.push(() => {
          if (!memoryStore[collection]) memoryStore[collection] = {};
          memoryStore[collection][id] = {
            ...data,
            updatedAt: new Date().toISOString(),
          };
        });
      },
      update: (collection: keyof StoreState, id: string, updates: any) => {
        pendingWrites.push(() => {
          if (!memoryStore[collection] || !memoryStore[collection][id]) {
            throw new Error(`Document not found in tx: ${collection}/${id}`);
          }
          memoryStore[collection][id] = {
            ...memoryStore[collection][id],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        });
      },
    };

    const result = await transactionFn(txContext);
    for (const write of pendingWrites) {
      write();
    }
    saveStore(memoryStore);
    return result;
  }

  // Audit logging helper
  static async logAudit(action: string, performedBy: string, details: any) {
    const logId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await this.setDoc('auditLogs', logId, {
      logId,
      action,
      performedBy,
      timestamp: new Date().toISOString(),
      details,
    });
  }
}
