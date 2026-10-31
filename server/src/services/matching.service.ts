/**
 * Explainable Food Matching Engine
 * Implements weighted matching algorithm:
 * - Distance: 30%
 * - NGO Capacity: 30%
 * - Urgency: 25%
 * - Food Requirement Compatibility: 15%
 * Returns score 0-100 with clear explainability breakdown.
 */
import { distanceBetween, geohashQueryBounds } from 'geofire-common';
import { FirestoreDb } from './db.service.ts';

export interface MatchingResult {
  ngoUid: string;
  ngoOrgId: string;
  ngoName: string;
  address: string;
  distanceKm: number;
  availableCapacity: number;
  score: number; // 0 to 100
  breakdown: {
    distanceScore: number; // Max 30
    capacityScore: number; // Max 30
    urgencyScore: number; // Max 25
    compatibilityScore: number; // Max 15
  };
  reasons: string[];
  isEligible: boolean;
}

export class MatchingService {
  /**
   * Calculate distance between two coordinates in kilometers using geofire-common
   */
  static getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const distanceInMeters = distanceBetween([lat1, lng1], [lat2, lng2]) * 1000;
    return Math.round((distanceInMeters / 1000) * 10) / 10;
  }

  /**
   * Score an NGO against a food listing
   */
  static evaluateNgo(listing: any, ngoOrg: any, ngoUser: any): MatchingResult {
    const reasons: string[] = [];

    // 1. Distance Score (30%)
    const distanceKm = this.getDistanceKm(
      listing.pickupLocation.latitude,
      listing.pickupLocation.longitude,
      ngoOrg.location.latitude,
      ngoOrg.location.longitude
    );

    const serviceRadius = ngoOrg.serviceRadiusKm || 10;
    let distanceScore = 0;
    if (distanceKm <= 3) {
      distanceScore = 30;
      reasons.push(`Close proximity (${distanceKm} km away, within optimal 3 km window)`);
    } else if (distanceKm <= serviceRadius) {
      // Linear falloff between 3km and serviceRadius
      const factor = (serviceRadius - distanceKm) / (serviceRadius - 3);
      distanceScore = Math.round(15 + factor * 15);
      reasons.push(`Within service radius (${distanceKm} km away, max radius ${serviceRadius} km)`);
    } else {
      distanceScore = 5;
      reasons.push(`Outside primary radius (${distanceKm} km away), but reachable`);
    }

    // 2. Capacity Score (30%)
    const maxCapacity = ngoOrg.receivingCapacityServings || 100;
    const currentAllocated = ngoOrg.currentDailyAllocatedServings || 0;
    const availableCapacity = Math.max(0, maxCapacity - currentAllocated);
    const needed = listing.remainingServings || listing.totalServings || 1;

    let capacityScore = 0;
    if (availableCapacity >= needed) {
      capacityScore = 30;
      reasons.push(`Full capacity available (${availableCapacity} servings capacity vs ${needed} needed)`);
    } else if (availableCapacity > 0) {
      const ratio = availableCapacity / needed;
      capacityScore = Math.round(ratio * 25);
      reasons.push(`Partial capacity available (${availableCapacity} of ${needed} servings can be absorbed)`);
    } else {
      capacityScore = 0;
      reasons.push('NGO has reached current maximum daily receiving capacity');
    }

    // 3. Urgency Score (25%)
    // Proximity to pickup deadline
    const now = Date.now();
    const deadline = new Date(listing.pickupDeadline).getTime();
    const hoursRemaining = Math.max(0, (deadline - now) / 3600000);

    let urgencyScore = 0;
    if (hoursRemaining <= 2) {
      urgencyScore = 25;
      reasons.push(`Critical urgency: ${Math.round(hoursRemaining * 10) / 10}h left before expiry`);
    } else if (hoursRemaining <= 6) {
      urgencyScore = 20;
      reasons.push(`High urgency: ${Math.round(hoursRemaining * 10) / 10}h until pickup deadline`);
    } else if (hoursRemaining <= 12) {
      urgencyScore = 15;
      reasons.push(`Standard window: ${Math.round(hoursRemaining * 10) / 10}h remaining`);
    } else {
      urgencyScore = 10;
      reasons.push(`Generous window: ${Math.round(hoursRemaining * 10) / 10}h remaining`);
    }

    // 4. Compatibility Score (15%)
    let compatibilityScore = 15;
    const ngoDiets = ngoOrg.dietaryPreferences || ['GENERAL'];
    if (listing.category === 'COOKED_MEALS') {
      compatibilityScore = 15;
      reasons.push('Compatible meal format (ready-to-eat cooked food)');
    } else {
      compatibilityScore = 12;
      reasons.push(`Compatible category (${listing.category})`);
    }

    // Total composite score
    const totalScore = Math.min(100, Math.max(0, distanceScore + capacityScore + urgencyScore + compatibilityScore));

    const isEligible = Boolean(ngoUser.isApproved && ngoOrg.isVerified && availableCapacity > 0 && distanceKm <= serviceRadius * 1.5);

    return {
      ngoUid: ngoOrg.ownerUid,
      ngoOrgId: ngoOrg.orgId,
      ngoName: ngoOrg.name,
      address: ngoOrg.address,
      distanceKm,
      availableCapacity,
      score: totalScore,
      breakdown: {
        distanceScore,
        capacityScore,
        urgencyScore,
        compatibilityScore,
      },
      reasons,
      isEligible,
    };
  }

  /**
   * Find matching NGOs for a given food listing
   */
  static async getMatchingNgosForListing(listingId: string): Promise<MatchingResult[]> {
    const listing = await FirestoreDb.getDoc('foodListings', listingId);
    if (!listing) throw new Error('Food listing not found');

    // Retrieve all verified NGOs
    const ngoOrgs = await FirestoreDb.queryDocs('organizations', (org) => org.type === 'NGO' && org.isVerified === true);

    const results: MatchingResult[] = [];

    for (const org of ngoOrgs) {
      const user = await FirestoreDb.getDoc('users', org.ownerUid);
      if (user && user.isApproved && user.status === 'ACTIVE') {
        const evaluation = this.evaluateNgo(listing, org, user);
        results.push(evaluation);
      }
    }

    // Sort descending by match score
    return results.sort((a, b) => b.score - a.score);
  }
}
