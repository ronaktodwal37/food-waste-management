/**
 * Transactional Multi-NGO Food Allocation System
 * Executes atomic transactions preventing over-allocation, race conditions,
 * and double-claims across multiple concurrent NGOs.
 */
import { FirestoreDb } from './db.service.ts';
import { MatchingService } from './matching.service.ts';

export interface AllocationRequest {
  listingId: string;
  ngoUid: string;
  requestedServings: number;
}

export class AllocationService {
  static async allocateFood(request: AllocationRequest) {
    const { listingId, ngoUid, requestedServings } = request;

    if (!requestedServings || requestedServings <= 0) {
      throw new Error('Requested servings must be a positive integer');
    }

    // Execute within atomic transaction
    return await FirestoreDb.runTransaction(async (tx) => {
      // 1. Read listing within transaction
      const listing = await tx.get('foodListings', listingId);
      if (!listing) {
        throw new Error('Food listing does not exist');
      }

      // Check listing status
      if (listing.status !== 'AVAILABLE' && listing.status !== 'PARTIALLY_ALLOCATED') {
        throw new Error(`Listing is not available for allocation. Current status: ${listing.status}`);
      }

      // Check remaining quantity
      const remaining = Number(listing.remainingServings);
      if (requestedServings > remaining) {
        throw new Error(
          `Requested quantity (${requestedServings}) exceeds remaining available servings (${remaining})`
        );
      }

      // 2. Read NGO user and organization within transaction
      const ngoUser = await tx.get('users', ngoUid);
      if (!ngoUser || ngoUser.role !== 'NGO') {
        throw new Error('Claimant is not a registered NGO user');
      }
      if (!ngoUser.isApproved) {
        throw new Error('NGO must be approved by an administrator before claiming food donations');
      }

      // Fetch NGO organization
      const ngoOrgs = await FirestoreDb.queryDocs('organizations', (o) => o.ownerUid === ngoUid);
      const ngoOrg = ngoOrgs[0];
      if (!ngoOrg) {
        throw new Error('NGO organization profile not found');
      }

      // 3. Compute remaining quantity and new listing status
      const newRemaining = remaining - requestedServings;
      const newStatus = newRemaining === 0 ? 'FULLY_ALLOCATED' : 'PARTIALLY_ALLOCATED';

      const allocationId = `alloc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // Calculate distance between donor and NGO
      const distanceKm = MatchingService.getDistanceKm(
        listing.pickupLocation.latitude,
        listing.pickupLocation.longitude,
        ngoOrg.location.latitude,
        ngoOrg.location.longitude
      );

      // Check if task is urgent (< 4 hours)
      const hoursToDeadline = (new Date(listing.pickupDeadline).getTime() - Date.now()) / 3600000;
      const isUrgent = hoursToDeadline <= 4;

      // 4. Create foodAllocations record
      tx.set('foodAllocations', allocationId, {
        allocationId,
        listingId,
        donorUid: listing.donorUid,
        ngoUid,
        ngoOrgId: ngoOrg.orgId,
        ngoName: ngoOrg.name,
        foodName: listing.foodName,
        allocatedServings: requestedServings,
        status: 'PENDING_VOLUNTEER',
        allocatedAt: new Date().toISOString(),
      });

      // 5. Create volunteerTasks record
      tx.set('volunteerTasks', taskId, {
        taskId,
        allocationId,
        listingId,
        foodName: listing.foodName,
        servings: requestedServings,
        category: listing.category,
        storageCondition: listing.storageCondition,
        donorUid: listing.donorUid,
        donorAddress: listing.pickupAddress,
        donorLocation: listing.pickupLocation,
        ngoUid,
        ngoName: ngoOrg.name,
        ngoAddress: ngoOrg.address,
        ngoLocation: ngoOrg.location,
        estimatedDistanceKm: distanceKm,
        isUrgent,
        pickupDeadline: listing.pickupDeadline,
        status: 'OPEN',
        volunteerUid: null,
        createdAt: new Date().toISOString(),
      });

      // 6. Update listing record atomically
      tx.update('foodListings', listingId, {
        remainingServings: newRemaining,
        status: newStatus,
      });

      // 7. Update NGO receiving count
      tx.update('organizations', ngoOrg.orgId, {
        currentDailyAllocatedServings: (ngoOrg.currentDailyAllocatedServings || 0) + requestedServings,
      });

      return {
        allocationId,
        taskId,
        allocatedServings: requestedServings,
        remainingServings: newRemaining,
        listingStatus: newStatus,
      };
    });
  }
}
