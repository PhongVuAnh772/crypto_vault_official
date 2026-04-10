/**
 * Định dạng số theo kiểu Việt Nam: 1.234.567,89
 */
export const formatVN = (num: string | number | null | undefined, decimals: number = 1) => {
    if (num === null || num === undefined || num === '') return '---';
    const val = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(val)) return '0,0';
    
    const parts = val.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
};

/**
 * Định dạng số lượng (BTC/ETH) dùng phẩy thay chấm
 */
export const formatAmount = (num: string | number) => {
    return num.toString().replace('.', ',');
};
