
import { useState } from "react";
import { NumerologyCalculator } from "@/components/NumerologyCalculator";
import { Calendar } from "@/components/Calendar";

const Index = () => {
  const [lifePathNumber, setLifePathNumber] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl md:text-5xl text-center font-display font-medium mb-8">
          Numerology Calendar
        </h1>
        <NumerologyCalculator onCalculate={setLifePathNumber} />
        <Calendar lifePathNumber={lifePathNumber} />
      </div>
    </div>
  );
};

export default Index;
