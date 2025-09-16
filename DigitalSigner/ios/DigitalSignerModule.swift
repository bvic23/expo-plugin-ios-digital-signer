import CommonCrypto
import ExpoModulesCore
import Foundation
import Security

extension Data {
  func sha256() -> Data {
    var hash = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
    self.withUnsafeBytes {
      _ = CC_SHA256($0.baseAddress, CC_LONG(self.count), &hash)
    }
    return Data(hash)
  }
}

private let header = "-----BEGIN PRIVATE KEY-----"
private let footer = "-----END PRIVATE KEY-----"
private let rsaOID: [UInt8] = [0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x01]  // 1.2.840.113549.1.1.1

public class DigitalSignerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DigitalSigner")

    AsyncFunction("digitalSignFileAsync") { (fileUri: String, keyUri: String) -> String in
      guard let fileUrl = URL(string: fileUri), let fileData = try? Data(contentsOf: fileUrl) else {
        throw DigitalSignerError.fileReadError("Could not read file at path: \(fileUri)")
      }

      guard let keyUrl = URL(string: keyUri),
        let keyString = try? String(contentsOf: keyUrl, encoding: .utf8)
      else {
        throw DigitalSignerError.keyReadError("Could not read private key at path: \(keyUri)")
      }

      let privateKey = try parseKey(fromPEM: keyString)
      let signature = try signDigitally(data: fileData, privateKey: privateKey)
      return signature.base64EncodedString()
    }
  }

  private func derData(fromPEM pem: String) throws -> Data {
    guard pem.contains(header) && pem.contains(footer) else {
      throw DigitalSignerError.invalidPEM
    }

    let base64 =
      pem
      .replacingOccurrences(of: header, with: "")
      .replacingOccurrences(of: footer, with: "")
      .replacingOccurrences(of: "\\s+", with: "", options: .regularExpression)

    guard let data = Data(base64Encoded: base64) else {
      throw DigitalSignerError.invalidPEM
    }
    return data
  }

  private func extractPKCS1(fromPKCS8 der: Data) throws -> Data {
    var reader = DERReader(data: der)

    // (1) Outer SEQUENCE
    let (seqTag, seqBytes) = try reader.readTLV()
    guard seqTag == 0x30 else {
      throw DigitalSignerError.unexpectedASN1Structure
    }

    var seqReader = DERReader(data: seqBytes)

    // (2) Version INTEGER
    let (verTag, _) = try seqReader.readTLV()
    guard verTag == 0x02 else {
      throw DigitalSignerError.unexpectedASN1Structure
    }

    // (3) AlgorithmIdentifier SEQUENCE
    let (algTag, algBytes) = try seqReader.readTLV()
    guard algTag == 0x30 else {
      throw DigitalSignerError.unexpectedASN1Structure
    }

    // └─ Parse the AlgorithmIdentifier to verify OID == rsaEncryption.
    var algReader = DERReader(data: algBytes)
    let (oidTag, oidValue) = try algReader.readTLV()
    guard oidTag == 0x06 else {
      throw DigitalSignerError.unexpectedASN1Structure
    }

    guard oidValue.elementsEqual(Data(rsaOID)) else {
      throw DigitalSignerError.unsupportedAlgorithm
    }
    // Optional parameters (usually NULL) are skipped if present.
    if algReader.offset < algReader.data.endIndex {
      try algReader.skipTLV()
    }

    // (4) PrivateKey OCTET STRING - PKCS#1 blob
    let (octetTag, octetData) = try seqReader.readTLV()
    guard octetTag == 0x04 else {
      throw DigitalSignerError.unexpectedASN1Structure
    }
    return octetData
  }

  private func parseKey(fromPEM pem: String) throws -> SecKey {
    let der8 = try derData(fromPEM: pem)
    let pkcs1 = try extractPKCS1(fromPKCS8: der8)

    var reader = DERReader(data: pkcs1)

    // RSAPrivateKey SEQUENCE
    let (outerTag, outerBytes) = try reader.readTLV()
    guard outerTag == 0x30 else {
      throw DigitalSignerError.unexpectedASN1Structure
    }

    var rsaReader = DERReader(data: outerBytes)
    let (vTag, _) = try rsaReader.readTLV()
    guard vTag == 0x02 else {
      throw DigitalSignerError.unexpectedASN1Structure
    }

    // Modulus INTEGER - compute correct bit length (strip possible 0x00 padding byte).
    let (modTag, modData) = try rsaReader.readTLV()
    guard modTag == 0x02 else {
      throw DigitalSignerError.unexpectedASN1Structure
    }

    let modulus = modData.first == 0x00 ? modData.dropFirst() : modData[...]
    let bitSize = modulus.count * 8

    // Attrs dictionary (optionally persistent).
    let attrs: [String: Any] = [
      kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
      kSecAttrKeyClass as String: kSecAttrKeyClassPrivate,
      kSecAttrKeySizeInBits as String: bitSize,
    ]

    var cfError: Unmanaged<CFError>?
    guard let key = SecKeyCreateWithData(pkcs1 as CFData, attrs as CFDictionary, &cfError) else {
      throw DigitalSignerError.keyCreationFailed(cfError!.takeRetainedValue())
    }
    return key
  }

  private func signDigitally(data: Data, privateKey: SecKey) throws -> Data {
    // Create a hash of the data using SHA-256
    let hashData = data.sha256()

    // Create the digital signature
    var error: Unmanaged<CFError>?
    guard
      let signature = SecKeyCreateSignature(
        privateKey, .rsaSignatureMessagePKCS1v15SHA256, hashData as CFData, &error)
    else {
      let errorMessage = error?.takeRetainedValue().localizedDescription ?? "Unknown error"
      throw DigitalSignerError.signatureError("Failed to create digital signature: \(errorMessage)")
    }

    return signature as Data
  }
}
