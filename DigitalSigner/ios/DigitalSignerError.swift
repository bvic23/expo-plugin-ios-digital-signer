import Foundation

public enum DigitalSignerError: LocalizedError {
  case invalidPEM  // Couldn't strip headers / Base64-decode.
  case invalidDER
  case unexpectedASN1Structure  // Tag mismatch or unexpected ordering.
  case unsupportedAlgorithm  // AlgorithmIdentifier OID ≠ rsaEncryption.
  case keyCreationFailed(CFError)  // SecKeyCreateWithData returned nil.
  case signatureError(String)
  case fileReadError(String)
  case keyReadError(String)

  public var errorDescription: String {
    switch self {
    case .invalidPEM:
      return "Invalid PEM"
    case .invalidDER:
      return "Invalid DER"
    case .unexpectedASN1Structure:
      return "Unexpected ASN.1 structure"
    case .unsupportedAlgorithm:
      return "Unsupported algorithm"
    case .keyCreationFailed(let cfError):
      return "Key creation failed: \(CFErrorCopyDescription(cfError) as String? ?? "Unknown error")"
    case .signatureError(let message):
      return "Signature error: \(message)"
    case .fileReadError(let message):
      return "File read error: \(message)"
    case .keyReadError(let message):
      return "Key read error: \(message)"
    }
  }
}
