import { useSelector } from 'react-redux';
import { RootState } from 'src/core/redux/store';

export const useSelectorTransferSlip0044 = () =>
    useSelector((state: RootState) => state?.transferSlice?.transferSlip0044);
