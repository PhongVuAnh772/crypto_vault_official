import Foundation

@objc(JailbreakCheckerModule)
class JailbreakCheckerModule: NSObject {
  @objc static func isJailBroken(
    isSimulator: Bool,
    successCallback: RCTResponseSenderBlock,
    failCallback: RCTResponseSenderBlock
  ) {
    if(isSimulator){
      failCallback([false])
    } else {
      let suspiciousPaths = [
        "/Applications/Cydia.app",
        "/Library/MobileSubstrate/MobileSubstrate.dylib",
        "/bin/bash",
        "/usr/sbin/sshd",
        "/etc/apt"
      ]
      for path in suspiciousPaths {
        if FileManager.default.fileExists(atPath: path) {
          print("Include file")
          successCallback([true])
          return
        }
      }
      let testPath = "/private/jailbreak_test.txt"
      do {
        try "test".write(toFile: testPath, atomically: true, encoding: .utf8)
        try FileManager.default.removeItem(atPath: testPath)
        print("Can wirte file")
        successCallback([true])
        return
      } catch {
        print("Can't wirte file")
      }
      failCallback([false])
    }
  }
}
