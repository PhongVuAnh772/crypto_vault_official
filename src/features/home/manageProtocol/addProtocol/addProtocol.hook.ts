import {useAppTheme} from 'src/core/hooks/useAppTheme';
import {AppThemeType} from 'src/core/type/ThemeType';

const useAddProtocol = () => {
    const theme: AppThemeType = useAppTheme();
    return {
        theme,
    };
};
export default useAddProtocol;
