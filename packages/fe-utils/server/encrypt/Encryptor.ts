export interface Encryptor<ValueType, EncryptResult> {
  encrypt(value: ValueType): EncryptResult;
  decrypt(encryptedData: EncryptResult): ValueType;
}
