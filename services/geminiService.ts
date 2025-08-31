import { GoogleGenAI, Type } from "@google/genai";
import type { PCBuild, AllComponents, OS } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        cpu: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, manufacturer: { type: Type.STRING }, name: { type: Type.STRING }, price: { type: Type.INTEGER }, score: { type: Type.INTEGER }, socket: { type: Type.STRING }, tdp: { type: Type.INTEGER }, advantage: { type: Type.STRING, description: "이 부품을 선택한 이유와 장점을 50자 내외의 한글로 요약 설명합니다." } } },
        motherboard: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, manufacturer: { type: Type.STRING }, name: { type: Type.STRING }, price: { type: Type.INTEGER }, socket: { type: Type.STRING }, memoryType: { type: Type.STRING }, formFactor: { type: Type.STRING }, advantage: { type: Type.STRING, description: "이 부품을 선택한 이유와 장점을 50자 내외의 한글로 요약 설명합니다." } } },
        memory: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, manufacturer: { type: Type.STRING }, name: { type: Type.STRING }, price: { type: Type.INTEGER }, type: { type: Type.STRING }, capacity: { type: Type.INTEGER }, advantage: { type: Type.STRING, description: "이 부품을 선택한 이유와 장점을 50자 내외의 한글로 요약 설명합니다." } } },
        graphicsCard: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, manufacturer: { type: Type.STRING }, name: { type: Type.STRING }, price: { type: Type.INTEGER }, score: { type: Type.INTEGER }, length: { type: Type.INTEGER }, tdp: { type: Type.INTEGER }, advantage: { type: Type.STRING, description: "이 부품을 선택한 이유와 장점을 50자 내외의 한글로 요약 설명합니다." } } },
        ssd: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, manufacturer: { type: Type.STRING }, name: { type: Type.STRING }, price: { type: Type.INTEGER }, capacity: { type: Type.INTEGER }, advantage: { type: Type.STRING, description: "이 부품을 선택한 이유와 장점을 50자 내외의 한글로 요약 설명합니다." } } },
        pcCase: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, manufacturer: { type: Type.STRING }, name: { type: Type.STRING }, price: { type: Type.INTEGER }, formFactor: { type: Type.ARRAY, items: { type: Type.STRING } }, maxGpuLength: { type: Type.INTEGER }, advantage: { type: Type.STRING, description: "이 부품을 선택한 이유와 장점을 50자 내외의 한글로 요약 설명합니다." } } },
        powerSupply: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, manufacturer: { type: Type.STRING }, name: { type: Type.STRING }, price: { type: Type.INTEGER }, wattage: { type: Type.INTEGER }, advantage: { type: Type.STRING, description: "이 부품을 선택한 이유와 장점을 50자 내외의 한글로 요약 설명합니다." } } },
        cpuCooler: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, manufacturer: { type: Type.STRING }, name: { type: Type.STRING }, price: { type: Type.INTEGER }, supportedSockets: { type: Type.ARRAY, items: { type: Type.STRING } }, advantage: { type: Type.STRING, description: "이 부품을 선택한 이유와 장점을 50자 내외의 한글로 요약 설명합니다." } } },
        os: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, productName: { type: Type.STRING }, price: { type: Type.INTEGER }, advantage: { type: Type.STRING, description: "이 부품을 선택한 이유와 장점을 50자 내외의 한글로 요약 설명합니다." } } },
        totalPrice: { type: Type.INTEGER, description: "모든 부품 가격의 합계" },
        totalScore: { type: Type.INTEGER, description: "CPU 점수와 그래픽카드 점수의 합계" },
        reasoning: { type: Type.STRING, description: "이 견적을 추천하는 이유에 대한 한글 설명" }
    }
};

const buildPrompt = (userPrompt: string, budget: number, components: AllComponents): string => {
  return `
    당신은 세계 최고의 PC 조립 전문가입니다. 사용자의 요구사항과 예산에 맞춰, 주어진 부품 목록 내에서 최적의 PC 견적을 생성해야 합니다.

    **사용자 요구사항:** "${userPrompt}"
    **최대 예산:** ${budget.toLocaleString()}원

    **규칙:**
    1.  반드시 아래 제공된 부품 목록에서만 각 카테고리별로 **하나씩** 부품을 선택해야 합니다.
    2.  모든 부품은 서로 호환되어야 합니다. 아래 호환성 규칙을 반드시 준수하세요.
    3.  총 가격은 사용자의 최대 예산을 초과해서는 안 됩니다. 예산 내에서 최고의 성능을 내는 조합을 찾아야 합니다.
    4.  각 부품을 선택한 이유를 'advantage' 필드에 50자 내외의 한글로 요약하여 포함해야 합니다. 이 설명은 사용자에게 부품의 장점을 명확하게 전달해야 합니다.
    5.  최종 결과는 반드시 지정된 JSON 형식으로만 응답해야 합니다. 다른 설명은 추가하지 마세요.

    **호환성 규칙:**
    *   CPU의 'socket'은 메인보드의 'socket'과 정확히 일치해야 합니다. (예: 'LGA1700' CPU는 'LGA1700' 메인보드에만 장착 가능)
    *   메모리의 'type'은 메인보드의 'memoryType'과 정확히 일치해야 합니다. (예: 'DDR5' 메인보드에는 'DDR5' 메모리만 사용 가능)
    *   메인보드의 'formFactor'는 케이스의 'formFactor' 목록에 포함되어야 합니다. (예: 'M-ATX' 메인보드는 'M-ATX' 또는 'ATX' 케이스에 장착 가능)
    *   그래픽카드의 'length'는 케이스의 'maxGpuLength'보다 작거나 같아야 합니다.
    *   CPU 쿨러의 'supportedSockets' 목록에는 선택된 CPU의 'socket'이 포함되어야 합니다.
    *   파워 서플라이의 'wattage'는 (CPU TDP + 그래픽카드 TDP + 100W) 보다 최소 1.5배 이상이어야 안전합니다. (계산식: wattage >= (CPU.tdp + GPU.tdp + 100) * 1.5)

    **사용 가능한 부품 목록:**
    CPUs: ${JSON.stringify(components.CPUS, null, 2)}
    Motherboards: ${JSON.stringify(components.MOTHERBOARDS, null, 2)}
    Memory: ${JSON.stringify(components.MEMORIES, null, 2)}
    Graphics Cards: ${JSON.stringify(components.GRAPHICS_CARDS, null, 2)}
    SSDs: ${JSON.stringify(components.SSDS, null, 2)}
    Cases: ${JSON.stringify(components.CASES, null, 2)}
    Power Supplies: ${JSON.stringify(components.POWER_SUPPLIES, null, 2)}
    CPU Coolers: ${JSON.stringify(components.CPU_COOLERS, null, 2)}
    OS: ${JSON.stringify(components.OS, null, 2)}

    이제 위의 규칙과 부품 목록을 바탕으로 사용자 요구사항에 맞는 최적의 PC 견적을 JSON 형식으로 생성해주세요.
    `;
};


export const generatePCQuote = async (userPrompt: string, budget: number, components: AllComponents): Promise<PCBuild> => {
  const prompt = buildPrompt(userPrompt, budget, components);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    }
  });

  try {
    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    return parsed as PCBuild;
  } catch(e) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("AI가 생성한 응답을 분석하는 데 실패했습니다.");
  }
};