import { Request, Response } from 'express';
import { FirestoreDb } from '../services/db.service.ts';

export class AdminController {
  /**
   * Get platform overview statistics
   */
  static async getPlatformStats(req: Request, res: Response) {
    const users = await FirestoreDb.queryDocs('users');
    const listings = await FirestoreDb.queryDocs('foodListings');
    const allocations = await FirestoreDb.queryDocs('foodAllocations');
    const deliveries = await FirestoreDb.queryDocs('deliveries');
    const reports = await FirestoreDb.queryDocs('reports');
    const impact = (await FirestoreDb.getDoc('impactRecords', 'global-impact')) || {};

    const stats = {
      users: {
        total: users.length,
        donors: users.filter((u) => u.role === 'FOOD_DONOR').length,
        ngos: users.filter((u) => u.role === 'NGO').length,
        volunteers: users.filter((u) => u.role === 'VOLUNTEER').length,
        communityUsers: users.filter((u) => u.role === 'COMMUNITY_USER').length,
        pendingNgos: users.filter((u) => u.role === 'NGO' && !u.isApproved).length,
      },
      listings: {
        total: listings.length,
        available: listings.filter((l) => l.status === 'AVAILABLE').length,
        allocated: listings.filter((l) => l.status === 'FULLY_ALLOCATED' || l.status === 'PARTIALLY_ALLOCATED').length,
      },
      deliveries: {
        total: deliveries.length,
        completed: deliveries.filter((d) => d.status === 'COMPLETED').length,
        inTransit: deliveries.filter((d) => d.status === 'IN_TRANSIT').length,
      },
      reports: {
        pending: reports.filter((r) => r.status === 'PENDING_REVIEW').length,
        resolved: reports.filter((r) => r.status === 'RESOLVED').length,
      },
      impact,
    };

    return res.status(200).json(stats);
  }

  /**
   * List users with optional role filtering
   */
  static async getUsers(req: Request, res: Response) {
    const { role, status } = req.query;
    const users = await FirestoreDb.queryDocs('users', (u) => {
      if (role && u.role !== role) return false;
      if (status && u.status !== status) return false;
      return true;
    });

    return res.status(200).json({ users });
  }

  /**
   * Suspend or reactivate user account
   */
  static async setUserStatus(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });
    const { id: userId } = req.params;
    const { status, reason } = req.body;

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ error: { message: 'Invalid status', statusCode: 400 } });
    }

    const user = await FirestoreDb.getDoc('users', userId);
    if (!user) return res.status(404).json({ error: { message: 'User not found', statusCode: 404 } });
    if (user.role === 'ADMIN') {
      return res.status(403).json({ error: { message: 'Cannot suspend an administrator account', statusCode: 403 } });
    }

    await FirestoreDb.updateDoc('users', userId, { status });
    await FirestoreDb.logAudit('USER_STATUS_UPDATED', req.user.uid, { targetUserUid: userId, status, reason });

    return res.status(200).json({ message: `User account status updated to ${status}` });
  }

  /**
   * Get NGOs pending verification
   */
  static async getPendingNgos(req: Request, res: Response) {
    const pendingUsers = await FirestoreDb.queryDocs('users', (u) => u.role === 'NGO' && !u.isApproved);
    const orgs = await FirestoreDb.queryDocs('organizations', (o) => o.type === 'NGO');

    const combined = pendingUsers.map((user) => {
      const org = orgs.find((o) => o.ownerUid === user.uid);
      return {
        ...user,
        organization: org || null,
      };
    });

    return res.status(200).json({ pendingNgos: combined });
  }

  /**
   * Approve or reject an NGO
   */
  static async verifyNgo(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });
    const { id: ngoUid } = req.params;
    const { approved, rejectionReason } = req.body;

    const user = await FirestoreDb.getDoc('users', ngoUid);
    if (!user || user.role !== 'NGO') {
      return res.status(404).json({ error: { message: 'NGO user not found', statusCode: 404 } });
    }

    const orgs = await FirestoreDb.queryDocs('organizations', (o) => o.ownerUid === ngoUid);
    const org = orgs[0];

    const timestamp = new Date().toISOString();

    if (approved) {
      await FirestoreDb.updateDoc('users', ngoUid, { isApproved: true, status: 'ACTIVE' });
      if (org) {
        await FirestoreDb.updateDoc('organizations', org.orgId, {
          isVerified: true,
          verifiedAt: timestamp,
          verifiedByAdminUid: req.user.uid,
        });
      }
      await FirestoreDb.logAudit('NGO_APPROVED', req.user.uid, { ngoUid, orgId: org?.orgId });
      return res.status(200).json({ message: 'NGO verified and approved successfully!' });
    } else {
      await FirestoreDb.updateDoc('users', ngoUid, { isApproved: false, status: 'REJECTED' });
      if (org) {
        await FirestoreDb.updateDoc('organizations', org.orgId, { isVerified: false, rejectionReason });
      }
      await FirestoreDb.logAudit('NGO_REJECTED', req.user.uid, { ngoUid, rejectionReason });
      return res.status(200).json({ message: 'NGO application rejected' });
    }
  }

  /**
   * Get audit logs
   */
  static async getAuditLogs(req: Request, res: Response) {
    const logs = await FirestoreDb.queryDocs(
      'auditLogs',
      undefined,
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return res.status(200).json({ logs: logs.slice(0, 100) });
  }

  /**
   * Get reports
   */
  static async getReports(req: Request, res: Response) {
    const reports = await FirestoreDb.queryDocs('reports');
    return res.status(200).json({ reports });
  }

  /**
   * Resolve a report
   */
  static async resolveReport(req: Request, res: Response) {
    const { id: reportId } = req.params;
    const { resolutionNotes } = req.body;

    await FirestoreDb.updateDoc('reports', reportId, {
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
      resolutionNotes: resolutionNotes || 'Reviewed and addressed by platform admin',
    });

    return res.status(200).json({ message: 'Report marked as resolved' });
  }

  /**
   * Get and update credit rules
   */
  static async getCreditRules(req: Request, res: Response) {
    const rules = await FirestoreDb.getDoc('creditRules', 'rule-default');
    return res.status(200).json({ rules });
  }

  static async updateCreditRules(req: Request, res: Response) {
    const updated = await FirestoreDb.updateDoc('creditRules', 'rule-default', req.body);
    return res.status(200).json({ message: 'Credit rules updated', rules: updated });
  }
}
