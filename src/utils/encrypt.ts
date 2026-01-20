import JSEncrypt from 'jsencrypt';
import { getPublicKey } from '../api/login';

// 存储公钥的变量
let publicKey: string = '';

// 存储获取公钥的Promise，确保只请求一次
let publicKeyPromise: Promise<string> | null = null;

/**
 * 获取并设置公钥
 * @returns Promise<string> 公钥字符串
 */
export const fetchAndSetPublicKey = async (): Promise<string> => {
  // 如果已经有公钥，直接返回
  if (publicKey) {
    return publicKey;
  }
  
  // 如果已经有请求在进行，返回同一个Promise
  if (publicKeyPromise) {
    return publicKeyPromise;
  }
  
  // 开始新的请求
  publicKeyPromise = getPublicKey()
    .then(key => {
      publicKey = key;
      return key;
    })
    .catch(error => {
      console.error('获取公钥失败:', error);
      throw error;
    })
    .finally(() => {
      // 请求完成后清除Promise（可选，根据需要）
      // publicKeyPromise = null;
    });
  
  return publicKeyPromise;
};

/**
 * 设置公钥
 * @param key 公钥字符串
 */
export const setPublicKey = (key: string): void => {
  publicKey = key;
};

/**
 * RSA加密函数
 * @param text 需要加密的文本
 * @returns 加密后的文本
 */
export const encryptRSA = (text: string): string => {
  if (!publicKey) {
    console.warn('公钥尚未设置，使用原始文本');
    return text;
  }
  
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  const encrypted = encryptor.encrypt(text);
  return encrypted || text;
};

/**
 * 批量加密对象中的指定字段
 * @param data 需要加密的数据对象
 * @param fields 需要加密的字段名数组
 * @returns 加密后的数据对象
 */
export const encryptFields = <T extends Record<string, any>>(data: T, fields: string[]): T => {
  // 创建一个新对象，确保类型安全
  const result = { ...data } as T;
  fields.forEach(field => {
    if (result[field] !== undefined && result[field] !== null) {
      // 使用类型断言确保TypeScript知道我们在修改已知属性
      (result as Record<string, any>)[field] = encryptRSA(String(result[field]));
    }
  });
  return result;
};
