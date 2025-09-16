// Reexport the native module. On web, it will be resolved to DigitalSignerModule.web.ts
// and on native platforms to DigitalSignerModule.ts
export * from './DigitalSigner.types';
export { default, digitalSignFileAsync } from './DigitalSignerModule';

