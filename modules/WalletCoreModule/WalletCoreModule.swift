import Foundation
import WalletCore
import CryptoKit


@objc(WalletCoreModule)
class WalletCoreModule: NSObject {
  
  // MARK: Get Address With Env
  
  static func getAddressWithEnv(env: String ,coinType: CoinType, derivation: Derivation? = Derivation.default, mnemonic: String) -> String? {
    if let wallet = HDWallet(mnemonic: mnemonic, passphrase: "") {
      let addressBTC: String?
      if env == "development" {
        addressBTC = wallet.getAddressDerivation(coin: coinType, derivation: derivation ?? Derivation.default)
      } else {
        addressBTC = wallet.getAddressForCoin(coin: coinType);
      }
      
      print("\(coinType) Address \(env): ", addressBTC ?? "")
      return addressBTC;
    } else {
      return nil;
    }
  }
  
  @objc static func getEVMKeyAndAddressFromSlip0044(mnemonic: String, slip0044: UInt32, derivationPath: String, successCallback: @escaping RCTResponseSenderBlock, failCallback: @escaping RCTResponseSenderBlock) {
    
    guard let coinType = CoinType(rawValue: slip0044) else {
      return failCallback(["Invalid slip0044"])
    }
    
    guard let wallet = HDWallet(mnemonic: mnemonic, passphrase: "") else {
      return failCallback(["Invalid mnemonic"])
    }
    
    let privateKey: PrivateKey = wallet.getKey(coin: coinType, derivationPath: derivationPath)
    let addressFromDerivation = CoinType.ethereum.deriveAddress(privateKey: privateKey)
    
    let result:[String : Any] = ["address": addressFromDerivation, "key": privateKey.data.hexString]
    
    return successCallback([result])
    
  }
  
  // MARK: Get data from Slip0044

  @objc static func getDataFromSlip0044(
      mnemonic: String,
      isTestNet: Bool,
      slip0044: UInt32,
      derivationPath: String?,
      successCallback: @escaping RCTResponseSenderBlock,
      failCallback: @escaping RCTResponseSenderBlock
  ) {
      // Ensure valid CoinType
      guard let coinType = CoinType(rawValue: slip0044) else {
          return failCallback(["Invalid slip0044"])
      }
      
      // Ensure valid mnemonic
      guard let wallet = HDWallet(mnemonic: mnemonic, passphrase: "") else {
          return failCallback(["Invalid mnemonic"])
      }
      
      // Set derivation path (default or provided)
      let finalDerivationPath = derivationPath ?? coinType.derivationPath()
      
      // Get private key based on network type
      let privateKey: PrivateKey? = isTestNet && coinType == CoinType.bitcoin
          ? wallet.getKeyForCoin(coin: coinType)
          : wallet.getKey(coin: coinType, derivationPath: finalDerivationPath)
      
      // Ensure privateKey is not nil
      guard let validPrivateKey = privateKey else {
          return failCallback(["Failed to generate private key"])
      }
      
      // Generate public key and address
      let publicKey = validPrivateKey.getPublicKey(coinType: coinType)
      let address: String? = isTestNet && coinType == CoinType.bitcoin
          ? wallet.getAddressDerivation(coin: coinType, derivation: Derivation.bitcoinTestnet)
          : coinType.deriveAddress(privateKey: validPrivateKey)
    
      // Ensure address is not nil
      guard let validAddress = address else {
          return failCallback(["Failed to generate address"])
      }
      
      // Prepare result
      let result: [String: String] = [
          "address": validAddress,
          "privateKey": validPrivateKey.data.base64EncodedString(),
          "publicKey": publicKey.data.base64EncodedString()
      ]
      
      // Success callback
      return successCallback([result])
  }
  
  // MARK: Get Key With Env
  
  static func getKeyWithEnv(env: String ,coinType: CoinType, derivation: Derivation? = Derivation.default, mnemonic: String) -> PrivateKey? {
    if let wallet = HDWallet(mnemonic: mnemonic, passphrase: "") {
      let keyBTC: PrivateKey?
      if env == "development" {
        keyBTC = wallet.getKeyDerivation(coin: coinType, derivation: derivation ?? Derivation.default)
      } else {
        keyBTC = wallet.getKeyForCoin(coin: coinType);
      }
      
      print("\(coinType) Key \(env): ", keyBTC?.data.hexString ?? "")
      return keyBTC;
    } else {
      return nil;
    }
  }
  
  // MARK: Create Wallet
  
  @objc static func createWallet(successCallback: RCTResponseSenderBlock, failCallback: RCTResponseSenderBlock) {
    let wallet = HDWallet(strength: 128, passphrase: "")
    if let mnemonic = wallet?.mnemonic {
      successCallback([mnemonic])
    } else {
      failCallback(nil)
    }
  }
  
  // MARK: Import Wallet
  
  @objc static func importWallet(mnemonic: String, successCallback: @escaping RCTResponseSenderBlock, failCallback: @escaping RCTResponseSenderBlock) {
    if let wallet = HDWallet(mnemonic: mnemonic, passphrase: "") {
      successCallback([wallet.mnemonic])
    } else {
      failCallback(nil)
    }
  }
}
