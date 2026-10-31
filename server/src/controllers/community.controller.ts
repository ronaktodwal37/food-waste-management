import { Request, Response } from 'express';
import { FirestoreDb } from '../services/db.service.ts';
import { CommunityRequestSchema, ReportSubmissionSchema } from '../validators/schemas.ts';
import { geohashForLocation } from 'geofire-common';

export class CommunityController {
  /**
   * Create peer-to-peer neighborhood food sharing listing
   */
  static async createCommunityListing(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });

    const { title, category, quantity, unit, address, location, description, pickupNotes } = req.body;
    if (!title || !quantity || !location) {
      return res.status(400).json({ error: { message: 'Missing required listing fields', statusCode: 400 } });
    }

    const listingId = `comm-listing-${Date.now()}`;
    const geohash = geohashForLocation([location.latitude, location.longitude]);

    const listing = {
      listingId,
      ownerUid: req.user.uid,
      ownerName: req.user.displayName || 'Community Member',
      title,
      category: category || 'PRODUCE',
      quantity: Number(quantity),
      remainingQuantity: Number(quantity),
      unit: unit || 'portions',
      address,
      location,
      geohash,
      description: description || '',
      pickupNotes: pickupNotes || '',
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
    };

    await FirestoreDb.setDoc('foodListings', listingId, listing);
    return res.status(201).json({ message: 'Community listing published', listing });
  }

  /**
   * Browse available community food listings
   */
  static async getCommunityListings(req: Request, res: Response) {
    const listings = await FirestoreDb.queryDocs(
      'foodListings',
      (l) => l.listingId.startsWith('comm-listing-') && l.status === 'AVAILABLE'
    );
    return res.status(200).json({ listings });
  }

  /**
   * Submit food assistance request
   */
  static async createRequest(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });

    const parseResult = CommunityRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: { message: 'Validation failed', details: parseResult.error.flatten().fieldErrors, statusCode: 400 },
      });
    }

    const data = parseResult.data;
    const requestId = `comm-req-${Date.now()}`;

    const requestDoc = {
      requestId,
      requesterUid: req.user.uid,
      requesterName: req.user.displayName || 'Community Member',
      title: data.title,
      category: data.category,
      servingsNeeded: data.servingsNeeded,
      urgency: data.urgency,
      location: data.location,
      address: data.address,
      notes: data.notes || '',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    await FirestoreDb.setDoc('communityRequests', requestId, requestDoc);
    await FirestoreDb.logAudit('COMMUNITY_REQUEST_CREATED', req.user.uid, { requestId, title: data.title });

    return res.status(201).json({ message: 'Community food request created', request: requestDoc });
  }

  /**
   * Get all active community requests
   */
  static async getRequests(req: Request, res: Response) {
    const requests = await FirestoreDb.queryDocs('communityRequests', (r) => r.status === 'OPEN');
    return res.status(200).json({ requests });
  }

  /**
   * Get my community requests
   */
  static async getMyRequests(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });
    const requests = await FirestoreDb.queryDocs('communityRequests', (r) => r.requesterUid === req.user?.uid);
    return res.status(200).json({ requests });
  }

  /**
   * Submit an unsafe food or misleading listing report
   */
  static async submitReport(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });

    const parseResult = ReportSubmissionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: { message: 'Validation failed', details: parseResult.error.flatten().fieldErrors, statusCode: 400 },
      });
    }

    const reportId = `rep-${Date.now()}`;
    const reportDoc = {
      reportId,
      reporterUid: req.user.uid,
      targetId: parseResult.data.targetId,
      targetType: parseResult.data.targetType,
      reason: parseResult.data.reason,
      details: parseResult.data.details,
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
    };

    await FirestoreDb.setDoc('reports', reportId, reportDoc);
    await FirestoreDb.logAudit('REPORT_SUBMITTED', req.user.uid, { reportId, targetId: parseResult.data.targetId });

    return res.status(201).json({
      message: 'Safety report submitted to platform administrators for investigation.',
      reportId,
    });
  }
}
