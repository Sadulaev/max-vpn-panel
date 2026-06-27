/**
 * Парсер VLESS ключа для автозаполнения формы сервера
 * Формат: vless://uuid@host:port?params#name
 */

export interface VlessParams {
  publicHost: string;
  publicPort: number;
  security: string;
  pbk: string;
  fp: string;
  sni: string;
  sid: string;
  spx: string;
  flow?: string;
  type?: string;
  encryption?: string;
}

/**
 * Парсит VLESS ключ и возвращает параметры для формы
 */
export function parseVlessKey(vlessKey: string): Partial<VlessParams> | null {
  try {
    // Проверяем что ключ начинается с vless://
    if (!vlessKey.startsWith('vless://')) {
      return null;
    }

    // Убираем префикс vless://
    const withoutPrefix = vlessKey.substring(8);

    // Разделяем на основную часть и name (по #)
    const [mainPart] = withoutPrefix.split('#');

    // Разделяем на uuid@host:port и параметры
    const [hostPart, paramsString] = mainPart.split('?');

    // Парсим host:port
    const atIndex = hostPart.lastIndexOf('@');
    const hostPortPart = hostPart.substring(atIndex + 1);
    const [publicHost, portStr] = hostPortPart.split(':');
    const publicPort = parseInt(portStr, 10);

    if (!publicHost || !publicPort) {
      return null;
    }

    // Парсим параметры
    const params = new URLSearchParams(paramsString);
    
    const result: Partial<VlessParams> = {
      publicHost,
      publicPort,
    };

    // Извлекаем все параметры
    if (params.has('security')) {
      result.security = params.get('security')!;
    }
    if (params.has('pbk')) {
      result.pbk = params.get('pbk')!;
    }
    if (params.has('fp')) {
      result.fp = params.get('fp')!;
    }
    if (params.has('sni')) {
      result.sni = params.get('sni')!;
    }
    if (params.has('sid')) {
      result.sid = params.get('sid')!;
    }
    if (params.has('spx')) {
      result.spx = params.get('spx')!;
    }
    if (params.has('flow')) {
      result.flow = params.get('flow')!;
    }

    return result;
  } catch (error) {
    console.error('Error parsing VLESS key:', error);
    return null;
  }
}
