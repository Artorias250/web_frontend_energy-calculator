import axios from 'axios';
import { Api } from './generated/Api';
import type { ApplianceResponse, UserResponse } from './generated/Api';
import type { Appliance } from '../data/appliances';

// Пути сгенерированного клиента уже начинаются с /api. Повторять /api в baseURL нельзя.
export const applianceApi = new Api({ baseURL: '/', withCredentials: true, timeout: 12000 });
export const authApi = axios.create({ baseURL: '/api/users', withCredentials: true, timeout: 12000 });
// Вход/выход — только ручной Axios; Redux обновляет вызывающий компонент.
export async function login(email: string, password: string) {
  return (await authApi.post<UserResponse>('/login', { email, password })).data;
}
export async function logout() { await authApi.post('/logout'); }

export function mediaUrl(value: string | null): string | null {
  if (!value || !value.trim()) return value;
  if (value.startsWith('/s3/')) return value;
  try {
    const url = new URL(value);
    const configured = import.meta.env.VITE_S3_ORIGIN || 'http://localhost:9000';
    if (url.origin === configured || (['localhost', '127.0.0.1'].includes(url.hostname) && url.port === '9000'))
      return `/s3${url.pathname}${url.search}`;
  } catch { /* локальные /media и blob не требуют проксирования */ }
  return value;
}
export function toAppliance(item: ApplianceResponse): Appliance {
  return { ...item, description: item.description ?? '', powerWatts: item.powerWatts ?? 0,
    minTemperature: item.minTemperature ?? 0,
    imageUrl: mediaUrl(item.imageUrl), videoUrl: mediaUrl(item.videoUrl) };
}
export function isBackendUnavailable(error: unknown) {
  return axios.isAxiosError(error) && (!error.response ||
    [502, 504].includes(error.response.status) ||
    (error.response.status === 500 && !error.response.data));
}
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string') return message;
    if (!error.response) return 'Нет связи с сервером. Проверьте запуск бэкенда.';
    return `Ошибка запроса: ${error.response.status}`;
  }
  return error instanceof Error ? error.message : 'Не удалось выполнить запрос';
}
