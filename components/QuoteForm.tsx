import React, { useState } from 'react';

interface QuoteFormProps {
  onGenerate: (prompt: string, budget: number) => void;
  isLoading: boolean;
}

const presets = [
    { name: '사무용', budget: 800000, prompt: '주로 문서 작업(한글, 오피스), 웹 서핑, 유튜브 시청 등 일상적인 용도로 사용할 안정적이고 빠른 사무용 PC를 원합니다.' },
    { name: '게이밍', budget: 2500000, prompt: '최신 고사양 게임(배틀그라운드, 사이버펑크 2077)을 QHD 해상도에서 높은 프레임으로 부드럽게 플레이하고 싶습니다. 화려한 RGB 디자인도 선호합니다.' },
    { name: '영상 편집용', budget: 3500000, prompt: '4K 영상 편집(프리미어 프로, 다빈치 리졸브) 및 3D 렌더링 작업을 주로 합니다. 빠른 처리 속도와 안정성이 가장 중요합니다. 넉넉한 저장 공간이 필요합니다.' },
];


export const QuoteForm: React.FC<QuoteFormProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('최신 고사양 게임(배틀그라운드, 오버워치)을 4K 해상도에서 부드럽게 플레이하고 싶습니다.');
  const [budget, setBudget] = useState(2500000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, budget);
    }
  };
  
  const handlePresetClick = (preset: typeof presets[0]) => {
    setPrompt(preset.prompt);
    setBudget(preset.budget);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-2xl">
      <form onSubmit={handleSubmit}>

        <div className="mb-6">
            <label className="block text-lg font-semibold mb-2 text-text-primary">
                추천 견적 프리셋
            </label>
            <div className="flex flex-wrap gap-2">
                {presets.map(preset => (
                    <button
                        key={preset.name}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        className="px-4 py-2 bg-secondary text-text-primary rounded-lg hover:bg-secondary-hover transition-colors duration-200"
                    >
                        {preset.name}
                    </button>
                ))}
            </div>
        </div>


        <div className="mb-6">
          <label htmlFor="prompt" className="block text-lg font-semibold mb-2 text-text-primary">
            1. PC의 용도를 알려주세요.
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-24 p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 resize-none"
            placeholder="예: 4K 영상 편집 및 고사양 게임용 PC"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="budget" className="block text-lg font-semibold mb-2 text-text-primary">
            2. 예산을 설정해주세요.
          </label>
          <div className="flex items-center gap-4">
            <input
              id="budget"
              type="range"
              min="500000"
              max="5000000"
              step="100000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-xl font-bold text-primary w-40 text-right">{formatCurrency(budget)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all duration-300 ease-in-out disabled:bg-secondary disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? 'AI가 견적을 생성중입니다...' : '나만의 PC 견적 생성하기'}
        </button>
      </form>
    </div>
  );
};