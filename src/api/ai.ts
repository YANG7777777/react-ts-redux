import { getToken } from '../utils/request';

const baseURL =
  import.meta.env.VITE_APP_API || import.meta.env.VITE_APP_API_TARGET || '';

export interface AskAIParams {
  question: string;
  stream?: boolean;
}

/** 流式问答：逐段回调；返回完整回答文本 */
export async function askAIStream(
  question: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(`${baseURL}/deepseek`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: JSON.stringify({ question, stream: true }),
    signal,
  });

  if (!response.ok) {
    let message = `请求失败 (${response.status})`;
    try {
      const err = (await response.json()) as { detail?: string; message?: string };
      message = err.detail || err.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error('浏览器不支持流式响应');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullAnswer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      fullAnswer += chunk;
      onChunk(chunk);
    }
  }

  // flush decoder
  const tail = decoder.decode();
  if (tail) {
    fullAnswer += tail;
    onChunk(tail);
  }

  return fullAnswer;
}

/** 非流式问答（兜底） */
export async function askAI(question: string): Promise<string> {
  const response = await fetch(`${baseURL}/deepseek`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: JSON.stringify({ question, stream: false }),
  });

  if (!response.ok) {
    let message = `请求失败 (${response.status})`;
    try {
      const err = (await response.json()) as { detail?: string; message?: string };
      message = err.detail || err.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const data = (await response.json()) as { answer?: string };
  if (!data.answer) {
    throw new Error('未收到有效回答');
  }
  return data.answer;
}
