
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Star, Plane, CalendarDays } from "lucide-react";
import { AstrologyTimeline } from "./AstrologyTimeline";
import { PlanetaryAlignment } from "./PlanetaryAlignment";
import { NumerologyInsights } from "./NumerologyInsights";
import { AI_CONFIG } from "@/config/ai.config";

interface DayData {
  date: number;
  primaryNumber: number;
  secondaryNumber?: number;
  personalNumber?: number;
  isToday: boolean;
  zodiacSign?: string;
  chineseSign?: string;
  planetaryInfluence?: string;
}

interface DayDetailProps {
  day: DayData;
  calendarType: "numerology" | "astrology";
  onClose?: (close: boolean) => void;
}

export const DayDetail = ({ day, calendarType, onClose }: DayDetailProps) => {
  const currentDate = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const [showAiResponse, setShowAiResponse] = React.useState(false);
  const [aiResponse, setAiResponse] = React.useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = React.useState(false);
  const [aiError, setAiError] = React.useState<string>("");
  
  // Create a date object for the selected day
  const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date);

  const handleAskAi = async () => {
    setShowAiResponse(true);
    setIsLoadingAi(true);
    setAiError("");
    setAiResponse("");

    try {
      // Prepare the data payload
      const payload = {
        type: calendarType,
        date: selectedDate.toISOString().split('T')[0],
        data: calendarType === "numerology" 
          ? {
              primaryNumber: day.primaryNumber,
              secondaryNumber: day.secondaryNumber || null,
              personalNumber: day.personalNumber || null,
              lifePathNumber: null // This would come from context if available
            }
          : {
              zodiacSign: day.zodiacSign,
              chineseSign: day.chineseSign,
              planetaryInfluence: day.planetaryInfluence,
              moonPhase: 0, // Would be calculated
              sunPosition: 0, // Would be calculated
              planetaryPositions: [], // Would be calculated
              aspects: []
            },
        userQuestion: null
      };

      // Check if demo mode is enabled or webhook is not configured
      if (AI_CONFIG.demoMode || AI_CONFIG.webhookUrl === "YOUR_N8N_WEBHOOK_URL_HERE") {
        // Use demo response
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        setAiResponse(getDemoResponse());
        return;
      }

      const response = await fetch(AI_CONFIG.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(AI_CONFIG.timeout),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.text();
      setAiResponse(data);
    } catch (error) {
      console.error("AI request error:", error);
      setAiError("Unable to connect to AI service. Using demo response.");
      // Fallback demo response
      setAiResponse(getDemoResponse());
    } finally {
      setIsLoadingAi(false);
    }
  };

  const getDemoResponse = () => {
    if (calendarType === "numerology") {
      return `Today's energy resonates with the number ${day.primaryNumber}, bringing ${
        day.primaryNumber <= 3 ? "dynamic and creative" : 
        day.primaryNumber <= 6 ? "balanced and nurturing" : 
        "introspective and spiritual"
      } vibrations. This is an excellent time to focus on ${
        day.primaryNumber === 1 ? "new beginnings and leadership" :
        day.primaryNumber === 2 ? "partnerships and cooperation" :
        day.primaryNumber === 3 ? "creative expression and communication" :
        day.primaryNumber === 4 ? "building foundations and organization" :
        day.primaryNumber === 5 ? "change and adventure" :
        day.primaryNumber === 6 ? "love and responsibility" :
        day.primaryNumber === 7 ? "spiritual insight and analysis" :
        day.primaryNumber === 8 ? "power and material success" :
        "completion and wisdom"
      }. ${day.personalNumber ? `Your personal number ${day.personalNumber} amplifies this energy, creating a unique opportunity for growth.` : ""} Trust your intuition and embrace the day's potential.`;
    } else {
      return `With the Sun in ${day.zodiacSign} and ${day.planetaryInfluence} as the dominant planetary influence, today's cosmic weather invites ${
        day.zodiacSign === "Aries" ? "bold action and pioneering spirit" :
        day.zodiacSign === "Taurus" ? "grounding and sensual pleasures" :
        day.zodiacSign === "Gemini" ? "communication and intellectual curiosity" :
        day.zodiacSign === "Cancer" ? "emotional depth and nurturing" :
        day.zodiacSign === "Leo" ? "creative expression and confidence" :
        day.zodiacSign === "Virgo" ? "practical service and attention to detail" :
        day.zodiacSign === "Libra" ? "harmony and balanced relationships" :
        day.zodiacSign === "Scorpio" ? "transformation and deep insight" :
        day.zodiacSign === "Sagittarius" ? "adventure and philosophical exploration" :
        day.zodiacSign === "Capricorn" ? "ambition and structured progress" :
        day.zodiacSign === "Aquarius" ? "innovation and humanitarian focus" :
        "spiritual connection and creative flow"
      }. The ${day.chineseSign} energy adds a layer of ${
        ["Rat", "Dragon", "Monkey"].includes(day.chineseSign || "") ? "cleverness and adaptability" :
        ["Ox", "Snake", "Rooster"].includes(day.chineseSign || "") ? "determination and wisdom" :
        "compassion and loyalty"
      }. This is a favorable time for both personal reflection and social connection.`;
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="text-center sm:text-left mb-4">
        <h2 className="text-xl font-semibold flex items-center justify-center sm:justify-start gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          {monthNames[currentDate.getMonth()]} {day.date}, {currentDate.getFullYear()}
          {day.isToday && <span className="ml-2 text-primary">(Today)</span>}
        </h2>
      </div>

      {calendarType === "numerology" ? (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg border bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Star className="h-5 w-5 mr-2 text-primary" />
                Numerological Influences
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-muted-foreground">Primary Number</div>
                  <div className="text-lg font-semibold mt-1">{day.primaryNumber}</div>
                </div>
                
                {day.secondaryNumber && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-muted-foreground">Secondary Number</div>
                    <div className="text-lg font-semibold mt-1">{day.secondaryNumber}</div>
                  </div>
                )}
                
                {day.personalNumber && (
                  <div className="p-3 bg-muted/50 rounded-lg sm:col-span-2">
                    <div className="text-muted-foreground">Personal Number</div>
                    <div className="text-lg font-semibold mt-1">{day.personalNumber}</div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="mt-4">
            <NumerologyInsights 
              primaryNumber={day.primaryNumber}
              personalNumber={day.personalNumber}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="alignment">Alignment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg border bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Plane className="h-5 w-5 mr-2 text-primary" />
                Astrological Influences
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-muted-foreground">Zodiac Sign</div>
                  <div className="text-lg font-semibold mt-1">{day.zodiacSign}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-muted-foreground">Chinese Sign</div>
                  <div className="text-lg font-semibold mt-1">{day.chineseSign}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg sm:col-span-2">
                  <div className="text-muted-foreground">Planetary Influence</div>
                  <div className="text-lg font-semibold mt-1">{day.planetaryInfluence}</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-4">
            <AstrologyTimeline selectedDate={selectedDate} />
          </TabsContent>
          
          <TabsContent value="alignment" className="mt-4">
            <PlanetaryAlignment date={selectedDate} />
          </TabsContent>
        </Tabs>
      )}

      {showAiResponse && (
        <div className="mt-4 p-4 rounded-lg border bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            AI Insights
          </h3>
          <div className="bg-muted/50 p-4 rounded-lg">
            {isLoadingAi && (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <p className="text-muted-foreground text-sm">Consulting the cosmic wisdom...</p>
              </div>
            )}
            {aiError && (
              <div className="space-y-2">
                <p className="text-destructive text-sm">{aiError}</p>
                <p className="text-muted-foreground text-sm italic">Showing demo response:</p>
              </div>
            )}
            {aiResponse && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <Button 
          className="w-full"
          variant="outline"
          onClick={handleAskAi}
          disabled={isLoadingAi}
        >
          <MessageCircle className="mr-2" />
          {isLoadingAi ? "Consulting AI..." : "Ask AI about this day"}
        </Button>
        
        {onClose && (
          <Button onClick={() => onClose(true)} variant="secondary" className="w-full">
            Close
          </Button>
        )}
      </div>
    </div>
  );
};
