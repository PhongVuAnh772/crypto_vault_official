import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ethers } from 'ethers';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import AppText from 'src/components/common/AppText';
import { AppleSvgIcon, ArrowLeftSvgIcon, GoogleSvgIcon, LogoAppSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { RootState } from 'src/core/redux/store';
import { supabase } from 'src/core/services/supabase/supabaseClient';

const { width } = Dimensions.get('window');

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

// Cấu hình Google Sign-In
GoogleSignin.configure({
  webClientId: '1012826749135-m969i54mss7otk7oh59c9itei6udgsio.apps.googleusercontent.com', // Tạm dùng iOS ID nếu chưa có Web ID
  iosClientId: '1012826749135-9m69i54mss7otk7oh59c9itei6udgsio.apps.googleusercontent.com',
});

const SocialAuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const accountLists = useSelector((state: RootState) => state.account.accountLists);
  const protocolLists = useSelector((state: RootState) => state.account.protocolListsWithSupportedTokensFromBE);

  const handleWeb3SignIn = async () => {
    try {
      // 1. Kiểm tra xem user đã có ví EVM trong app chưa
      if (!accountLists || accountLists.length === 0 || !protocolLists) {
        Alert.alert('No Wallet Found', 'Please create or import a wallet first.');
        return;
      }

      setLoading(true);

      // Lấy tài khoản hiện tại
      const currentAccount = accountLists[0];

      // Tìm chính xác protocol EVM bằng cách đối chiếu _id với danh sách protocolLists
      let protocolInfo: any = null;
      const evmProtocolData = currentAccount.protocolData?.find(p => {
        const info = protocolLists.find(pl => pl._id === p._id);
        if (!info) return false;
        const symbol = info.symbol?.toUpperCase() || '';
        const slip0044 = info.slip0044;
        const isEVM = p.addressList && p.addressList.length > 0 &&
          (['ETH', 'POL', 'BNB', 'MATIC', 'AVAX'].includes(symbol) || [60, 966, 2000].includes(slip0044));
        if (isEVM) protocolInfo = info;
        return isEVM;
      });

      const walletData = evmProtocolData?.addressList?.[0];

      if (!walletData || !walletData.privateKey || !protocolInfo) {
        Alert.alert('No EVM Wallet', 'Please create an Ethereum or Polygon wallet to use this feature.');
        return;
      }

      // Hầu hết dự án Supabase mới mặc định Site URL là http://localhost:3000
      // BẠN CẦN KIỂM TRA TRONG Dashboard -> Authentication -> URL Configuration -> Site URL
      const REDIRECT_URL = 'http://localhost:3000';

      // 2. Gọi Supabase Auth Web3
      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: 'ethereum',
        statement: 'Log in to CryptoVault with your secure wallet.',
        options: {
          url: REDIRECT_URL,
        },
        wallet: {
          address: new ethers.Wallet(
            walletData.privateKey!.startsWith('0x') || walletData.privateKey!.length === 64
              ? (walletData.privateKey!.startsWith('0x') ? walletData.privateKey! : '0x' + walletData.privateKey!)
              : '0x' + Buffer.from(walletData.privateKey!, 'base64').toString('hex')
          ).address,
          request: async ({ method, params }: any) => {
            // Chuẩn hóa Private Key cho mọi request cần dùng wallet
            let pk = walletData.privateKey!;
            if (!pk.startsWith('0x') && pk.length !== 64) {
              const buf = Buffer.from(pk, 'base64');
              pk = '0x' + buf.toString('hex');
            } else if (!pk.startsWith('0x')) {
              pk = '0x' + pk;
            }
            const wallet = new ethers.Wallet(pk);

            if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
              return [wallet.address];
            }
            if (method === 'eth_chainId') {
              const chainId = protocolInfo.chainId || 1;
              return `0x${chainId.toString(16)}`;
            }
            if (method === 'personal_sign') {
              let message = params[0];
              if (message.startsWith('0x')) {
                try {
                  const decoded = ethers.toUtf8String(message);
                  if (decoded) message = decoded;
                } catch (e) { }
              }

              console.log('======= SIWE MESSAGE DEBUG =======');
              console.log(message);
              console.log('==================================');

              return await wallet.signMessage(message);
            }
            throw new Error(`Method ${method} not supported`);
          },
          on: () => { },
          removeListener: () => { }
        }
      });

      if (error) throw error;

      console.log('Web3 Login Success:', data);
      navigation.goBack();

    } catch (error: any) {
      console.error('Web3 Auth Error:', error);
      Alert.alert('Web3 Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.data?.idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });
        if (error) throw error;
        navigation.goBack();
      }
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Google Auth Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        if (error) throw error;
        navigation.goBack();
      }
    } catch (error: any) {
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple Auth Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert('Success', 'Verification email sent!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 50, 20, 0.8)', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftSvgIcon width={20} height={20} fill="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <LogoAppSvgIcon width={60} height={60} />
          <AppText
            title={isSignUp ? "Create Account" : "Welcome Back"}
            variant={TextVariantKeys.headlineLarge}
            textColor="#FFFFFF"
            styles={styles.title}
          />
          <AppText
            title={isSignUp ? "Join our network to manage your portfolio." : "Sign in to manage and grow your portfolio."}
            variant={TextVariantKeys.bodyRMedium}
            textColor="rgba(255, 255, 255, 0.6)"
            styles={styles.subtitle}
          />
        </View>

        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="email-outline" size={20} color="rgba(255, 255, 255, 0.4)" style={styles.inputIcon} />
            <TextInput
              placeholder="Email address"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password Input */}
          <View style={[styles.inputWrapper, { borderColor: 'rgba(0, 180, 100, 0.3)', borderWidth: 1 }]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="rgba(255, 255, 255, 0.4)" style={styles.inputIcon} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              secureTextEntry={!showPassword}
              style={[styles.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="rgba(255, 255, 255, 0.4)"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPass}>
            <AppText title="Forgot password?" variant={TextVariantKeys.bodyRMedium} textColor="#FFFFFF" styles={{ textDecorationLine: 'underline' }} />
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color="#00B464" style={styles.loader} />
          ) : (
            <TouchableOpacity style={styles.continueButton} onPress={handleAuth}>
              <AppText title="Continue" variant={TextVariantKeys.titleMedium} textColor="#000000" />
            </TouchableOpacity>
          )}

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <AppText title="or" variant={TextVariantKeys.bodyRMedium} textColor="rgba(255, 255, 255, 0.4)" styles={{ marginHorizontal: 15 }} />
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
            <GoogleSvgIcon width={20} height={20} />
            <AppText title="Continue with Google" variant={TextVariantKeys.bodyRMedium} textColor="#FFFFFF" styles={{ marginLeft: 12 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, { marginTop: 12 }]}
            onPress={handleAppleSignIn}
            disabled={Platform.OS !== 'ios'} // Chỉ hỗ trợ iOS cho Apple Login
          >
            <AppleSvgIcon width={20} height={20} fill="#fff" />
            <AppText title="Continue with Apple" variant={TextVariantKeys.bodyRMedium} textColor="#FFFFFF" styles={{ marginLeft: 12 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, { marginTop: 12, borderColor: 'rgba(0, 180, 100, 0.5)' }]}
            onPress={handleWeb3SignIn}
          >
            <MaterialCommunityIcons name="wallet-outline" size={20} color="#00B464" />
            <AppText title="Continue with Wallet" variant={TextVariantKeys.bodyRMedium} textColor="#FFFFFF" styles={{ marginLeft: 12 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <AppText
            title={isSignUp ? "Already have an account? " : "Don't have an account? "}
            variant={TextVariantKeys.bodyRMedium}
            textColor="rgba(255, 255, 255, 0.6)"
          />
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <AppText
              title={isSignUp ? "Sign In" : "Sign Up"}
              variant={TextVariantKeys.bodyRMedium}
              textColor="#FFFFFF"
              styles={{ textDecorationLine: 'underline' }}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    marginTop: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 16,
    height: '100%',
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loader: {
    marginVertical: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  socialButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
  },
});

export default SocialAuthScreen;
