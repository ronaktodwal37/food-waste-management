import { Request, Response } from 'express';
import { RegisterUserSchema, LoginUserSchema } from '../validators/schemas.ts';
import { FirestoreDb } from '../services/db.service.ts';
import crypto from 'crypto';

export class AuthController {
  /**
   * Register a new user
   * Strictly enforces server-side role assignment; prohibits self-promotion to ADMIN
   * Sets NGO approval status to false by default pending admin review
   */
  static async register(req: Request, res: Response) {
    const parseResult = RegisterUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          statusCode: 400,
          details: parseResult.error.flatten().fieldErrors,
        },
      });
    }

    const { email, password, displayName, role, phoneNumber } = parseResult.data;

    // Check if user with email already exists
    const existingUsers = await FirestoreDb.queryDocs('users', (u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: { message: 'A user with this email address is already registered', statusCode: 409 },
      });
    }

    const uid = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Create user profile
    const userDoc = {
      uid,
      email: email.toLowerCase(),
      displayName,
      role,
      passwordHash: hashedPassword,
      isApproved: role === 'NGO' ? false : true, // NGOs must be vetted by Admin
      status: 'ACTIVE',
      phoneNumber: phoneNumber || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await FirestoreDb.setDoc('users', uid, userDoc);

    // If volunteer, create empty volunteer profile
    if (role === 'VOLUNTEER') {
      await FirestoreDb.setDoc('volunteerProfiles', uid, {
        volunteerUid: uid,
        totalCredits: 0,
        totalDeliveries: 0,
        totalHoursVolunteered: 0,
        totalMealsRedistributed: 0,
        serviceAreaRadiusKm: 15,
        availabilityStatus: 'AVAILABLE',
        createdAt: new Date().toISOString(),
      });
    }

    // Audit log
    await FirestoreDb.logAudit('USER_REGISTERED', uid, { email, role });

    // Generate JWT-like session token
    const token = `dev_token_${uid}_${role}_${Date.now()}`;

    return res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        uid,
        email: userDoc.email,
        displayName: userDoc.displayName,
        role: userDoc.role,
        isApproved: userDoc.isApproved,
        status: userDoc.status,
      },
    });
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response) {
    const parseResult = LoginUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid credentials payload', statusCode: 400 },
      });
    }

    const { email, password } = parseResult.data;
    const users = await FirestoreDb.queryDocs('users', (u) => u.email.toLowerCase() === email.toLowerCase());
    const user = users[0];

    if (!user) {
      return res.status(401).json({
        error: { message: 'Invalid email or password', statusCode: 401 },
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        error: { message: 'Account is suspended. Please contact administrator.', statusCode: 403 },
      });
    }

    // Verify password hash if present (seed users allow demo login)
    if (user.passwordHash) {
      const hashed = crypto.createHash('sha256').update(password).digest('hex');
      if (hashed !== user.passwordHash) {
        return res.status(401).json({
          error: { message: 'Invalid email or password', statusCode: 401 },
        });
      }
    }

    const token = `dev_token_${user.uid}_${user.role}_${Date.now()}`;

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isApproved: user.isApproved ?? true,
        status: user.status,
      },
    });
  }

  /**
   * Get current authenticated user profile
   */
  static async getMe(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });
    }

    const profile = await FirestoreDb.getDoc('users', req.user.uid);
    let extra: any = {};

    if (req.user.role === 'NGO' || req.user.role === 'FOOD_DONOR') {
      const orgs = await FirestoreDb.queryDocs('organizations', (o) => o.ownerUid === req.user?.uid);
      extra.organization = orgs[0] || null;
    } else if (req.user.role === 'VOLUNTEER') {
      extra.volunteerProfile = await FirestoreDb.getDoc('volunteerProfiles', req.user.uid);
    }

    return res.status(200).json({
      user: {
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName,
        role: profile.role,
        isApproved: profile.isApproved,
        status: profile.status,
        ...extra,
      },
    });
  }
}
