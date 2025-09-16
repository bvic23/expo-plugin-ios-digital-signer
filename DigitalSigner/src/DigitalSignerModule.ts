import { NativeModule, requireNativeModule } from "expo";
import { DigitalSignerModuleEvents } from "./DigitalSigner.types";

declare class DigitalSignerModule extends NativeModule<DigitalSignerModuleEvents> {
  digitalSignFileAsync(fileUri: string, keyUri: string): Promise<string>;
}

const DigitalSigner = requireNativeModule<DigitalSignerModule>("DigitalSigner");

export const digitalSignFileAsync = async (
  fileUri: string,
  keyUri: string
): Promise<string> => {
  if (!fileUri || typeof fileUri !== "string") {
    throw new Error("Invalid fileUri: must be a non-empty string");
  }

  if (!keyUri || typeof keyUri !== "string") {
    throw new Error("Invalid keyUri: must be a non-empty string");
  }

  // Call the native module
  const signature = await DigitalSigner.digitalSignFileAsync(fileUri, keyUri);
  if (!signature || typeof signature !== "string") {
    throw new Error("Invalid signature returned from native module");
  }

  return signature;
};

export default DigitalSigner;
