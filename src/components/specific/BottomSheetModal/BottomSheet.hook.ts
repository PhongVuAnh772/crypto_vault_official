import {useCallback, useEffect, useRef, useState} from 'react';
import Utils from 'src/core/utils/commonUtils';
import {Animated, PanResponder} from 'react-native';
import {EdgeInsets} from 'react-native-safe-area-context';
import useStyles from './BottomSheet.styles';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import {useAppTheme} from 'src/core/hooks/useAppTheme';

export const useBottomSheet = ({
    maxHeight = 0.7,
    showModal,
    onClose,
    onDismiss,
}: {
    maxHeight?: number;
    showModal: boolean;
    onClose: () => void;
    onDismiss?: () => void;
}) => {
    const insets: EdgeInsets = useAppSafeAreaInsets();
    const theme = useAppTheme();
    const BOTTOM_SHEET_MAX_HEIGHT = Utils.screenHeight * maxHeight;
    const BOTTOM_SHEET_MIN_HEIGHT = 0;
    const MAX_UPWARD_TRANSLATE_Y =
        BOTTOM_SHEET_MIN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT;
    const MAX_DOWNWARD_TRANSLATE_Y = 0;
    const DRAG_THRESHOLD = 70;

    const styles = useStyles(
        BOTTOM_SHEET_MAX_HEIGHT + insets.bottom,
        BOTTOM_SHEET_MIN_HEIGHT,
        insets,
        theme,
    );

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (showModal) {
            setVisible(showModal);
            springAnimation('up');
        } else {
            if (!visible) {
                return;
            }
            closeModal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showModal]);

    const closeModal = useCallback(() => {
        springAnimation('down');
        onClose();
        setTimeout(() => {
            if (Utils.isAndroid && onDismiss) {
                onDismiss();
            }
            setVisible(false);
        }, 300);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onDismiss, showModal]);

    const animatedValue = useRef(new Animated.Value(0)).current;
    const lastGestureDy = useRef(0);
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                animatedValue.setOffset(lastGestureDy.current);
            },
            onPanResponderMove: (e, gesture) => {
                animatedValue.setValue(gesture.dy);
            },
            onPanResponderRelease: (e, gesture) => {
                animatedValue.flattenOffset();
                lastGestureDy.current += gesture.dy;
                if (lastGestureDy.current < MAX_UPWARD_TRANSLATE_Y) {
                    lastGestureDy.current = MAX_UPWARD_TRANSLATE_Y;
                } else if (lastGestureDy.current > MAX_DOWNWARD_TRANSLATE_Y) {
                    lastGestureDy.current = MAX_DOWNWARD_TRANSLATE_Y;
                }

                if (gesture.dy <= DRAG_THRESHOLD) {
                    springAnimation('up');
                } else {
                    closeModal();
                }
            },
        }),
    ).current;

    const springAnimation = (direction: 'up' | 'down') => {
        lastGestureDy.current =
            direction === 'down'
                ? MAX_DOWNWARD_TRANSLATE_Y
                : MAX_UPWARD_TRANSLATE_Y;
        Animated.spring(animatedValue, {
            toValue: lastGestureDy.current,
            useNativeDriver: true,
        }).start();
    };

    const bottomSheetAnimation = {
        transform: [
            {
                translateY: animatedValue.interpolate({
                    inputRange: [
                        MAX_UPWARD_TRANSLATE_Y,
                        MAX_DOWNWARD_TRANSLATE_Y,
                    ],
                    outputRange: [
                        MAX_UPWARD_TRANSLATE_Y,
                        MAX_DOWNWARD_TRANSLATE_Y,
                    ],
                    extrapolate: 'clamp',
                }),
            },
        ],
    };

    return {
        bottomSheetAnimation,
        panResponder,
        closeModal,
        visible,
        styles,
    };
};
