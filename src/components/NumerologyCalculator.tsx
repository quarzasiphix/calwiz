
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface NumerologyCalculatorProps {
  onCalculate: (lifePathNumber: number) => void;
}

export const NumerologyCalculator = ({ onCalculate }: NumerologyCalculatorProps) => {
  const [birthdate, setBirthdate] = useState("");
  const [manualNumber, setManualNumber] = useState("");
  const [displayedNumber, setDisplayedNumber] = useState<string>("N/A");

  const calculateLifePath = (date: string) => {
    const cleaned = date.replace(/\D/g, "");
    if (cleaned.length !== 8) return null;

    const day = parseInt(cleaned.substring(0, 2));
    const month = parseInt(cleaned.substring(2, 4));
    const year = parseInt(cleaned.substring(4));

    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    const sumDigits = (num: number) => {
      return num.toString().split("").reduce((acc, val) => acc + parseInt(val), 0);
    };

    const daySum = sumDigits(day);
    const monthSum = sumDigits(month);
    const yearSum = sumDigits(year);
    
    let total = daySum + monthSum + yearSum;
    
    // Reduce to single digit unless it's a master number
    while (total > 9 && ![11, 22, 33].includes(total)) {
      total = sumDigits(total);
    }
    
    return total;
  };

  const handleCalculate = () => {
    const number = calculateLifePath(birthdate);
    if (number) {
      setDisplayedNumber(number.toString());
      onCalculate(number);
    }
  };

  const handleManualInput = (value: string) => {
    setManualNumber(value);
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setDisplayedNumber(num.toString());
      onCalculate(num);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl text-center font-display">
          Calculate Your Life Path
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Enter your birthdate (DDMMYYYY)
            </label>
            <div className="flex gap-3">
              <Input
                placeholder="DDMMYYYY"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                maxLength={8}
                className="flex-1"
              />
              <Button onClick={handleCalculate} className="shrink-0">
                Calculate
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Enter Life Path Number directly
            </label>
            <Input
              type="number"
              placeholder="1-99"
              value={manualNumber}
              onChange={(e) => handleManualInput(e.target.value)}
              min={1}
              max={99}
            />
          </div>
        </div>

        <div className="pt-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Your Life Path Number</p>
          <p className={`text-3xl font-bold ${[11, 22, 33].includes(parseInt(displayedNumber)) ? "text-accent" : ""}`}>
            {displayedNumber}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
