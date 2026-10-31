/**
 * Volunteer Credit & Gamification Recognition System
 * - Distance-tiered points + urgency bonuses
 * - Idempotent atomic credit ledger
 * - Badges & achievements milestones
 * - Real-time leaderboard calculations
 */
import { FirestoreDb } from './db.service.ts';

export class CreditService {
  /**
   * Calculate credits earned for a delivery
   */
  static async calculateCreditAmount(distanceKm: number, isUrgent: boolean): Promise<{ amount: number; reason: string }> {
    const rules = await FirestoreDb.getDoc('creditRules', 'rule-default');
    const shortRate = rules?.baseShortDistanceCredits ?? 30;
    const mediumRate = rules?.baseMediumDistanceCredits ?? 50;
    const longRate = rules?.baseLongDistanceCredits ?? 80;
    const urgentBonus = rules?.urgentBonusCredits ?? 20;

    let base = shortRate;
    let category = 'Short distance';

    if (distanceKm > 5) {
      base = longRate;
      category = 'Long distance';
    } else if (distanceKm > 2) {
      base = mediumRate;
      category = 'Medium distance';
    }

    const bonus = isUrgent ? urgentBonus : 0;
    const total = base + bonus;
    const reason = `${category} delivery (${distanceKm} km)${isUrgent ? ' + Urgent Task Bonus' : ''}`;

    return { amount: total, reason };
  }

  /**
   * Idempotently award credits to volunteer upon successful verified delivery
   */
  static async awardDeliveryCredits(deliveryId: string, volunteerUid: string) {
    const idempotencyKey = `delivery_${deliveryId}`;

    return await FirestoreDb.runTransaction(async (tx) => {
      // 1. Idempotency Check: Verify if credit was already awarded
      const existingCredits = await FirestoreDb.queryDocs('volunteerCredits', (c) => c.idempotencyKey === idempotencyKey);
      if (existingCredits.length > 0) {
        console.log(`[CreditService] Credits already awarded for ${deliveryId}, skipping.`);
        const profile = await tx.get('volunteerProfiles', volunteerUid);
        return {
          amount: existingCredits[0].amount,
          totalCredits: profile?.totalCredits || 0,
          newBadges: [],
          alreadyAwarded: true,
        };
      }

      // 2. Fetch delivery and task details
      const delivery = await tx.get('deliveries', deliveryId);
      if (!delivery || delivery.status !== 'COMPLETED') {
        throw new Error('Credits can only be awarded for verified completed deliveries');
      }

      const task = await tx.get('volunteerTasks', delivery.taskId);
      const distanceKm = task?.estimatedDistanceKm || 2.0;
      const isUrgent = Boolean(task?.isUrgent);
      const mealsDelivered = task?.servings || 20;

      const { amount, reason } = await this.calculateCreditAmount(distanceKm, isUrgent);

      // 3. Insert into volunteerCredits ledger
      const creditId = `cred-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      tx.set('volunteerCredits', creditId, {
        creditId,
        volunteerUid,
        deliveryId,
        amount,
        reason,
        idempotencyKey,
        createdAt: new Date().toISOString(),
      });

      // 4. Update volunteerProfile stats
      let profile = await tx.get('volunteerProfiles', volunteerUid);
      if (!profile) {
        profile = {
          volunteerUid,
          totalCredits: 0,
          totalDeliveries: 0,
          totalHoursVolunteered: 0,
          totalMealsRedistributed: 0,
          serviceAreaRadiusKm: 15,
        };
      }

      const newTotalCredits = (profile.totalCredits || 0) + amount;
      const newDeliveries = (profile.totalDeliveries || 0) + 1;
      const newMeals = (profile.totalMealsRedistributed || 0) + mealsDelivered;
      const newHours = Math.round(((profile.totalHoursVolunteered || 0) + (distanceKm * 0.25 + 0.5)) * 10) / 10;

      tx.update('volunteerProfiles', volunteerUid, {
        totalCredits: newTotalCredits,
        totalDeliveries: newDeliveries,
        totalMealsRedistributed: newMeals,
        totalHoursVolunteered: newHours,
      });

      // 5. Update global impact stats
      const impact = await tx.get('impactRecords', 'global-impact');
      if (impact) {
        tx.update('impactRecords', 'global-impact', {
          totalMealsRedistributed: (impact.totalMealsRedistributed || 0) + mealsDelivered,
          totalCo2PreventedKg: (impact.totalCo2PreventedKg || 0) + Math.round(mealsDelivered * 2.5),
          totalCompletedDeliveries: (impact.totalCompletedDeliveries || 0) + 1,
        });
      }

      // 6. Check Badge Milestones
      const newBadges: string[] = [];
      const userBadges = await FirestoreDb.queryDocs('volunteerBadges', (b) => b.volunteerUid === volunteerUid);
      const ownedBadgeIds = new Set(userBadges.map((b) => b.badgeId));

      if (newDeliveries >= 1 && !ownedBadgeIds.has('badge-first-rescue')) {
        tx.set('volunteerBadges', `vb-${Date.now()}-1`, {
          volunteerUid,
          badgeId: 'badge-first-rescue',
          awardedAt: new Date().toISOString(),
        });
        newBadges.push('First Rescue');
      }

      if (newMeals >= 50 && !ownedBadgeIds.has('badge-bronze')) {
        tx.set('volunteerBadges', `vb-${Date.now()}-2`, {
          volunteerUid,
          badgeId: 'badge-bronze',
          awardedAt: new Date().toISOString(),
        });
        newBadges.push('Bronze Courier');
      }

      if (newMeals >= 150 && !ownedBadgeIds.has('badge-silver')) {
        tx.set('volunteerBadges', `vb-${Date.now()}-3`, {
          volunteerUid,
          badgeId: 'badge-silver',
          awardedAt: new Date().toISOString(),
        });
        newBadges.push('Silver Hero');
      }

      return {
        amount,
        totalCredits: newTotalCredits,
        newBadges,
        alreadyAwarded: false,
      };
    });
  }

  /**
   * Get Monthly Volunteer Leaderboard
   */
  static async getLeaderboard() {
    const profiles = await FirestoreDb.queryDocs('volunteerProfiles');
    const leaderboard = await Promise.all(
      profiles.map(async (p) => {
        const user = await FirestoreDb.getDoc('users', p.volunteerUid);
        return {
          volunteerUid: p.volunteerUid,
          name: user?.displayName || 'Anonymous Volunteer',
          totalCredits: p.totalCredits || 0,
          totalDeliveries: p.totalDeliveries || 0,
          totalMealsRedistributed: p.totalMealsRedistributed || 0,
          vehicleType: p.vehicleType || 'BICYCLE',
        };
      })
    );

    return leaderboard.sort((a, b) => b.totalCredits - a.totalCredits);
  }
}
