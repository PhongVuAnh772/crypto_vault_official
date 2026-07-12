import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useProtocolSelected } from 'src/core/redux/slice/account.selector';

const useNFTUnAddedDetail = () => {
    const insets = useAppSafeAreaInsets();
    const currentProtocol = useProtocolSelected();
    return {
        currentProtocol,
        insets,
    };
};

export default useNFTUnAddedDetail;
