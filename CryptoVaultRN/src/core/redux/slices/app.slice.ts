export * from 'src/core/redux/slice/app.slice';
export { default } from 'src/core/redux/slice/app.slice';

// Legacy action aliases kept for backward compatibility with old auth flows.
export const setPin = (pin: string) => ({
  type: 'app/legacySetPin',
  payload: pin,
});

export const setTemporaryMnemonic = (mnemonic: string) => ({
  type: 'app/legacySetTemporaryMnemonic',
  payload: mnemonic,
});
