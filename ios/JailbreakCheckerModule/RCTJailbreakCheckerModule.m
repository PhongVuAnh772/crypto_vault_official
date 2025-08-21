#import <React/RCTBridgeModule.h>
#import "RCTJailbreakCheckerModule.h"
#import <React/RCTLog.h>
#import "TrustVault-Swift.h"

@implementation RCTJailbreakCheckerModule

RCT_EXPORT_METHOD(isJailBroken:(BOOL)isSimulator
                  resolve:(RCTResponseSenderBlock)resolve
                  rejecter:(RCTResponseSenderBlock)reject)
{
  [JailbreakCheckerModule isJailBrokenWithIsSimulator:isSimulator successCallback:resolve failCallback:reject];
}

RCT_EXPORT_MODULE();
@end
