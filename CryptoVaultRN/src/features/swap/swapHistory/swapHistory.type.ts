import { ProtocolDataWithSupportedTokensFormBEType } from 'src/core/redux/slice/account.type';
import { SwapHistory } from 'src/core/services/ChangeNow/types';

export type SwapHistoryProps = {
    item: SwapHistory;
    index: number;
    length: number;
    onPress?: () => void;
    listImage: Record<string, string>;
};
export type HeaderListProps = {
    onPressProtocol: () => void;
    onPressWallet: () => void;
    protocolSelected: ProtocolDataWithSupportedTokensFormBEType | null;
    nameWallet: string;
};
