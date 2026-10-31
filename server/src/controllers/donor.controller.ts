import { Request, Response } from 'express';
import { FoodListingSchema } from '../validators/schemas.ts';
import { FirestoreDb } from '../services/db.service.ts';
import { MatchingService } from '../services/matching.service.ts';
import { geohashForLocation } from 'geofire-common';

export class DonorController {
  /**
   * Create food donation listing
   */
  static async createListing(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });

    const parseResult = FoodListingSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          statusCode: 400,
          details: parseResult.error.flatten().fieldErrors,
        },
      });
    }

    const data = parseResult.data;

    // Check preparation time vs pickup deadline
    const prepTime = new Date(data.preparationTime).getTime();
    const deadline = new Date(data.pickupDeadline).getTime();
    if (deadline <= prepTime) {
      return res.status(400).json({
        error: { message: 'Pickup deadline must be after food preparation time', statusCode: 400 },
      });
    }

    // Find donor organization
    const orgs = await FirestoreDb.queryDocs('organizations', (o) => o.ownerUid === req.user?.uid);
    const donorOrg = orgs[0];

    const listingId = `listing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const geohash = geohashForLocation([data.pickupLocation.latitude, data.pickupLocation.longitude]);

    const newListing = {
      listingId,
      donorUid: req.user.uid,
      donorOrgId: donorOrg ? donorOrg.orgId : null,
      foodName: data.foodName,
      category: data.category,
      totalServings: data.totalServings,
      remainingServings: data.totalServings,
      unit: data.unit,
      preparationTime: data.preparationTime,
      pickupDeadline: data.pickupDeadline,
      storageCondition: data.storageCondition,
      allergens: data.allergens,
      safetyDeclarationSigned: true,
      pickupAddress: data.pickupAddress,
      pickupLocation: data.pickupLocation,
      geohash,
      imageUrls: data.imageUrls || [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      ],
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await FirestoreDb.setDoc('foodListings', listingId, newListing);
    await FirestoreDb.logAudit('LISTING_CREATED', req.user.uid, { listingId, foodName: data.foodName });

    return res.status(201).json({
      message: 'Food listing published successfully',
      listing: newListing,
    });
  }

  /**
   * Get donor's listings
   */
  static async getMyListings(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });

    const listings = await FirestoreDb.queryDocs(
      'foodListings',
      (l) => l.donorUid === req.user?.uid,
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.status(200).json({ listings });
  }

  /**
   * Update unallocated listing
   */
  static async updateListing(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });
    const { id } = req.params;

    const listing = await FirestoreDb.getDoc('foodListings', id);
    if (!listing) return res.status(404).json({ error: { message: 'Listing not found', statusCode: 404 } });

    if (listing.donorUid !== req.user.uid && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: { message: 'You do not own this listing', statusCode: 403 } });
    }

    if (listing.status !== 'AVAILABLE') {
      return res.status(400).json({
        error: { message: 'Cannot edit a listing that has already been partially or fully allocated', statusCode: 400 },
      });
    }

    const updated = await FirestoreDb.updateDoc('foodListings', id, req.body);
    return res.status(200).json({ message: 'Listing updated successfully', listing: updated });
  }

  /**
   * Cancel or delete listing
   */
  static async deleteListing(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });
    const { id } = req.params;

    const listing = await FirestoreDb.getDoc('foodListings', id);
    if (!listing) return res.status(404).json({ error: { message: 'Listing not found', statusCode: 404 } });

    if (listing.donorUid !== req.user.uid && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: { message: 'Forbidden: not the owner', statusCode: 403 } });
    }

    if (listing.status === 'FULLY_ALLOCATED' || listing.status === 'COMPLETED') {
      return res.status(400).json({
        error: { message: 'Cannot cancel an allocated or completed donation', statusCode: 400 },
      });
    }

    await FirestoreDb.updateDoc('foodListings', id, { status: 'CANCELLED' });
    return res.status(200).json({ message: 'Listing cancelled successfully' });
  }

  /**
   * Preview matching NGOs for a listing
   */
  static async getMatchingNgos(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const matches = await MatchingService.getMatchingNgosForListing(id);
      return res.status(200).json({ matches });
    } catch (err: any) {
      return res.status(400).json({ error: { message: err.message, statusCode: 400 } });
    }
  }

  /**
   * Get allocations for a listing
   */
  static async getListingAllocations(req: Request, res: Response) {
    const { id } = req.params;
    const allocations = await FirestoreDb.queryDocs('foodAllocations', (a) => a.listingId === id);
    const tasks = await FirestoreDb.queryDocs('volunteerTasks', (t) => t.listingId === id);

    return res.status(200).json({ allocations, tasks });
  }
}
