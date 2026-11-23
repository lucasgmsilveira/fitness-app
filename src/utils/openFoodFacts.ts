export interface ParsedOpenFoodFactsFood {
  name: string;
  brand?: string;
  barcode: string;
  servingLabel: string;
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  source: 'Open Food Facts';
  sourceId: string;
}

export type OpenFoodFactsResult =
  | { ok: true; food: ParsedOpenFoodFactsFood }
  | { ok: false; error: string };

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function readFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(',', '.'));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function parseOpenFoodFactsProduct(
  payload: unknown,
  rawBarcode: string
): OpenFoodFactsResult {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'Resposta inválida do Open Food Facts.' };
  }

  const record = payload as Record<string, unknown>;
  if (record.status !== 1 || !record.product || typeof record.product !== 'object') {
    return {
      ok: false,
      error: 'Produto não encontrado no Open Food Facts. Cadastre manualmente usando o rótulo.',
    };
  }

  const product = record.product as Record<string, unknown>;
  const nutriments =
    product.nutriments && typeof product.nutriments === 'object'
      ? (product.nutriments as Record<string, unknown>)
      : {};

  const kcalDirect = readFiniteNumber(nutriments['energy-kcal_100g']);
  const kjDirect = readFiniteNumber(nutriments['energy-kj_100g']);
  const energyDirect = readFiniteNumber(nutriments['energy_100g']);

  const caloriesPer100 =
    kcalDirect !== null
      ? Math.round(Math.max(0, kcalDirect))
      : kjDirect !== null
        ? Math.round(Math.max(0, kjDirect / 4.184))
        : energyDirect !== null
          ? Math.round(Math.max(0, energyDirect / 4.184))
          : 0;

  const proteinRaw = readFiniteNumber(nutriments['proteins_100g']);
  const carbsRaw = readFiniteNumber(nutriments['carbohydrates_100g']);
  const fatRaw = readFiniteNumber(nutriments['fat_100g']);
  // Dados ausentes não significam zero: manter `null` quando a fibra não estiver informada.
  const fiberRaw = readFiniteNumber(nutriments['fiber_100g']);

  const productName =
    typeof product.product_name === 'string' && product.product_name.trim()
      ? product.product_name.trim()
      : `Produto ${rawBarcode}`;
  const brand =
    typeof product.brands === 'string' && product.brands.trim()
      ? product.brands.split(',')[0].trim()
      : undefined;
  const fullName =
    brand && !productName.toLowerCase().includes(brand.toLowerCase())
      ? `${productName} (${brand})`
      : productName;

  const barcode =
    typeof product.code === 'string' && product.code.trim()
      ? product.code.trim()
      : rawBarcode.trim();

  return {
    ok: true,
    food: {
      name: fullName,
      brand,
      barcode,
      servingLabel: '100g',
      servingGrams: 100,
      calories: caloriesPer100,
      protein: round1(Math.max(0, proteinRaw ?? 0)),
      carbs: round1(Math.max(0, carbsRaw ?? 0)),
      fat: round1(Math.max(0, fatRaw ?? 0)),
      fiber: fiberRaw !== null ? round1(Math.max(0, fiberRaw)) : null,
      source: 'Open Food Facts',
      sourceId: `OFF-${barcode}`,
    },
  };
}

export async function fetchOpenFoodFactsByBarcode(
  rawBarcode: string
): Promise<OpenFoodFactsResult> {
  const cleanBarcode = rawBarcode.replace(/[\s-]/g, '').trim();
  if (!/^\d{8,14}$/.test(cleanBarcode)) {
    return {
      ok: false,
      error: 'Informe um código de barras válido (8 a 14 dígitos).',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
      cleanBarcode
    )}.json?fields=code,product_name,brands,nutriments,serving_size,serving_quantity`;

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          ok: false,
          error: 'Produto não encontrado no Open Food Facts. Cadastre manualmente pelo rótulo.',
        };
      }
      return {
        ok: false,
        error: `Falha ao consultar Open Food Facts (HTTP ${response.status}).`,
      };
    }

    const json: unknown = await response.json();
    return parseOpenFoodFactsProduct(json, cleanBarcode);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        ok: false,
        error: 'Tempo esgotado na consulta ao Open Food Facts. Tente novamente ou cadastre manualmente.',
      };
    }
    return {
      ok: false,
      error: 'Sem conexão para consultar o Open Food Facts. Você pode cadastrar pelo rótulo.',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
