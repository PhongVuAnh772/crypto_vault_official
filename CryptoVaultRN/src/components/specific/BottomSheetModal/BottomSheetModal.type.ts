import {ReactNode} from 'react';

export type SecretPhraseModalType = {
    maxHeight?: number;
    showModal: boolean;
    closeModalAction: () => void;
    child: ReactNode;
    bottomChild?: ReactNode;
    subModalChild?: ReactNode;
    showSubModal?: boolean;
    onCloseSubModalWhenClickOutside?: () => void;
    onDismiss?: () => void;
    scrollView?: boolean;
    usingClosingButtonModal?: boolean;
};
