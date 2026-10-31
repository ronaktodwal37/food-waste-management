import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['FOOD_DONOR', 'NGO', 'VOLUNTEER', 'COMMUNITY_USER']),
  phoneNumber: z.string().optional(),
});

export const LoginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const FoodListingSchema = z.object({
  foodName: z.string().min(3, 'Food name must be at least 3 characters').max(120),
  category: z.enum(['COOKED_MEALS', 'BAKERY', 'PRODUCE', 'DAIRY', 'PACKAGED']),
  totalServings: z.number().int().positive('Total servings must be a positive integer'),
  unit: z.string().default('meals'),
  preparationTime: z.string().datetime({ message: 'Valid preparation timestamp required' }),
  pickupDeadline: z.string().datetime({ message: 'Valid pickup deadline timestamp required' }),
  storageCondition: z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN', 'HOT_HEATED']),
  allergens: z.array(z.string()).default([]),
  safetyDeclarationSigned: z.literal(true, {
    message: 'Donor must review and accept the Food Safety Declaration',
  }),
  pickupLocation: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  pickupAddress: z.string().min(5, 'Pickup address is required'),
  imageUrls: z.array(z.string().url()).optional(),
});

export const NgoRegistrationSchema = z.object({
  name: z.string().min(3, 'Organization name is required'),
  registrationNumber: z.string().min(3, 'Tax / Non-profit registration number required'),
  address: z.string().min(5, 'Address is required'),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  serviceRadiusKm: z.number().positive().max(100).default(15),
  receivingCapacityServings: z.number().int().positive().default(100),
  dietaryPreferences: z.array(z.string()).default(['GENERAL']),
  verificationDocUrls: z.array(z.string()).min(1, 'At least one verification document is required'),
});

export const AllocationClaimSchema = z.object({
  listingId: z.string().min(1, 'Listing ID required'),
  requestedServings: z.number().int().positive('Servings must be positive'),
});

export const OtpVerificationSchema = z.object({
  deliveryId: z.string().min(1, 'Delivery ID required'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export const CommunityRequestSchema = z.object({
  title: z.string().min(5, 'Title required').max(140),
  category: z.enum(['COOKED_MEALS', 'BAKERY', 'PRODUCE', 'DAIRY', 'PACKAGED']),
  servingsNeeded: z.number().int().positive().max(50),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  address: z.string().min(5),
  notes: z.string().max(500).optional(),
});

export const ReportSubmissionSchema = z.object({
  targetId: z.string().min(1),
  targetType: z.enum(['LISTING', 'USER', 'DELIVERY']),
  reason: z.string().min(3).max(100),
  details: z.string().min(10).max(1000),
});
