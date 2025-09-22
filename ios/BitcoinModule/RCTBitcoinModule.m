#import <React/RCTBridgeModule.h>
#import "RCTBitcoinModule.h"
#import <React/RCTLog.h>
#import "CryptoVault-Swift.h"

@implementation RCTBitcoinModule

// MARK: Bitcoin get max amount

RCT_EXPORT_METHOD(bitcoinGetMaxAmount:(int64_t)byteFee
                  utxoDataFormRN:(NSArray<NSDictionary *> *)utxoDataFormRN
                  adminFee:(double)adminFee
                  spendSizeBytes:(double)spendSizeBytes
                  resolver:(RCTResponseSenderBlock)resolve
                  rejecter:(RCTResponseSenderBlock)reject)
{
  [BitcoinModule bitcoinGetMaxAmountWithByteFee:byteFee utxoDataFormRN:utxoDataFormRN adminFee:adminFee spendSizeBytes:spendSizeBytes successCallback:resolve failCallback:reject];
}

// MARK: Bitcoin transaction

RCT_EXPORT_METHOD(bitcoinTransaction:(NSString *)env
                  mnemonic:(NSString *)mnemonic
                  toAddress:(NSString *)toAddress
                  amountSend:(double)amountSend
                  byteFee:(double)byteFee
                  adminAddress:(NSString *)adminAddress
                  adminFee:(double)adminFee
                  utxoDataFormRN:(NSArray<NSDictionary *> *)utxoDataFormRN
                  spendSizeBytes:(double)spendSizeBytes
                  resolver:(RCTResponseSenderBlock)resolve
                  rejecter:(RCTResponseSenderBlock)reject)
{
  [BitcoinModule bitcoinTransactionWithEnv:env mnemonic:mnemonic toAddress:toAddress amountSend:amountSend byteFee:byteFee adminAddress:adminAddress adminFee:adminFee utxoDataFormRN:utxoDataFormRN spendSizeBytes:spendSizeBytes successCallback:resolve failCallback:reject];
}

// MARK: Valid Bitcoin Address

RCT_EXPORT_METHOD(isValidBitcoinAddress:(BOOL)isTestNet
                  address:(NSString *)address
                  resolver:(RCTResponseSenderBlock)resolve
                  rejecter:(RCTResponseSenderBlock)reject)
{
  [BitcoinModule isValidBitcoinAddressWithIsTestNet:isTestNet
                                            address:address
                                    successCallback:resolve
                                       failCallback:reject];
}

RCT_EXPORT_MODULE();
@end
