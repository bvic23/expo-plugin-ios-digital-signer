import CommonCrypto
import Foundation
import Security

private let shortFormLength: UInt8 = 0x80
private let longFormLength: UInt8 = 0x7F

internal struct DERReader {
  private(set) var offset: Data.Index
  let data: Data

  init(data: Data) {
    self.data = data
    self.offset = data.startIndex
  }

  mutating func readByte() throws -> UInt8 {
    guard offset < data.endIndex else {
      throw DigitalSignerError.invalidDER
    }

    defer {
      offset = data.index(after: offset)
    }

    return data[offset]
  }

  /// Reads short- or long-form length (≤ 4 bytes).
  mutating func readLength() throws -> Int {
    let first = try readByte()

    if first & shortFormLength == 0 {
      return Int(first)
    }

    let octetCount = Int(first & longFormLength)

    guard octetCount > 0 && octetCount <= 4 else {
      throw DigitalSignerError.invalidDER
    }

    var length = 0
    for _ in 0..<octetCount {
      length = (length << 8) | Int(try readByte())
    }

    return length
  }

  /// Reads a complete TLV and returns (tag, valueBytes).
  mutating func readTLV() throws -> (tag: UInt8, value: Data) {
    let tag = try readByte()
    let length = try readLength()

    guard data.distance(from: offset, to: data.endIndex) >= length else {
      throw DigitalSignerError.invalidDER
    }
    let start = offset
    offset = data.index(offset, offsetBy: length)

    return (tag, data[start..<offset])
  }

  /// Skips a TLV without allocating.
  mutating func skipTLV() throws {
    _ = try readTLV()
  }
}
