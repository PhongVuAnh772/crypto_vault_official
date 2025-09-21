import React from 'react';
import {Animated, ScrollView, TouchableOpacity, View} from 'react-native';
import CoreModal from 'src/components/common/CoreModal';
import {Close2SvgIcon} from 'src/core/constants/AppIconsSvg';
import {useAppTheme} from 'src/core/hooks/useAppTheme';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import {useBottomSheet} from './BottomSheet.hook';
import {SecretPhraseModalType} from './BottomSheetModal.type';

const BottomSheetModal: React.FC<SecretPhraseModalType> = props => {
    const {
        showModal,
        closeModalAction,
        child,
        maxHeight = 0.7,
        bottomChild,
        subModalChild,
        showSubModal = false,
        onCloseSubModalWhenClickOutside,
        onDismiss,
        scrollView = false,
        usingClosingButtonModal = true,
    } = props;

    const {bottomSheetAnimation, panResponder, closeModal, visible, styles} =
        useBottomSheet({
            maxHeight,
            showModal,
            onClose: closeModalAction,
            onDismiss: onDismiss,
        });
    const theme = useAppTheme();
    return (
        <CoreModal transparent visible={visible} onDismiss={onDismiss}>
            <View
                style={[
                    appStyles.flex1,
                    appStyles.center,
                    styles.modalContainer,
                ]}>
                <TouchableOpacity
                    style={[
                        {
                            height: Utils.screenHeight,
                            width: Utils.screenWidth,
                        },
                    ]}
                    onPress={closeModal}
                />

                <Animated.View
                    style={[styles.bottomSheet, bottomSheetAnimation]}>
                    {scrollView ? (
                        <>
                            <View style={styles.childrenViewScroll}>
                                <View {...panResponder.panHandlers}>
                                    <View style={styles.draggableArea}>
                                        <View style={styles.dragHandle} />
                                    </View>
                                </View>
                                <View
                                    style={[
                                        appStyles.justifyContentEnd,
                                        appStyles.flexRow,
                                        appStyles.pH15,
                                    ]}>
                                    {usingClosingButtonModal && (
                                        <TouchableOpacity onPress={closeModal}>
                                            <Close2SvgIcon
                                                color={
                                                    theme.colors
                                                        .text_on_surface_text_high
                                                }
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <ScrollView
                                    contentContainerStyle={
                                        styles.contentContainerStyle
                                    }
                                    bounces={false}>
                                    {child}
                                </ScrollView>
                            </View>
                            <View style={styles.bottomButtonScroll}>
                                {bottomChild}
                            </View>
                        </>
                    ) : (
                        <View {...panResponder.panHandlers}>
                            <View style={styles.draggableArea}>
                                <View style={styles.dragHandle} />
                            </View>
                            <View style={styles.mainView} />
                            <View style={styles.bottomButton}>
                                {bottomChild}
                            </View>
                            <View style={styles.childrenView}>{child}</View>
                        </View>
                    )}
                </Animated.View>
            </View>
            {showSubModal ? (
                <TouchableOpacity
                    activeOpacity={onCloseSubModalWhenClickOutside ? 0.3 : 1}
                    style={styles.subModalContainer}
                    onPress={onCloseSubModalWhenClickOutside}>
                    {subModalChild}
                </TouchableOpacity>
            ) : null}
        </CoreModal>
    );
};

export default BottomSheetModal;
