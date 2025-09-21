import { useEffect, useState } from 'react';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import GlobalUtils from 'src/core/utils/globalUtils';
import { PinCodeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

const usePinCode = ({ navigation }: RootNavigationType) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const [pinCode, setPinCode] = useState('');
    const [showIncorrectPinModal, setShowIncorrectPinModal] = useState(false);
    const theme = useAppTheme();

    useEffect(() => {
        if (pinCode.length === 6) {
            continueAction();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pinCode.length]);

    const continueAction = async () => {
        navigation.navigate(PinCodeStackScreenKey.ReEnterPin, {
            pinCode: pinCode,
        });
    };

    return {
        showIncorrectPinModal,
        setShowIncorrectPinModal,
        pinCode,
        setPinCode,
        continueAction,
        theme,
        newUI,
    };
};

export default usePinCode;
