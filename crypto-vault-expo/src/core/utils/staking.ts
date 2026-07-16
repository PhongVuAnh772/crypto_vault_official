import moment from 'moment';
import commonUtils from 'src/core/utils/commonUtils';
import { StakingHistoryItem } from '../redux/slice/staking/staking.type';
import {
    CalculateOverviewStakingResultType,
    CalculateOverviewStakingType,
    CalculateTotalAmountType,
} from '../type/staking';

function calculateTotalAmount(params: CalculateTotalAmountType) {
    const { principal, interestRate, days } = params;
    const totalAmount =
        principal * ((1 + interestRate / 100) ** (days / 365) - 1);
    return totalAmount;
}

function calculateOverviewStaking(
    params: CalculateOverviewStakingType,
): CalculateOverviewStakingResultType {
    const { interestRate, principal, days } = params;

    const reward = calculateTotalAmount({
        principal: principal,
        interestRate: interestRate,
        days: days,
    });
    return { reward, apr: interestRate };
}

const groupByDate = (data: StakingHistoryItem[]) => {
    const grouped: Record<
        string,
        { title: string; data: StakingHistoryItem[] }
    > = data.reduce(
        (acc, item) => {
            const date = moment(item.lockedDate)
                .format('MMM D, YYYY')
                .toUpperCase();
            if (!acc[date]) {
                acc[date] = { title: date, data: [] };
            }
            acc[date].data.push(item);
            return acc;
        },
        {} as Record<string, { title: string; data: StakingHistoryItem[] }>,
    );

    return Object.values(grouped);
};
const calculateLockDuration = (
    date1: string | Date,
    date2: string | Date,
): string => {
    try {
        const start = moment(date1, 'ddd MMM DD YYYY HH:mm:ss GMTZZ');
        const end = moment(date2, 'YYYY/MM/DD');
        const current = moment();

        if (!start.isValid() || !end.isValid() || !current.isValid()) {
            throw new Error("Invalid date format. Use 'DD/MM/YYYY'.");
        }

        if (current.isBefore(start) || current.isAfter(end)) {
            // If the current date is out of the valid range, return the full duration.
            const totalDays = end.diff(start, 'days') + 1; // Include the start date
            return `${totalDays}/${totalDays}`;
        }

        const totalDays = end.diff(start, 'days') + 1; // Include the start date
        const elapsedDays = current.diff(start, 'days') + 1; // Include the start date

        return `${elapsedDays}/${totalDays}`;
    } catch (error) {
        console.log('🚀 ~ error:', error);
        return '';
    }
};

const calculateRewardAmount = (
    lockPeriod: string,
    apr: string,
    lockAmount: string,
) => {
    try {
        const [amount, symbol] = lockAmount.split(' ');
        const amountParse = parseFloat(amount);
        const lockPeriodParsed = parseFloat(lockPeriod);
        const aprParsed = parseFloat(apr);

        const result = calculateOverviewStaking({
            days: lockPeriodParsed,
            interestRate: aprParsed,
            principal: amountParse,
        });
        const formatReward = commonUtils.formattedBalanceCurrency(
            result.reward,
        );
        return `${formatReward} ${symbol}`;
    } catch (e) {
        console.log('🚀 ~ e:', e);
        return '';
    }
};
const StakingUtils = {
    calculateOverviewStaking,
    groupByDate,
    calculateLockDuration,
    calculateRewardAmount,
};

export default StakingUtils;
