import Big from 'big.js';
import moment from 'moment';
import { Dimensions, Image, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Toast, { ToastType } from 'react-native-toast-message';
import { ErrorContext } from 'src/features/home/home.type';
import { QRGenerator } from '../enum/QRGenerator';

const showToast = ({
    msg,
    subMsg,
    type,
    visibilityTime,
    contentOffSet,
}: {
    msg: string;
    subMsg?: string;
    type: ToastType;
    visibilityTime?: number;
    renderLeadingIcon?: React.ReactNode;
    contentOffSet?: number;
}) => {
    try {
        Toast.show({
            type: type,
            text1: msg,
            text2: subMsg,
            visibilityTime: visibilityTime,
            bottomOffset: contentOffSet,
        });
    } catch (error) {
        console.log('Show Toast error', error);
    }
};

const isAndroid = Platform.OS === 'android';
const isIos = Platform.OS === 'ios';

const isObjectEmpty = (object: object) => {
    return object && Object.keys(object).length === 0;
};

const isArrayEmpty = (array: any[]) => {
    return array && array.length === 0;
};

const getRandomInt = (max: number) => {
    return Math.floor(Math.random() * max);
};

const checkingEmulator = () => {
    const isSimulator = DeviceInfo.isEmulator();
    return isSimulator;
};
const generateQuestions = (data: string[]) => {
    const questions = [];
    const selectedIndices = new Set<number>();

    while (selectedIndices.size < 4) {
        selectedIndices.add(getRandomInt(data.length));
    }

    const selectedItems = Array.from(selectedIndices).map(index => data[index]);

    for (const element of selectedItems) {
        const correctAnswer = element;
        const correctAnswerIndex = data.indexOf(correctAnswer);
        const options = new Set<string>([correctAnswer]);

        while (options.size < 3) {
            const randomOption = data[getRandomInt(data.length)];
            if (!options.has(randomOption)) {
                options.add(randomOption);
            }
        }

        const shuffledOptions = Array.from(options).sort(
            () => Math.random() - 0.5,
        );

        questions.push({
            index: correctAnswerIndex + 1,
            question: `#${correctAnswerIndex + 1}`,
            correctAnswer,
            options: shuffledOptions,
        });
    }

    return questions.sort((a, b) => {
        return a.index - b.index;
    });
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

const BOTTOM_SHEET_MAX_HEIGHT = screenHeight * 0.75;
const BOTTOM_SHEET_MIN_HEIGHT = 0;

const formatNumber = (number: number) => {
    return number.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 20,
    });
};

const compareAppVersions = ({
    deviceVersion,
    forceVersion,
}: {
    deviceVersion: string;
    forceVersion: string;
}): boolean => {
    try {
        const v1 = deviceVersion.split('.').map(Number);
        const v2 = forceVersion.split('.').map(Number);

        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;

            if (num1 < num2) {
                return true;
            } else if (num1 > num2) {
                return false;
            }
        }

        return false;
    } catch (error) {
        console.error('compareAppVersions Error:', error);
        return false;
    }
};
const emailValid = (val: string): boolean => {
    return /^[a-zA-Z0-9][a-zA-Z0-9-_\.]+@([a-zA-Z]|[a-zA-Z0-9]?[a-zA-Z0-9-]+[a-zA-Z0-9])\.[a-zA-Z0-9]{2,10}(?:\.[a-zA-Z]{2,10})?$/i.test(
        val,
    );
};

const isString = (value: any) => {
    return typeof value === 'string';
};

const fiatFormat = (
    amount: number,
    decimal?: number,
    isRoundToDecimal?: boolean,
) => {
    const finalDecimal = decimal ?? 2;
    if (isRoundToDecimal) {
        amount = Number(amount.toFixed(finalDecimal));
    }
    const parts = amount.toFixed(finalDecimal).toString().split('.');

    const formattedInteger = new Intl.NumberFormat('en-US').format(
        Number(parts[0]),
    );

    const result = parts[1]
        ? `${formattedInteger}.${parts[1].slice(0, finalDecimal)}`
        : formattedInteger;

    return result;
};

const formattedCurrency = (amount: number) => {
    const factor = 10 ** 2;
    const truncated = Math.floor(amount * factor) / factor;
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(truncated);
};
const formattedledgerifyCurrency = (amount: number) => {
    const factor = 10 ** 4;
    const truncated = Math.floor(amount * factor) / factor;
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
    }).format(truncated);
};

const formattedPoint = (amount: number | string) => {
    try {
        return new Intl.NumberFormat('en-US').format(+amount);
    } catch (error) {
        console.error('formattedPoint Error:', error);
        return 0;
    }
};
const truncateToSixDecimals = (amount: number) => {
    const factor = 10 ** 6;
    const truncated = Math.floor(amount * factor) / factor;
    return truncated < 0.000001 ? 0 : truncated;
};
const truncateToThreeDecimals = (amount: number) => {
    const factor = 10 ** 3;
    const truncated = Math.floor(amount * factor) / factor;
    return truncated < 0.001 ? 0 : truncated;
};
const truncateToTwoDecimals = (amount: number) => {
    const factor = 10 ** 2;
    const truncated = Math.floor(amount * factor) / factor;
    return truncated < 0.01 ? 0 : truncated;
};
const truncateToTwoDecimalsWithoutChecking = (amount: number): string => {
    const factor = 10 ** 2;
    const truncated = Math.floor(Math.abs(amount) * factor) / factor;

    return truncated === 0 ? '0.00' : `${truncated}`;
};

const truncateToNumberDecimals = (amount: number, decimals: number) => {
    const factor = 10 ** decimals;
    const truncated = Math.floor(amount * factor) / factor;
    return truncated < 0.01 ? 0 : truncated;
};
const roundDownToTwoDecimals = (amount: number): number => {
    const factor = 10 ** 2;
    return Math.floor(amount * factor) / factor;
};

const formattedBalanceCurrency = (
    amount: number,
    maximumFractionDigits?: number,
): string => {
    if (amount === 0) {
        return '0';
    }
    const fractionDigits = amount >= 1000 ? 2 : 8;
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: maximumFractionDigits ?? fractionDigits,
    }).format(amount);
};

const checkImageUrlImage = async (url: string) => {
    try {
        return await Image.prefetch(url);
    } catch (error) {
        console.log(error);
        return false;
    }
};

const formattedAmountClaim = (amount: number) => {
    if (amount === undefined || amount === null) {
        return 0;
    }
    const fractionDigits = amount >= 100 ? 0 : 10;
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: fractionDigits,
    }).format(amount);
};

const formattedAmountClaimTotal = (amount: string) => {
    if (typeof amount !== 'string' || !amount.trim()) return '0';

    amount = amount.replace(/[^0-9.]/g, '');

    if ((amount.match(/\./g) || []).length > 1) return '0';

    const [integerPart, decimalPart] = amount.split('.');

    if (!integerPart || isNaN(Number(integerPart))) return '0';

    const formattedInteger = new Intl.NumberFormat('en-US').format(
        Number(integerPart),
    );

    return decimalPart !== undefined
        ? `${formattedInteger}.${decimalPart}`
        : formattedInteger;
};

export const formatMarketCap = (value: number) => {
    if (value >= 1_000_000_000_000) {
        return truncateToTwoDecimals(value / 1_000_000_000_000) + 'T';
    } else if (value >= 1_000_000_000) {
        return truncateToTwoDecimals(value / 1_000_000_000) + 'B';
    } else if (value >= 1_000_000) {
        return truncateToTwoDecimals(value / 1_000_000) + 'M';
    }
    return value;
};

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        },
    );
}
const keepNumbers = (input: string) => {
    return input.replace(/,/g, '.');
};
const convertAmountToWeiFollowDecimals = (
    amount: number | string,
    decimals: number,
) => {
    try {
        let normalizedAmount = amount.toString().replace(/,/g, '');

        if (/e/i.test(normalizedAmount)) {
            normalizedAmount = toPlainString(normalizedAmount);
        }

        const [integerPart, decimalPart = ''] = normalizedAmount.split('.');
        const trimmedDecimalPart = decimalPart
            .slice(0, decimals - 1)
            .padEnd(decimals, '0');
        const fullAmount = integerPart + trimmedDecimalPart;

        const weiAmount = BigInt(fullAmount);
        return weiAmount;
    } catch (error) {
        console.error('convertAmountToWeiFollowDecimals Error:', error);
        return 0n;
    }
};
const toPlainString = (num: string | number): string => {
    const str = num.toString();
    if (!/e/i.test(str)) return str;

    const match = str.match(/^(-?)(\d+\.?\d*)e([+-]?\d+)$/i);
    if (!match) throw new Error('Invalid scientific notation');

    const [, sign, coefficient, exponent] = match;
    const exp = parseInt(exponent, 10);

    const [intPart, decPart = ''] = coefficient.split('');

    if (exp === 0) return sign + coefficient;

    if (exp > 0) {
        const newDecPart = decPart.padEnd(exp + decPart.length, '0');
        return sign + intPart + newDecPart;
    } else {
        const leadingZeros = '0'.repeat(Math.abs(exp) - 1);
        return sign + '0.' + leadingZeros + intPart + decPart;
    }
};

const convertBigIntFollowDecimals = (
    wei: bigint | string,
    decimals: number,
): string => {
    try {
        if (wei === 0n || wei === '0') return '0';

        const weiBig = Big(wei.toString());
        const divisor = Big(10).pow(decimals);

        const integerPart = weiBig
            .div(divisor)
            .round(0, Big.roundDown)
            .toString();

        const fractionalPartBig = weiBig.mod(divisor);

        let fractionalPart = fractionalPartBig.toString();
        if (fractionalPart !== '0') {
            fractionalPart = fractionalPart.padStart(decimals, '0');
        }

        return decimals > 0 ? `${integerPart}.${fractionalPart}` : integerPart;
    } catch (error) {
        console.error('convertBigIntFollowDecimals Error:', error);
        return '0';
    }
};
function removeTrailingZeros(input: string) {
    if (!input.includes('.')) {
        return input;
    }

    const [integerPart, decimalPart] = input.split('.');

    const cleanedDecimalPart = decimalPart.replace(/0+$/, '');

    if (cleanedDecimalPart === '') {
        return integerPart;
    }

    return `${integerPart}.${cleanedDecimalPart}`;
}

const formatAmountSend = (amount: number) =>
    new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 20,
    }).format(amount);

const getDaysAgo = (days: number) => {
    return moment().subtract(days, 'days').format('YYYY-MM-DD');
};

const isInputAmountZero = (amount: string) => {
    try {
        const res = parseFloat(amount);
        return res === 0;
    } catch (error) {
        console.error('isInputAmountZero Error:', error);
        return true;
    }
};

const truncateText = (text: string, maxLength = 8) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const generateUniqueId = () => {
    const utcTimestamp = moment.utc().valueOf();

    const randomString = Math.random().toString(36).substring(2, 15);

    return `${utcTimestamp}-${randomString}`;
};

const separateCallBack = (url: string) => {
    const urlParts = url?.split('://');
    return {
        scheme: urlParts?.[0] + '://',
        host: urlParts?.[1],
    };
};
const convertDate = (dateString: string): string => {
    return moment(dateString).format('MMM D, YYYY').toUpperCase(); // Format the date
};
const getTimeByDate = (dateString: string): string => {
    return moment(dateString).format('hh:mm A'); // Format the time in AM/PM
};
const isExpired = (expiresAt: number) => {
    const currentTime = moment();
    const expirationTime = moment.unix(expiresAt);
    return expirationTime.isBefore(currentTime);
};

const createErrorContext = (context: ErrorContext): string => {
    return Object.entries(context)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' | ');
};

const logConfig = () => {
    if (__DEV__) {
        console.log('====================================');
        console.log('App starting in development mode');
        console.log('====================================');
    } else {
        console.log = () => { };
        console.warn = () => { };
        console.error = () => { };
    }
};

const removeQRPrefix = (value: string): string => {
    if (value.startsWith(QRGenerator.TonViewer)) {
        return value.slice(QRGenerator.TonViewer.length);
    } else if (value.startsWith(QRGenerator.EtherScan)) {
        return value.slice(QRGenerator.EtherScan.length);
    }
    return value;
};

const Utils = {
    showToast,
    isObjectEmpty,
    isArrayEmpty,
    generateQuestions,
    screenWidth,
    screenHeight,
    compareAppVersions,
    emailValid,
    formatNumber,
    isString,
    formattedCurrency,
    formattedBalanceCurrency,
    isAndroid,
    isIos,
    BOTTOM_SHEET_MAX_HEIGHT,
    BOTTOM_SHEET_MIN_HEIGHT,
    generateUUID,
    convertAmountToWeiFollowDecimals,
    convertBigIntFollowDecimals,
    removeTrailingZeros,
    formatAmountSend,
    keepNumbers,
    getDaysAgo,
    formattedAmountClaim,
    isInputAmountZero,
    generateUniqueId,
    separateCallBack,
    truncateText,
    convertDate,
    getTimeByDate,
    formattedPoint,
    isExpired,
    truncateToSixDecimals,
    roundDownToTwoDecimals,
    checkingEmulator,
    fiatFormat,
    truncateToThreeDecimals,
    truncateToTwoDecimals,
    truncateToNumberDecimals,
    createErrorContext,
    logConfig,
    formatMarketCap,
    truncateToTwoDecimalsWithoutChecking,
    removeQRPrefix,
    formattedAmountClaimTotal,
    formattedledgerifyCurrency,
    checkImageUrlImage,
};

export default Utils;
