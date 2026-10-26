function calculateReward(spendingCents) {
    if (spendingCents >= 100000) {
        return 3500; // $35
    }

    if (spendingCents >= 50000) {
        return 2500; // $25
    }

    if (spendingCents >= 25000) {
        return 1000; // $10
    }

    return 0;
}

const customerSpending = [
    15000,
    20000,
    24999,
    25000,
    35000,
    49999,
    50000,
    75000,
    99999,
    100000,
    150000
];

for (const spendingCents of customerSpending) {
    const rewardCents = calculateReward(spendingCents);

    console.log(
        `Spend: $${spendingCents / 100} → Reward: $${rewardCents / 100}`
    );
}