import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AppText from 'src/components/common/AppText';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';

const NativeAd: React.FC = () => {
  const theme = useAppTheme();

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: theme.colors.surface_surface_brand }]}>
      <View style={styles.header}>
        <AppText title="Sponsored" variant={TextVariantKeys.bodyRSmall} textColor={theme.colors.text_on_surface_text_medium} />
      </View>
      <View style={styles.content}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=300&auto=format&fit=crop' }} 
          style={styles.adImage} 
        />
        <View style={styles.textContainer}>
          <AppText title="Top trending coins today" variant={TextVariantKeys.titleSmall} />
          <AppText 
            title="Discover the most profitable gems in the market right now. Trade with low fees." 
            variant={TextVariantKeys.bodyRSmall} 
            textColor={theme.colors.text_on_surface_text_medium}
            numberOfLines={2}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },
  header: {
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
  },
  adImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
});

export default NativeAd;
