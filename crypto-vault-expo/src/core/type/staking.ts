type CalculateInterestType = {
    days: number;
    minDays: number;
    maxDays: number;
    minInterest: number;
    maxInterest: number;
};
type CalculateTotalAmountType = {
    principal: number;
    interestRate: number;
    days: number;
};
type CalculateOverviewStakingType = CalculateTotalAmountType;
type CalculateOverviewStakingResultType = {
    reward: number;
    apr: number;
};
export type {
    CalculateInterestType,
    CalculateOverviewStakingResultType,
    CalculateOverviewStakingType,
    CalculateTotalAmountType,
};
