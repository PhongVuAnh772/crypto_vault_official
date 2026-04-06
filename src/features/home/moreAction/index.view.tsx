import React from 'react'
import { StyleSheet } from 'react-native'
import { ScreenWrapper } from 'src/components'
import TextVariantKeys from 'src/core/enum/TextVariantKeys'
import { useAppTheme } from "src/core/hooks/useAppTheme"

const MoreActionScreen = () => {
  const theme = useAppTheme();
  return (
     <ScreenWrapper
      enableDismissKeyboard
      enableHeader
      headerTitleWithI18n={'More'}
      headerTextVariant={TextVariantKeys.titleLarge}
      paddingTop
      backgroundColor={theme.colors.surface_surface_default}
    >
      <></>
    </ScreenWrapper>
  )
}

export default MoreActionScreen

const styles = StyleSheet.create({})
