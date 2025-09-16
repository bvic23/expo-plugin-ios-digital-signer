export interface DigitalSignerError {
  code: string;
  message: string;
  details?: string;
}

export interface DigitalSignerResult {
  success: boolean;
  signature?: string;
  error?: DigitalSignerError;
}

export type DigitalSignerModuleEvents = {};
