function formatCurrency(value: number | string): string {
    try {
        if (typeof value === 'string') {
            value = Number(value);
        }

        if (isNaN(value)) {
            throw new Error('Invalid number');
        }

        if (value >= 1e9) {
            return Math.floor((value / 1e9) * 100) / 100 + 'B';
        } else if (value >= 1e6) {
            return Math.floor((value / 1e6) * 100) / 100 + 'M';
        } else if (value >= 1e3) {
            return Math.floor((value / 1e3) * 100) / 100 + 'K';
        }

        return Math.floor(value * 100) / 100 + '';
    } catch {
        return value.toString();
    }
}
const formatPointOriginal = (amount: number) =>
    new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
    }).format(amount);
export const rezPointUtils = {
    formatCurrency,
    formatPointOriginal,
};
