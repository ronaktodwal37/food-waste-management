import { Request, Response } from 'express';
import { NgoRegistrationSchema, AllocationClaimSchema } from '../validators/schemas.ts';
import { FirestoreDb } from '../services/db.service.ts';
import { AllocationService } from '../services/allocation.service.ts';
import { MatchingService } from '../services/matching.service.ts';
import { geohashForLocation } from 'geofire-common';

export class NgoController {
  /**
   * Register or update NGO organization profile
   */
  static async registerOrg(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });

    const parseResult = NgoRegistrationSchema.safeParse(req.body);
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
    const existingOrgs = await FirestoreDb.queryDocs('organizations', (o) => o.ownerUid === req.user?.uid);
    const orgId = existingOrgs.length > 0 ? existingOrgs[0].orgId : `org-ngo-${Date.now()}`;
    const geohash = geohashForLocation([data.location.latitude, data.location.longitude]);

    const orgDoc = {
      orgId,
      ownerUid: req.user.uid,
      type: 'NGO',
      name: data.name,
      registrationNumber: data.registrationNumber,
      address: data.address,
      location: data.location,
      geohash,
      serviceRadiusKm: data.serviceRadiusKm,
      receivingCapacityServings: data.receivingCapacityServings,
      currentDailyAllocatedServings: existingOrgs[0]?.currentDailyAllocatedServings || 0,
      dietaryPreferences: data.dietaryPreferences,
      verificationDocUrls: data.verificationDocUrls,
      isVerified: existingOrgs[0]?.isVerified ?? false,
      updatedAt: new Date().toISOString(),
    };

    await FirestoreDb.setDoc('organizations', orgId, orgDoc);
    await FirestoreDb.logAudit('NGO_ORG_REGISTERED', req.user.uid, { orgId, name: data.name });

    return res.status(200).json({
      message: 'NGO organization profile submitted successfully. Pending administrator verification.',
      organization: orgDoc,
      isApproved: req.user.isApproved,
    });
  }

  /**
   * Get NGO Profile & Status
   */
  static async getProfile(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });

    const orgs = await FirestoreDb.queryDocs('organizations', (o) => o.ownerUid === req.user?.uid);
    const org = orgs[0] || null;

    return res.status(200).json({
      user: req.user,
      organization: org,
      isApproved: req.user.isApproved,
    });
  }

  /**
   * Discover nearby food donations with matching scores
   */
  static async discoverFood(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });

    const orgs = await FirestoreDb.queryDocs('organizations', (o) => o.ownerUid === req.user?.uid);
    const ngoOrg = orgs[0];
    const user = await FirestoreDb.getDoc('users', req.user.uid);

    // Fetch active listings
    const listings = await FirestoreDb.queryDocs(
      'foodListings',
      (l) => l.status === 'AVAILABLE' || l.status === 'PARTIALLY_ALLOCATED'
    );

    // Score listings against this NGO
    const scored = listings.map((listing) => {
      let matchInfo = null;
      let distanceKm = 0;

      if (ngoOrg && ngoOrg.location) {
        distanceKm = MatchingService.getDistanceKm(
          listing.pickupLocation.latitude,
          listing.pickupLocation.longitude,
          ngoOrg.location.latitude,
          ngoOrg.location.longitude
        );
        matchInfo = MatchingService.evaluateNgo(listing, ngoOrg, user);
      }

      return {
        ...listing,
        distanceKm,
        matchScore: matchInfo ? matchInfo.score : 50,
        matchBreakdown: matchInfo ? matchInfo.breakdown : null,
        reasons: matchInfo ? matchInfo.reasons : [],
      };
    });

    // Sort by match score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      listings: scored,
      ngoStatus: {
        isApproved: req.user.isApproved,
        hasOrgProfile: Boolean(ngoOrg),
      },
    });
  }

  /**
   * Claim full or partial food allocation
   * Only approved NGOs can claim; executes inside atomic transaction
   */
  static async claimAllocation(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });

    if (!req.user.isApproved) {
      return res.status(403).json({
        error: {
          message: 'Your NGO account is awaiting verification approval by an administrator before you can claim donations.',
          statusCode: 403,
        },
      });
    }

    const parseResult = AllocationClaimSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: { message: 'Validation failed', details: parseResult.error.flatten().fieldErrors, statusCode: 400 },
      });
    }

    try {
      const result = await AllocationService.allocateFood({
        listingId: parseResult.data.listingId,
        ngoUid: req.user.uid,
        requestedServings: parseResult.data.requestedServings,
      });

      await FirestoreDb.logAudit('ALLOCATION_CLAIMED', req.user.uid, {
        listingId: parseResult.data.listingId,
        servings: parseResult.data.requestedServings,
      });

      return res.status(200).json({
        message: 'Food allocation claimed successfully. Delivery task generated for volunteers.',
        allocation: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        error: { message: err.message, statusCode: 400 },
      });
    }
  }

  /**
   * Get NGO claimed allocations & deliveries
   */
  static async getMyAllocations(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });

    const allocations = await FirestoreDb.queryDocs('foodAllocations', (a) => a.ngoUid === req.user?.uid);
    const deliveries = await FirestoreDb.queryDocs('deliveries', (d) => d.ngoUid === req.user?.uid);

    return res.status(200).json({ allocations, deliveries });
  }

  /**
   * Confirm received food intake or report discrepancy
   */
  static async confirmIntake(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });
    const { deliveryId, discrepancyReported, discrepancyNotes } = req.body;

    const delivery = await FirestoreDb.getDoc('deliveries', deliveryId);
    if (!delivery || delivery.ngoUid !== req.user.uid) {
      return res.status(404).json({ error: { message: 'Delivery not found or unauthorized', statusCode: 404 } });
    }

    await FirestoreDb.updateDoc('deliveries', deliveryId, {
      ngoConfirmedIntake: true,
      discrepancyReported: Boolean(discrepancyReported),
      discrepancyNotes: discrepancyNotes || null,
      intakeConfirmedAt: new Date().toISOString(),
    });

    if (discrepancyReported) {
      await FirestoreDb.logAudit('DELIVERY_DISCREPANCY_REPORTED', req.user.uid, { deliveryId, discrepancyNotes });
    }

    return res.status(200).json({ message: 'Intake confirmation logged' });
  }
}
