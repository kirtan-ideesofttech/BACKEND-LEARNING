// rewards.js

const REWARD_THRESHOLDS = [
  { minimumSpendCents: 100_000, rewardCents: 3_500 }, // $1,000 → $35
  { minimumSpendCents: 50_000, rewardCents: 2_500 },  // $500 → $25
  { minimumSpendCents: 25_000, rewardCents: 1_000 }   // $250 → $10
];

export function calculateMonthlyReward(eligibleSpendCents) {
  if (
    !Number.isSafeInteger(eligibleSpendCents) ||
    eligibleSpendCents < 0
  ) {
    throw new Error(
      "Monthly eligible spend must be a non-negative safe integer in cents."
    );
  }

  const reward = REWARD_THRESHOLDS.find(
    (tier) => eligibleSpendCents >= tier.minimumSpendCents
  );

  return reward ? reward.rewardCents : 0;
}

// Demonstrates a default export as well as the named export above.
export default calculateMonthlyReward;