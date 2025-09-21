import { useProtocolSelected } from 'src/core/redux/slice/account.selector';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

const useAddCustomToken = ({ navigation }: RootNavigationType) => {
    const currentProtocol = useProtocolSelected();
    return {
        currentProtocol,
    };
};
export default useAddCustomToken;
