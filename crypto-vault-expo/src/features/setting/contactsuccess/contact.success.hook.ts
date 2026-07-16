import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import GlobalUtils from "src/core/utils/globalUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

const useContactSuccess = ({ navigation }: RootNavigationType) => {
  const handleGoBack = () => navigation.goBack();
  const insets: EdgeInsets = useSafeAreaInsets();
  const theme = useAppTheme();
  return { insets, theme, handleGoBack };
};
export default useContactSuccess;
