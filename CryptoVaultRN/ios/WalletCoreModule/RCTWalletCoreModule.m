#import <React/RCTBridgeModule.h>
#import "RCTWalletCoreModule.h"
#import <React/RCTLog.h>
#import <WalletCoreModule/WalletCoreModule-Swift.h>



@implementation RCTWalletCoreModule

// MARK: Get EVM Key From Slip0044

RCT_EXPORT_METHOD(getEVMKeyAndAddressFromSlip0044:(NSString *)mnemonic
                  slip0044:(double)slip0044
                  derivationPath:(NSString *)derivationPath
                  resolver:(RCTResponseSenderBlock)resolve
                  rejecter:(RCTResponseSenderBlock)reject)
{
  [WalletCoreModule getEVMKeyAndAddressFromSlip0044WithMnemonic:mnemonic
                                                       slip0044:(uint32_t)slip0044
                                                 derivationPath:derivationPath
                                                successCallback:resolve
                                                   failCallback:reject];
}

// MARK: Get EVM Key From Slip0044

RCT_EXPORT_METHOD(getDataFromSlip0044:(NSString *)mnemonic
                  isTestNet:(BOOL)isTestNet
                  slip0044:(double)slip0044
                  derivationPath:(NSString *)derivationPath
                  resolver:(RCTResponseSenderBlock)resolve
                  rejecter:(RCTResponseSenderBlock)reject)
{
  [WalletCoreModule getDataFromSlip0044WithMnemonic:mnemonic isTestNet:isTestNet slip0044:slip0044 derivationPath:derivationPath successCallback:resolve failCallback:reject];
}



// MARK: Create Wallet

RCT_EXPORT_METHOD(createWallet:(RCTResponseSenderBlock)resolve
                  rejecter:(RCTResponseSenderBlock)reject)
{
  [WalletCoreModule createWalletWithSuccessCallback:resolve failCallback:reject];
}

// MARK: Import Wallet

RCT_EXPORT_METHOD(importWallet:(NSString *)mnemonic
                  resolver:(RCTResponseSenderBlock)resolve
                  rejecter:(RCTResponseSenderBlock)reject)
{
  [WalletCoreModule importWalletWithMnemonic:mnemonic successCallback:resolve failCallback:reject];
}

RCT_EXPORT_MODULE();
@end

