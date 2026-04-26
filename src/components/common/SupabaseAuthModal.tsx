import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, View } from 'react-native';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { supabase } from 'src/core/services/supabase/supabaseClient';
import AppButton from './AppButton';
import AppModal from './AppModal';
import AppText from './AppText';

interface SupabaseAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SupabaseAuthModal: React.FC<SupabaseAuthModalProps> = ({ visible, onClose, onSuccess }) => {
  const theme = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert('Success', 'Check your email for confirmation!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      Alert.alert('Auth Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      visible={visible}
      onTouchOutside={onClose}
      titleWithI18n={isSignUp ? "Create Community Account" : "Community Login"}
      footerView={
        <View style={styles.container}>
          <AppText
            title={isSignUp ? "Join our crypto community to start sharing!" : "Login to share your thoughts on the feed."}
            variant={TextVariantKeys.bodyRSmall}
            textColor={theme.colors.text_on_surface_text_medium_high}
            styles={styles.subtitle}
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#999"
            style={[styles.input, { color: theme.colors.text_on_surface_text_high, borderBottomColor: theme.colors.background }]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            style={[styles.input, { color: theme.colors.text_on_surface_text_high, borderBottomColor: theme.colors.background }]}
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.buttonSpace} />

          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.surface_surface_brand} />
          ) : (
            <>
              <AppButton
                title={isSignUp ? "Sign Up" : "Sign In"}
                onPress={handleAuth}
                styles={styles.mainButton}
              />
              <AppButton
                title={isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                onPress={() => setIsSignUp(!isSignUp)}
                styles={styles.subButton}
              />
            </>
          )}
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    width: '100%',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderBottomWidth: 1,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonSpace: {
    height: 10,
  },
  mainButton: {
    borderRadius: 12,
    height: 50,
  },
  subButton: {
    marginTop: 10,
  }
});

export default SupabaseAuthModal;
