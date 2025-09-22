import Foundation
import WalletCore
import CryptoKit
import React

@objc(BitcoinModule)
class BitcoinModule: NSObject {
  
  struct UTXOData {
    var txHash: String
    var indexHash: Int
    var amount: Double
  }
  
  @objc static func isValidBitcoinAddress(
    isTestNet: Bool,
    address: String,
    successCallback: @escaping RCTResponseSenderBlock,
    failCallback: @escaping RCTResponseSenderBlock
  ) {
    print("Check address: ", address)

    let isValid: Bool
      
    if isTestNet {
      // Testnet validation
          if address.hasPrefix("m") || address.hasPrefix("n") || address.hasPrefix("2") || address.hasPrefix("tb1") {
            isValid = BitcoinAddress.isValidString(string: address) || SegwitAddress.isValidString(string: address)
      } else {
        isValid = false
      }
    } else {
      // Mainnet validation
          isValid = BitcoinAddress.isValidString(string: address) || SegwitAddress.isValidString(string: address)
    }
      
    print("Check address result: ", isValid)

    if isValid {
      successCallback([true])
    } else {
      failCallback([false])
    }
  }
  
  // MARK: Bitcoin get max amount
  @objc static func bitcoinGetMaxAmount(
    byteFee: Int64,
    utxoDataFormRN: [[String: Any]],
    adminFee: Int64,
    spendSizeBytes: Int64,
    successCallback: @escaping RCTResponseSenderBlock,
    failCallback: @escaping RCTResponseSenderBlock
  ) {
    let coin: CoinType = .bitcoin
    var utxoDataArray = [UTXOData]()
    
    for dict in utxoDataFormRN {
      guard let txHash = dict["tx_hash"] as? String else {
        failCallback(["Missing tx_hash in utxoData"])
        return
      }
      guard let indexHash = dict["tx_output_n"] as? Int else {
        failCallback(["Missing tx_output_n in utxoData"])
        return
      }
      guard let amount = dict["value"] as? Double else {
        failCallback(["Missing value in utxoData"])
        return
      }
      let utxoData = UTXOData(
        txHash: txHash,
        indexHash: indexHash,
        amount: amount
      )
      utxoDataArray.append(utxoData)
    }
    
    print("utxoDataFormRN",utxoDataFormRN)
    print("utxoDataArray",utxoDataArray)
    print("byteFee",byteFee)
    
    if utxoDataFormRN.isEmpty {
      failCallback(["No data received from React Native"])
      return
    }
    
    var input = BitcoinSigningInput.with {
      $0.hashType = TWBitcoinSigHashTypeAll.rawValue
      $0.byteFee = byteFee
      $0.fixedDustThreshold = spendSizeBytes * byteFee
      $0.coinType = coin.rawValue
      $0.useMaxUtxo = true
      $0.useMaxAmount = true
    }
    
    for dict in utxoDataArray {
      let txHash = dict.txHash
      let indexHash = dict.indexHash
      let amount = dict.amount
      
      let utxoTxId = Data(hexString: txHash)!
      let outPoint = BitcoinOutPoint.with {
        $0.hash = Data(utxoTxId.reversed())
        $0.index = UInt32(indexHash)
      }
      let utxo = BitcoinUnspentTransaction.with {
        $0.amount = Int64(amount)
        $0.outPoint = outPoint
      }
      input.utxo.append(utxo)
    }
    
    let plan: BitcoinTransactionPlan = AnySigner.plan(input: input, coin: coin)
    print(
      "Planned fee:  ",
      plan.fee,
      "amount:",
      plan.amount,
      "avail_amount:",
      plan.availableAmount,
      "change:",
      plan.change
    )
    
    print("Planned error: ", plan.error)
    
    if (plan.error == TW_Common_Proto_SigningError.ok) {
      successCallback([plan.amount - adminFee - (33 * byteFee)])
    } else {
      failCallback([plan.error])
    }
  }
  
  // MARK: Bitcoin transaction
  
  @objc static func bitcoinTransaction(
    env: String ,
    mnemonic: String,
    toAddress: String,
    amountSend: Int64,
    byteFee: Int64,
    adminAddress: String,
    adminFee: Int64,
    utxoDataFormRN: [[String: Any]],
    spendSizeBytes: Int64,
    successCallback: @escaping RCTResponseSenderBlock,
    failCallback: @escaping RCTResponseSenderBlock
  ) {
    let coin: CoinType = .bitcoin
    var utxoDataArray = [UTXOData]()
    
    for dict in utxoDataFormRN {
      guard let txHash = dict["tx_hash"] as? String else {
        failCallback(["Missing tx_hash in utxoData"])
        return
      }
      guard let indexHash = dict["tx_output_n"] as? Int else {
        failCallback(["Missing tx_output_n in utxoData"])
        return
      }
      guard let amount = dict["value"] as? Double else {
        failCallback(["Missing value in utxoData"])
        return
      }
      let utxoData = UTXOData(
        txHash: txHash,
        indexHash: indexHash,
        amount: amount
      )
      utxoDataArray.append(utxoData)
    }
    print("utxoDataFormRN",utxoDataFormRN)
    print("utxoDataArray",utxoDataArray)
    print("amountSend",amountSend)
    print("toAddress",toAddress)
    print("byteFee",byteFee)
    
    if utxoDataFormRN.isEmpty {
      failCallback(["No data received from React Native"])
      return
    }
    
    guard let addressBtc = WalletCoreModule.getAddressWithEnv(env: env, coinType: coin, derivation: .bitcoinTestnet, mnemonic: mnemonic) else {
      failCallback(["Failed to get bitcoin address"])
      return
    }
    
    
    let secretKey = WalletCoreModule.getKeyWithEnv(
      env: env,
      coinType: CoinType.bitcoin,
      derivation: .bitcoinTestnet,
      mnemonic: mnemonic
    )
  
    var input = BitcoinSigningInput.with {
      $0.amount = amountSend
      $0.hashType = TWBitcoinSigHashTypeAll.rawValue
      $0.toAddress = toAddress
      $0.changeAddress = addressBtc
      $0.byteFee = byteFee
      $0.coinType = coin.rawValue
      $0.fixedDustThreshold = spendSizeBytes * byteFee
    }
    
    if (adminFee > 0) {
      var adminOutput = TW_Bitcoin_Proto_OutputAddress()
      adminOutput.amount = adminFee
      adminOutput.toAddress = adminAddress
      
      input.extraOutputs.append(adminOutput)
    }
    
    for dict in utxoDataArray {
      let txHash = dict.txHash
      let indexHash = dict.indexHash
      let amount = dict.amount
      print("txHash",txHash)
      print("indexHash",indexHash)
      print("amount",amount)
      
      let utxoTxId = Data(hexString: txHash)!
      let outPoint = BitcoinOutPoint.with {
        $0.hash = Data(utxoTxId.reversed())
        $0.index = UInt32(indexHash)
      }
      let utxo = BitcoinUnspentTransaction.with {
        $0.amount = Int64(amount)
        $0.outPoint = outPoint
        $0.script = BitcoinScript
          .lockScriptForAddress(address: addressBtc, coin: coin).data
      }
      input.utxo.append(utxo)
    }
    
    if let privateKey = secretKey?.data {
      input.privateKey.append(privateKey)
    } else {
      failCallback(["Get bitcoin key fail"])
      return
    }
    
    // Calculate fee (plan a tranaction)
    let plan: BitcoinTransactionPlan = AnySigner.plan(input: input, coin: coin)
    print(
      "Planned fee:  ",
      plan.fee,
      "amount:",
      plan.amount,
      "avail_amount:",
      plan.availableAmount,
      "change:",
      plan.change
    )
    print("Planned error: ", plan.error)
    
    if (plan.error == TW_Common_Proto_SigningError.ok) {
      // Set the precomputed plan
      input.plan = plan
      input.amount = plan.amount
      
      let outputBtc: BitcoinSigningOutput = AnySigner.sign(
        input: input,
        coin: coin
      )
      
      if (outputBtc.error == TW_Common_Proto_SigningError.ok) {
        let result = ["base64EncodedTransaction": outputBtc.encoded.hexString, "fee": plan.fee] as [String : Any]
        
        print("Signed transaction: ", outputBtc.encoded.hexString)
        
        successCallback([result])
      } else {
        failCallback([bitcoinPlanError(from: outputBtc.error)])
      }
      return
    } else {
      failCallback([bitcoinPlanError(from: plan.error)])
      return
    }
  }
  
  // MARK: Bitcoin plan error
  
  private static func bitcoinPlanError(from error: TW_Common_Proto_SigningError) -> String {
    switch error {
    case .ok:
      return "OK"
    case .errorGeneral:
      return "Generic error"
    case .errorInternal:
      return "Internal error"
    case .errorLowBalance:
      return "Low balance"
    case .errorZeroAmountRequested:
      return "Zero amount requested"
    case .errorMissingPrivateKey:
      return "Missing private key"
    case .errorInvalidPrivateKey:
      return "Invalid private key"
    case .errorInvalidAddress:
      return "Invalid address"
    case .errorInvalidUtxo:
      return "Invalid UTXO"
    case .errorInvalidUtxoAmount:
      return "Invalid UTXO amount"
    case .errorWrongFee:
      return "Wrong fee"
    case .errorSigning:
      return "Signing error"
    case .errorTxTooBig:
      return "Transaction too big"
    case .errorMissingInputUtxos:
      return "Missing input UTXOs"
    case .errorNotEnoughUtxos:
      return "Not enough UTXOs"
    case .errorScriptRedeem:
      return "Missing required redeem script"
    case .errorScriptOutput:
      return "Invalid output script"
    case .errorScriptWitnessProgram:
      return "Unrecognized witness program"
    case .errorInvalidMemo:
      return "Invalid memo"
    case .errorInputParse:
      return "Input parsing error"
    case .errorNoSupportN2N:
      return "Multi-input and multi-output transaction not supported"
    case .errorSignaturesCount:
      return "Incorrect number of signatures"
    case .errorInvalidParams:
      return "Invalid parameters"
    case .errorInvalidRequestedTokenAmount:
      return "Invalid token amount"
    case .errorNotSupported:
      return "Operation not supported"
    case .errorDustAmountRequested:
      return "Dust amount requested"
    case .UNRECOGNIZED(let value):
      return "Unrecognized error code: \(value)"
    }
  }
}
