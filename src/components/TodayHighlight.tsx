import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar as CalendarIcon, TrendingUp, Moon, Sun } from "lucide-react";
import { AstrologyTimeline } from "./calendar/AstrologyTimeline";
import { PlanetaryAlignment } from "./calendar/PlanetaryAlignment";
import { NumerologyInsights } from "./calendar/NumerologyInsights";
import { cn } from "@/lib/utils";

interface TodayHighlightProps {
  calendarType: "numerology" | "astrology";
  lifePathNumber: number | null;
}

export const TodayHighlight = ({ calendarType, lifePathNumber }: TodayHighlightProps) => {
  const [todayData, setTodayData] = useState<any>(null);
  const [showFullDetails, setShowFullDetails] = useState(false);

  const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const chineseSigns = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];

  const getZodiacColor = (sign: string) => {
    const colors: Record<string, string> = {
      "Aries": "from-red-500 to-orange-500",
      "Taurus": "from-green-500 to-emerald-500",
      "Gemini": "from-yellow-500 to-amber-500",
      "Cancer": "from-blue-500 to-cyan-500",
      "Leo": "from-orange-500 to-yellow-500",
      "Virgo": "from-emerald-500 to-green-500",
      "Libra": "from-pink-500 to-rose-500",
      "Scorpio": "from-purple-500 to-indigo-500",
      "Sagittarius": "from-indigo-500 to-purple-500",
      "Capricorn": "from-slate-500 to-gray-500",
      "Aquarius": "from-cyan-500 to-blue-500",
      "Pisces": "from-violet-500 to-purple-500"
    };
    return colors[sign] || "from-primary to-accent";
  };

  const getZodiacSymbol = (sign: string) => {
    const symbols: Record<string, string> = {
      "Aries": "♈", "Taurus": "♉", "Gemini": "♊", "Cancer": "♋",
      "Leo": "♌", "Virgo": "♍", "Libra": "♎", "Scorpio": "♏",
      "Sagittarius": "♐", "Capricorn": "♑", "Aquarius": "♒", "Pisces": "♓"
    };
    return symbols[sign] || "✦";
  };

  const getNumberColor = (num: number) => {
    const colors: Record<number, string> = {
      1: "from-red-500 to-orange-500",
      2: "from-orange-500 to-yellow-500",
      3: "from-yellow-500 to-amber-500",
      4: "from-green-500 to-emerald-500",
      5: "from-blue-500 to-cyan-500",
      6: "from-indigo-500 to-purple-500",
      7: "from-purple-500 to-violet-500",
      8: "from-pink-500 to-rose-500",
      9: "from-rose-500 to-red-500",
      11: "from-cyan-500 to-blue-500",
      22: "from-emerald-500 to-green-500",
      33: "from-amber-500 to-yellow-500"
    };
    return colors[num] || colors[1];
  };

  useEffect(() => {
    const calculateTodayData = () => {
      const today = new Date();
      const date = today.getDate();
      const month = today.getMonth();
      const year = today.getFullYear();

      const sumDigits = (num: number) => {
        return num.toString().split("").reduce((acc, val) => acc + parseInt(val), 0);
      };

      // Numerology calculations
      const daySum = sumDigits(date);
      const monthSum = sumDigits(month + 1);
      const yearSum = sumDigits(year);
      let total = daySum + monthSum + yearSum;

      const primaryNumber = [11, 22, 33].includes(total) ? total : sumDigits(total);
      const secondaryNumber = total !== primaryNumber ? total : undefined;

      let personalNumber;
      if (lifePathNumber) {
        const personalTotal = (secondaryNumber || primaryNumber) + lifePathNumber;
        personalNumber = [11, 22, 33].includes(personalTotal) ? personalTotal : sumDigits(personalTotal);
      }

      // Astrology calculations
      const dayOfYear = Math.floor((today.getTime() - new Date(year, 0, 0).getTime()) / (24 * 60 * 60 * 1000));
      const zodiacIndex = Math.floor((dayOfYear - 80) / 30) % 12;
      const zodiacSign = zodiacSigns[zodiacIndex >= 0 ? zodiacIndex : zodiacIndex + 12];
      
      const chineseIndex = (year - 1900) % 12;
      const chineseSign = chineseSigns[chineseIndex >= 0 ? chineseIndex : chineseIndex + 12];
      
      const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
      const planetIndex = (dayOfYear + date) % planets.length;
      const planetaryInfluence = planets[planetIndex];

      // Moon phase
      const daysSinceNewMoon = ((today.getTime() / (24 * 60 * 60 * 1000)) % 29.53);
      const moonPhase = (daysSinceNewMoon / 29.53) * 100;

      setTodayData({
        date: today,
        primaryNumber,
        secondaryNumber,
        personalNumber,
        zodiacSign,
        chineseSign,
        planetaryInfluence,
        moonPhase
      });
    };

    calculateTodayData();
  }, [lifePathNumber]);

  if (!todayData) return null;

  const getMoonPhaseEmoji = (phase: number) => {
    if (phase < 6.25) return "🌑";
    if (phase < 18.75) return "🌒";
    if (phase < 31.25) return "🌓";
    if (phase < 43.75) return "🌔";
    if (phase < 56.25) return "🌕";
    if (phase < 68.75) return "🌖";
    if (phase < 81.25) return "🌗";
    if (phase < 93.75) return "🌘";
    return "🌑";
  };

  const getMoonPhaseName = (phase: number) => {
    if (phase < 6.25) return "New Moon";
    if (phase < 18.75) return "Waxing Crescent";
    if (phase < 31.25) return "First Quarter";
    if (phase < 43.75) return "Waxing Gibbous";
    if (phase < 56.25) return "Full Moon";
    if (phase < 68.75) return "Waning Gibbous";
    if (phase < 81.25) return "Last Quarter";
    if (phase < 93.75) return "Waning Crescent";
    return "New Moon";
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className={cn(
          "h-2 bg-gradient-to-r",
          calendarType === "numerology" 
            ? getNumberColor(todayData.primaryNumber)
            : getZodiacColor(todayData.zodiacSign)
        )} />
        
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {calendarType === "numerology" ? "Today's Numerology" : "Today's Astrology"}
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {todayData.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {calendarType === "numerology" ? (
            <>
              {/* Numerology Quick View */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="relative overflow-hidden rounded-lg border p-4 bg-gradient-to-br from-background to-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl",
                      getNumberColor(todayData.primaryNumber)
                    )}>
                      {todayData.primaryNumber}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Primary Number</div>
                      <div className="text-sm font-medium">
                        {[11, 22, 33].includes(todayData.primaryNumber) ? "Master Number" : "Core Energy"}
                      </div>
                    </div>
                  </div>
                </div>

                {todayData.personalNumber && (
                  <div className="relative overflow-hidden rounded-lg border p-4 bg-gradient-to-br from-background to-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl",
                        getNumberColor(todayData.personalNumber)
                      )}>
                        {todayData.personalNumber}
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Personal Number</div>
                        <div className="text-sm font-medium">Your Energy</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative overflow-hidden rounded-lg border p-4 bg-gradient-to-br from-background to-muted/30">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Energy Level</div>
                      <div className="text-sm font-medium">
                        {todayData.primaryNumber >= 7 ? "Introspective" : todayData.primaryNumber >= 4 ? "Balanced" : "Dynamic"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!showFullDetails && (
                <Button 
                  onClick={() => setShowFullDetails(true)}
                  variant="outline"
                  className="w-full"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Full Insights
                </Button>
              )}

              {showFullDetails && (
                <div className="pt-4 border-t">
                  <NumerologyInsights 
                    primaryNumber={todayData.primaryNumber}
                    personalNumber={todayData.personalNumber}
                  />
                  <Button 
                    onClick={() => setShowFullDetails(false)}
                    variant="ghost"
                    className="w-full mt-4"
                  >
                    Show Less
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Astrology Quick View */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="relative overflow-hidden rounded-lg border p-4 bg-gradient-to-br from-background to-muted/30">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={cn(
                      "w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-3xl",
                      getZodiacColor(todayData.zodiacSign)
                    )}>
                      {getZodiacSymbol(todayData.zodiacSign)}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Zodiac Sign</div>
                      <div className="text-sm font-medium">{todayData.zodiacSign}</div>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-lg border p-4 bg-gradient-to-br from-background to-muted/30">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="text-4xl">
                      {getMoonPhaseEmoji(todayData.moonPhase)}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Moon Phase</div>
                      <div className="text-sm font-medium">{getMoonPhaseName(todayData.moonPhase)}</div>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-lg border p-4 bg-gradient-to-br from-background to-muted/30">
                  <div className="flex flex-col items-center text-center gap-2">
                    <Sun className="h-12 w-12 text-orange-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">Planetary Hour</div>
                      <div className="text-sm font-medium">{todayData.planetaryInfluence}</div>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-lg border p-4 bg-gradient-to-br from-background to-muted/30">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="text-3xl">🐉</div>
                    <div>
                      <div className="text-xs text-muted-foreground">Chinese Sign</div>
                      <div className="text-sm font-medium">{todayData.chineseSign}</div>
                    </div>
                  </div>
                </div>
              </div>

              {!showFullDetails && (
                <Button 
                  onClick={() => setShowFullDetails(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  View Timeline & Planetary Alignment
                </Button>
              )}

              {showFullDetails && (
                <div className="pt-4 border-t space-y-6">
                  <AstrologyTimeline selectedDate={todayData.date} />
                  <PlanetaryAlignment date={todayData.date} />
                  <Button 
                    onClick={() => setShowFullDetails(false)}
                    variant="ghost"
                    className="w-full"
                  >
                    Show Less
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
