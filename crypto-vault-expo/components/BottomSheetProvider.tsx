import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import React, { useCallback, useMemo } from "react";
import { ViewStyle, StyleSheet } from "react-native";
import appStyles from "src/core/styles";
import appColors from "src/core/constants/AppColors";

type BottomSheetModalGorhomType = {
  refModal: React.RefObject<BottomSheetModalMethods>;
  children?: React.ReactNode;
  snapPoints?: string[];
  onDismiss?: () => void;
  pressBehavior?: "none" | "collapse" | "close";
  containerStyles?: ViewStyle;
  enablePanDownToClose?: boolean;
  enableContentPanningGesture?: boolean;
  scrollEnable?: boolean;
  enableDismissOnClose?: boolean;
};
const BottomSheetModalGorhom: React.FC<BottomSheetModalGorhomType> = ({
  refModal,
  children,
  snapPoints = ["70%"],
  onDismiss,
  pressBehavior,
  containerStyles,
  enablePanDownToClose,
  enableContentPanningGesture,
  scrollEnable,
  enableDismissOnClose,
}) => {
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior={pressBehavior}
      />
    ),
    [pressBehavior]
  );
  const bottomSheetModalGorhomStyle = useStyle();
  const snapPointsMemo = useMemo(() => snapPoints, [snapPoints]);
  return (
    <BottomSheetModal
      ref={refModal}
      backdropComponent={renderBackdrop}
      index={0}
      snapPoints={snapPointsMemo}
      enablePanDownToClose={enablePanDownToClose}
      handleIndicatorStyle={bottomSheetModalGorhomStyle.indicator}
      backgroundStyle={[
        bottomSheetModalGorhomStyle.backgroundStyle,
        containerStyles,
      ]}
      enableContentPanningGesture={enableContentPanningGesture}
      enableDismissOnClose={enableDismissOnClose}
      animateOnMount={false}
      onDismiss={onDismiss}
    >
      <BottomSheetScrollView
        contentContainerStyle={appStyles.flex1}
        scrollEnabled={scrollEnable}
      >
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default BottomSheetModalGorhom;

const useStyle = () =>
  StyleSheet.create({
    indicator: {
      width: 48,
      backgroundColor: appColors.neutral.n300,
    },
    backgroundStyle: {
      backgroundColor: appColors.neutral.white,
    },
  });
