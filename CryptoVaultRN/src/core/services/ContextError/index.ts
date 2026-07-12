import { ErrorContextKey } from 'src/core/enum/ContactFailedAction';
import commonUtils from 'src/core/utils/commonUtils';

export type ContextErrorType = {
    feature: string;
    protocol?: string;
    fileError: string;
    functionError: string;
    lineError?: number;
    reason: string;
    id?: number;
};

const createContextError = ({
    feature,
    protocol,
    fileError,
    functionError,
    lineError,
    reason,
    id,
}: ContextErrorType) => {
    return commonUtils.createErrorContext({
        [ErrorContextKey.Feature]: feature,
        [ErrorContextKey.Protocol]: protocol ?? 'Unknown Protocol',
        [ErrorContextKey.FileError]: fileError,
        [ErrorContextKey.FunctionError]: functionError,
        [ErrorContextKey.LineError]: lineError ?? 'Unknown Line Error',
        [ErrorContextKey.Reason]: reason,
        [ErrorContextKey.id]: id ?? 'Unknown Id',
    });
};

export default createContextError;
