
import { useState } from "react";
import { NumerologyCalculator } from "@/components/NumerologyCalculator";
import { Calendar } from "@/components/Calendar";

const Index = () => {
  const [lifePathNumber, setLifePathNumber] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <h1 className="text-4xl md:text-6xl text-center font-display font-medium text-foreground/90">
          Numerology Calendar
        </h1>
        <div className="grid gap-12 md:gap-16">
          <NumerologyCalculator onCalculate={setLifePathNumber} />
          <Calendar lifePathNumber={lifePathNumber} />
        </div>
      </div>
    </div>
  );
};

export default Index;
