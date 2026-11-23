import { describe, expect, it } from 'vitest';
import { INITIAL_FOODS } from '../src/data/foodCatalog';
import { FOOD_CATEGORIES, FOOD_SOURCES, type FoodItem } from '../src/db/types';
import { filterAndRankFoods, normalizeSearchText } from '../src/utils/foodSearch';
import {
  calculatePer100,
  calculateScaledFiber,
  computeRecipeNutrition,
} from '../src/utils/nutritionMath';
import { parseOpenFoodFactsProduct } from '../src/utils/openFoodFacts';

const ORIGINAL_20_IDS = [
  'fd-frango',
  'fd-arroz',
  'fd-feijao',
  'fd-ovo',
  'fd-aveia',
  'fd-banana',
  'fd-batata-doce',
  'fd-patinho',
  'fd-tilapia',
  'fd-pao-integral',
  'fd-azeite',
  'fd-whey',
  'fd-iogurte',
  'fd-leite-desnatado',
  'fd-pasta-amendoim',
  'fd-queijo-minas',
  'fd-brocolis',
  'fd-maca',
  'fd-tapioca',
  'fd-salmao',
];

describe('Catálogo nutricional BR & Rio Grande do Sul', () => {
  it('mantém integridade, IDs únicos e todos os 20 IDs originais preservados', () => {
    expect(INITIAL_FOODS.length).toBeGreaterThanOrEqual(115);

    const ids = INITIAL_FOODS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const origId of ORIGINAL_20_IDS) {
      expect(ids).toContain(origId);
    }

    for (const food of INITIAL_FOODS) {
      expect(food.servingGrams).toBeGreaterThan(0);
      expect(food.calories).toBeGreaterThanOrEqual(0);
      expect(food.protein).toBeGreaterThanOrEqual(0);
      expect(food.carbs).toBeGreaterThanOrEqual(0);
      expect(food.fat).toBeGreaterThanOrEqual(0);
      expect(FOOD_CATEGORIES).toContain(food.category);
      expect(FOOD_SOURCES).toContain(food.source);
    }
  });

  it('inclui itens típicos e regionais do Rio Grande do Sul', () => {
    const regionalIds = INITIAL_FOODS.filter((f) => f.isRegionalRS).map((f) => f.id);
    expect(regionalIds).toEqual(
      expect.arrayContaining([
        'fd-cacetinho',
        'fd-arroz-carreteiro',
        'fd-pinhao-cozido',
        'fd-polenta-cozida',
        'fd-cuca-tradicional',
        'fd-queijo-colonial',
        'fd-nata-gaucha',
        'fd-chimarrao',
        'fd-bergamota',
        'fd-aipim-cozido',
        'fd-feijao-preto',
        'fd-costela-assada',
        'fd-vazio-fraldinha',
        'fd-salsichao-linguica',
        'fd-radite',
        'fd-maionese-batata',
        'fd-sagu-vinho',
        'fd-xis-salada',
      ])
    );
  });

  it('separa corretamente alimentos crus e cozidos/grelhados', () => {
    const byId = new Map(INITIAL_FOODS.map((f) => [f.id, f]));

    const arrozCru = calculatePer100(byId.get('fd-arroz-cru')!);
    const arrozCozido = calculatePer100(byId.get('fd-arroz')!);
    expect(arrozCru.calories).toBeGreaterThan(arrozCozido.calories);

    const feijaoCru = calculatePer100(byId.get('fd-feijao-preto-cru')!);
    const feijaoCozido = calculatePer100(byId.get('fd-feijao-preto')!);
    expect(feijaoCru.calories).toBeGreaterThan(feijaoCozido.calories);

    const massaCrua = calculatePer100(byId.get('fd-massa-crua')!);
    const massaCozida = calculatePer100(byId.get('fd-massa-cozida')!);
    expect(massaCrua.calories).toBeGreaterThan(massaCozida.calories);

    const frangoCru = calculatePer100(byId.get('fd-frango-cru')!);
    const frangoGrelhado = calculatePer100(byId.get('fd-frango')!);
    expect(frangoGrelhado.protein).toBeGreaterThan(frangoCru.protein);
  });

  it('busca sem acentos e encontra sinônimos regionais do RS', () => {
    expect(normalizeSearchText('Pinhão Gaúcho')).toBe('pinhao gaucho');

    const paoFrances = filterAndRankFoods(INITIAL_FOODS, { query: 'pao frances' });
    expect(paoFrances.some((f) => f.id === 'fd-cacetinho')).toBe(true);

    const mandioca = filterAndRankFoods(INITIAL_FOODS, { query: 'mandioca' });
    expect(mandioca.some((f) => f.id === 'fd-aipim-cozido')).toBe(true);

    const tangerina = filterAndRankFoods(INITIAL_FOODS, { query: 'tangerina' });
    expect(tangerina.some((f) => f.id === 'fd-bergamota')).toBe(true);

    const guisado = filterAndRankFoods(INITIAL_FOODS, { query: 'carne moida' });
    expect(guisado.some((f) => f.id === 'fd-guisado-patinho')).toBe(true);

    const chimarrao = filterAndRankFoods(INITIAL_FOODS, { query: 'chimarrao' });
    expect(chimarrao[0]?.id).toBe('fd-chimarrao');

    const pinhao = filterAndRankFoods(INITIAL_FOODS, { query: 'pinhao' });
    expect(pinhao.some((f) => f.id === 'fd-pinhao-cozido')).toBe(true);

    const rsOnly = filterAndRankFoods(INITIAL_FOODS, { category: 'rs' });
    expect(rsOnly.length).toBeGreaterThanOrEqual(20);
    expect(rsOnly.every((f) => f.isRegionalRS)).toBe(true);

    const customRecipe: FoodItem = {
      id: 'fd-rec-teste',
      name: 'Entrevero Caseiro',
      servingLabel: '1 porção (250g)',
      servingGrams: 250,
      calories: 410,
      protein: 32,
      carbs: 28,
      fat: 18,
      isRecipe: true,
      createdAt: '2026-11-23T10:00:00.000Z',
    };
    const recipesOnly = filterAndRankFoods([...INITIAL_FOODS, customRecipe], {
      category: 'recipes',
    });
    expect(recipesOnly.map((f) => f.id)).toEqual(['fd-rec-teste']);
  });
});

describe('Fibras desconhecidas, cálculo por 100g e receitas próprias', () => {
  it('mantém fibra ausente como null (nunca converte em zero)', () => {
    expect(
      calculateScaledFiber({ servingGrams: 100, fiber: null }, 'grams', 150)
    ).toBeNull();
    expect(
      calculateScaledFiber({ servingGrams: 100, fiber: undefined }, 'servings', 2)
    ).toBeNull();
    expect(
      calculateScaledFiber({ servingGrams: 100, fiber: 0 }, 'grams', 150)
    ).toBe(0);
    expect(
      calculateScaledFiber({ servingGrams: 50, fiber: 2.3 }, 'grams', 100)
    ).toBe(4.6);
  });

  it('calcula receita própria com ajuste de rendimento (perda/ganho de água)', () => {
    const summary = computeRecipeNutrition(
      [
        {
          foodId: 'fd-arroz',
          foodName: 'Arroz Branco Cozido',
          grams: 400,
          calories: 512,
          protein: 10,
          carbs: 112,
          fat: 0.8,
          fiber: 6.4,
        },
        {
          foodId: 'fd-feijao-preto',
          foodName: 'Feijão Preto Cozido',
          grams: 200,
          calories: 154,
          protein: 9,
          carbs: 28,
          fat: 1,
          fiber: 16.8,
        },
      ],
      500, // redução de água após preparo (peso total cru/prévio = 600g)
      250 // 1 porção de 250g (metade do rendimento)
    );

    expect(summary.totalGrams).toBe(600);
    expect(summary.effectiveYieldGrams).toBe(500);
    expect(summary.calories).toBe(333);
    expect(summary.protein).toBe(9.5);
    expect(summary.carbs).toBe(70);
    expect(summary.fat).toBe(0.9);
    expect(summary.fiber).toBe(11.6);
  });

  it('preserva fibra como null na receita quando algum ingrediente não informa fibra', () => {
    const summary = computeRecipeNutrition(
      [
        {
          foodId: 'fd-arroz',
          foodName: 'Arroz',
          grams: 200,
          calories: 256,
          protein: 5,
          carbs: 56,
          fat: 0.4,
          fiber: 3.2,
        },
        {
          foodId: 'fd-charque-cozido',
          foodName: 'Charque',
          grams: 100,
          calories: 263,
          protein: 36.4,
          carbs: 0,
          fat: 11.9,
          fiber: null,
        },
      ],
      300,
      150
    );

    expect(summary.calories).toBe(260);
    expect(summary.fiber).toBeNull();
  });
});

describe('Parser do Open Food Facts', () => {
  it('extrai macros por 100g e mantém fibra ausente como null', () => {
    const res = parseOpenFoodFactsProduct(
      {
        status: 1,
        product: {
          code: '7891000100103',
          product_name: 'Iogurte Natural',
          brands: 'Cooperativa Gaúcha',
          nutriments: {
            'energy-kcal_100g': 64,
            proteins_100g: 3.6,
            carbohydrates_100g: 4.8,
            fat_100g: 3.3,
          },
        },
      },
      '7891000100103'
    );

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.food.name).toBe('Iogurte Natural (Cooperativa Gaúcha)');
    expect(res.food.calories).toBe(64);
    expect(res.food.protein).toBe(3.6);
    expect(res.food.carbs).toBe(4.8);
    expect(res.food.fat).toBe(3.3);
    expect(res.food.fiber).toBeNull();
    expect(res.food.source).toBe('Open Food Facts');
  });

  it('converte kJ para kcal quando energy-kcal_100g está ausente e trata produto não encontrado', () => {
    const kjRes = parseOpenFoodFactsProduct(
      {
        status: 1,
        product: {
          code: '12345678',
          product_name: 'Queijo Colonial Embalado',
          nutriments: {
            'energy-kj_100g': 1400,
            proteins_100g: 23,
            carbohydrates_100g: 1.5,
            fat_100g: 26,
            fiber_100g: 0,
          },
        },
      },
      '12345678'
    );

    expect(kjRes.ok).toBe(true);
    if (kjRes.ok) {
      expect(kjRes.food.calories).toBe(Math.round(1400 / 4.184));
      expect(kjRes.food.fiber).toBe(0);
    }

    const notFound = parseOpenFoodFactsProduct({ status: 0 }, '00000000');
    expect(notFound.ok).toBe(false);
  });
});
