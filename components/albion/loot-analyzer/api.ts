import { GoogleGenAI } from '@google/genai';
import { matchItemName } from '@/lib/albion/item-matcher';
import { ExtractedItem, ItemCategory } from './constants';

export async function extractItemsFromImages(files: File[], apiKey: string): Promise<ExtractedItem[]> {
  const ai = new GoogleGenAI({ apiKey });

  const parts = await Promise.all(
    files.map(async (file) => {
      const buffer = await file.arrayBuffer();
      return {
        inlineData: {
          data: Buffer.from(buffer).toString('base64'),
          mimeType: file.type,
        },
      };
    })
  );

  const extractionPrompt = `
Você é um especialista em OCR de Albion Online. Analise TODAS as imagens enviadas e extraia CADA item visível.

REGRAS DE LEITURA:
- O nome do item aparece como "NxX T[Tier].[Enc] Nome". Exemplo: "1x T6.1 Arco Longo do Mestre" = tier 6, enchantment 1.
- Se o encantamento não aparecer (ex: "T6.0" ou só "T6"), o enchantment é 0.
- NÃO pule nenhum item, incluindo materiais como Runas, Almas e Relíquias.

CATEGORIAS (escolha a mais adequada para cada item):
- ARMA_2H: cajados, arcos longos, foices, alabardas, espadões, machados duplos, maças pesadas, lanças de batalha
- ARMA_1H: espadas, adagas, machadinhas, tochas, orbes, escudos, focos
- ARMADURA: armadura de peito / robe / gibão
- ELMO: elmo, capuz, casaco (para a cabeça)
- BOTAS: botas, sandálias, sapatos
- LUVAS: luvas
- BOLSA: bolsa, sacola
- CAPA: capa
- RUNA: qualquer item chamado "Runa" (T4–T8)
- ALMA: qualquer item chamado "Alma" (T4–T8)
- RELIQUIA: qualquer item chamado "Relíquia" (T4–T8)
- OUTRO: o que não se encaixar

Retorne EXCLUSIVAMENTE um JSON array válido, sem markdown, no formato:
[
  {
    "name": "Nome completo em Português",
    "quantity": 1,
    "tier": 6,
    "enchantment": 1,
    "category": "ARMA_2H"
  }
]
  `.trim();

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [
      {
        role: 'user',
        parts: [...parts, { text: extractionPrompt }],
      },
    ],
    config: { temperature: 0.1 },
  });

  const text = response.text || '[]';
  let parsed: any[] = [];
  try {
    const clean = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('A IA não retornou um formato válido. Tente novamente.');
  }

  const items: ExtractedItem[] = parsed.map((p: any) => {
    const tier        = p.tier       ?? 6;
    const enchantment = p.enchantment ?? 0;
    const category    = (p.category as ItemCategory) ?? 'OUTRO';

    let exactId = matchItemName(p.name) ?? null;
    if (exactId) {
      exactId = exactId.split('@')[0];
      if (enchantment > 0) {
        exactId = `${exactId}@${enchantment}`;
      }
    }

    return { name: p.name, quantity: p.quantity || 1, exactId, tier, enchantment, category };
  });

  return items;
}
