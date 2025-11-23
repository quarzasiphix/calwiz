
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

interface NumerologyCalculatorProps {
  onCalculate: (lifePathNumber: number) => void;
  compact?: boolean;
}

const BIRTHDATE_STORAGE_KEY = "calwiz_birthdate";
const LIFE_PATH_STORAGE_KEY = "calwiz_life_path_number";

export const NumerologyCalculator = ({ onCalculate, compact = false }: NumerologyCalculatorProps) => {
  const [birthdate, setBirthdate] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Load saved birthdate and life path number on mount
  useEffect(() => {
    const savedBirthdate = localStorage.getItem(BIRTHDATE_STORAGE_KEY);
    const savedLifePath = localStorage.getItem(LIFE_PATH_STORAGE_KEY);
    
    if (savedBirthdate) {
      setBirthdate(savedBirthdate);
    }
    
    if (savedLifePath) {
      const lifePathNumber = parseInt(savedLifePath);
      setResult(lifePathNumber);
      onCalculate(lifePathNumber);
    }
  }, [onCalculate]);

  const masterNumbers = [11, 22, 33];

  const calculateLifePath = () => {
    setError("");
    
    if (!birthdate) {
      setError("Please enter your birthdate");
      return;
    }
    
    // Remove non-digits and check format
    const cleanBirthdate = birthdate.replace(/\D/g, "");
    if (cleanBirthdate.length !== 8) {
      setError("Please enter a valid date in format DD/MM/YYYY");
      return;
    }

    // Parse date components
    const day = parseInt(cleanBirthdate.substring(0, 2));
    const month = parseInt(cleanBirthdate.substring(2, 4));
    const year = parseInt(cleanBirthdate.substring(4));

    // Validate date components
    if (month < 1 || month > 12) {
      setError("Month must be between 1 and 12");
      return;
    }
    if (day < 1 || day > 31) {
      setError("Day must be between 1 and 31");
      return;
    }
    
    // Calculate life path number
    const daySum = sumDigits(day);
    const monthSum = sumDigits(month);
    const yearSum = sumDigits(year);
    
    let total = daySum + monthSum + yearSum;
    
    // Reduce the number unless it's a master number
    let lifePathNumber;
    if (masterNumbers.includes(total)) {
      lifePathNumber = total;
    } else {
      lifePathNumber = reduceToSingleDigit(total);
    }
    
    // Save to localStorage
    localStorage.setItem(BIRTHDATE_STORAGE_KEY, birthdate);
    localStorage.setItem(LIFE_PATH_STORAGE_KEY, lifePathNumber.toString());
    
    setResult(lifePathNumber);
    onCalculate(lifePathNumber);
  };

  const sumDigits = (num: number): number => {
    return num.toString().split("").reduce((acc, digit) => acc + parseInt(digit), 0);
  };

  const reduceToSingleDigit = (num: number): number => {
    while (num > 9) {
      if (masterNumbers.includes(num)) {
        return num;
      }
      num = sumDigits(num);
    }
    return num;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Auto-format the date as DD/MM/YYYY while typing
    let formatted = value.replace(/\D/g, "");
    
    if (formatted.length > 0) {
      if (formatted.length <= 2) {
        formatted = formatted;
      } else if (formatted.length <= 4) {
        formatted = `${formatted.substring(0, 2)}/${formatted.substring(2)}`;
      } else {
        formatted = `${formatted.substring(0, 2)}/${formatted.substring(2, 4)}/${formatted.substring(4, 8)}`;
      }
    }
    
    setBirthdate(formatted);
    setError("");
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="text"
            value={birthdate}
            onChange={handleInputChange}
            placeholder="DD/MM/YYYY"
            className="text-sm"
          />
          <Button size="sm" onClick={calculateLifePath}>Calculate</Button>
        </div>
        {result !== null && (
          <div className="bg-primary/10 text-center p-2 rounded-md">
            <span className="text-sm font-medium">
              Life Path Number: <span className={masterNumbers.includes(result) ? "text-accent font-bold" : ""}>{result}</span>
            </span>
          </div>
        )}
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
    );
  }

  return (
    <Card className="shadow-md animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-display">
          <Calendar className="h-6 w-6 text-primary" />
          <span>Calculate Your Life Path Number</span>
        </CardTitle>
        <CardDescription>
          Enter your birthdate to discover your life path number and see how it influences each day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="birthdate">Your Birthdate</Label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  id="birthdate"
                  type="text"
                  value={birthdate}
                  onChange={handleInputChange}
                  placeholder="DD/MM/YYYY"
                />
                {error && <p className="text-destructive text-sm mt-1">{error}</p>}
              </div>
              <Button onClick={calculateLifePath} className="w-full sm:w-auto">
                Calculate Life Path
              </Button>
            </div>
          </div>
          
          {result !== null && (
            <div className="bg-primary/10 p-4 rounded-lg text-center animate-fade-in transition-all">
              <p className="text-sm text-muted-foreground">Your Life Path Number</p>
              <p className={`text-4xl font-bold mt-1 ${masterNumbers.includes(result) ? "text-accent" : ""}`}>
                {result}
              </p>
              <p className="mt-2 text-sm">
                {masterNumbers.includes(result) ? 
                  "This is a Master Number with special significance!" : 
                  "This number represents your life's purpose and journey."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
