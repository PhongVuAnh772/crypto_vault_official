import GlobalUtils from 'src/core/utils/globalUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

const useStakingTransaction = ({ navigation }: RootNavigationType) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const handleClose = () => {
        navigation.goBack();
    };
    return {
        newUI,
        handleClose,
    };
};
export default useStakingTransaction;
