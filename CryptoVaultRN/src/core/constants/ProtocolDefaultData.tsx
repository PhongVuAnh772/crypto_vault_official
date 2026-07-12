import VMType from '../enum/VMType';
import { ProtocolDataWithSupportedTokensFormBEType } from '../redux/slice/account.type';

// Dữ liệu mặc định rỗng để ép App phải Fetch từ Backend/Supabase của bạn.
// Khi đó, Admin có thể tắt/mở các protocol một cách chính xác.

export const DefaultProtocolData = {};

export const DefaultProtocolDataList: ProtocolDataWithSupportedTokensFormBEType[] = [];
