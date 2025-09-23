import GlobalUtils from "src/core/utils/globalUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

const useStakingTransaction = ({ navigation }: RootNavigationType) => {
  const handleClose = () => {
    navigation.goBack();
  };
  return {
    handleClose,
  };
};
export default useStakingTransaction;
