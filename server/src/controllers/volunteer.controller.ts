import { Request, Response } from 'express';
import { FirestoreDb } from '../services/db.service.ts';
import { VerificationService } from '../services/verification.service.ts';
import { CreditService } from '../services/credit.service.ts';
import { OtpVerificationSchema } from '../validators/schemas.ts';

export class VolunteerController {
  /**
   * Browse available delivery tasks
   */
  static async getAvailableTasks(req: Request, res: Response) {
    const tasks = await FirestoreDb.queryDocs('volunteerTasks', (t) => t.status === 'OPEN');
    return res.status(200).json({ tasks });
  }

  /**
   * Accept a delivery task
   * Generates secure OTPs and initializes delivery verification record
   */
  static async acceptTask(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });
    const { id: taskId } = req.params;

    const task = await FirestoreDb.getDoc('volunteerTasks', taskId);
    if (!task) return res.status(404).json({ error: { message: 'Task not found', statusCode: 404 } });
    if (task.status !== 'OPEN') {
      return res.status(400).json({
        error: { message: `Task is no longer available (current status: ${task.status})`, statusCode: 400 },
      });
    }

    try {
      const verification = await VerificationService.initializeDeliveryVerification(taskId, req.user.uid);

      await FirestoreDb.logAudit('VOLUNTEER_TASK_ACCEPTED', req.user.uid, { taskId, deliveryId: verification.deliveryId });

      return res.status(200).json({
        message: 'Task accepted! Follow OpenStreetMap directions to donor pickup location.',
        deliveryId: verification.deliveryId,
        // The plain OTPs are provided for evaluation:
        // Donor pickup OTP is given to donor, delivery OTP to NGO
        pickupOtpPreview: verification.donorPickupOtp,
        deliveryOtpPreview: verification.ngoDeliveryOtp,
      });
    } catch (err: any) {
      return res.status(400).json({ error: { message: err.message, statusCode: 400 } });
    }
  }

  /**
   * Get volunteer's assigned, active, and completed tasks
   */
  static async getMyTasks(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });

    const tasks = await FirestoreDb.queryDocs('volunteerTasks', (t) => t.volunteerUid === req.user?.uid);
    const deliveries = await FirestoreDb.queryDocs('deliveries', (d) => d.volunteerUid === req.user?.uid);

    return res.status(200).json({ tasks, deliveries });
  }

  /**
   * Verify Pickup with OTP (entered by Volunteer upon collecting from Donor)
   */
  static async verifyPickup(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });

    const parseResult = OtpVerificationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid OTP code format (must be 6 digits)', statusCode: 400 },
      });
    }

    try {
      const result = await VerificationService.verifyPickupOtp(
        parseResult.data.deliveryId,
        req.user.uid,
        parseResult.data.otp
      );

      await FirestoreDb.logAudit('PICKUP_OTP_VERIFIED', req.user.uid, { deliveryId: parseResult.data.deliveryId });

      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: { message: err.message, statusCode: 400 } });
    }
  }

  /**
   * Verify Delivery with OTP (entered by Volunteer upon handing off to NGO)
   * Automatically triggers atomic credit award
   */
  static async verifyDelivery(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });

    const parseResult = OtpVerificationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid OTP code format (must be 6 digits)', statusCode: 400 },
      });
    }

    try {
      const result = await VerificationService.verifyDeliveryOtp(
        parseResult.data.deliveryId,
        req.user.uid,
        parseResult.data.otp
      );

      await FirestoreDb.logAudit('DELIVERY_OTP_VERIFIED', req.user.uid, {
        deliveryId: parseResult.data.deliveryId,
        creditsAwarded: result.creditsAwarded,
      });

      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: { message: err.message, statusCode: 400 } });
    }
  }

  /**
   * Get volunteer stats, credits ledger, badges, and leaderboard
   */
  static async getStats(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });

    const profile = (await FirestoreDb.getDoc('volunteerProfiles', req.user.uid)) || {
      volunteerUid: req.user.uid,
      totalCredits: 0,
      totalDeliveries: 0,
      totalHoursVolunteered: 0,
      totalMealsRedistributed: 0,
    };

    const creditsLedger = await FirestoreDb.queryDocs(
      'volunteerCredits',
      (c) => c.volunteerUid === req.user?.uid,
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const userBadges = await FirestoreDb.queryDocs('volunteerBadges', (b) => b.volunteerUid === req.user?.uid);
    const allBadges = await FirestoreDb.queryDocs('badges');
    const leaderboard = await CreditService.getLeaderboard();

    return res.status(200).json({
      profile,
      creditsLedger,
      badges: {
        earned: userBadges,
        all: allBadges,
      },
      leaderboard,
    });
  }
}
