import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Moon, Sun, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanetaryPosition {
  planet: string;
  degree: number;
  sign: string;
  house: number;
  retrograde: boolean;
}

interface MinuteData {
  time: string;
  hour: number;
  minute: number;
  moonPhase: number;
  sunPosition: number;
  planetaryHour: string;
  alignment: number; // 0-100 alignment score
  positions: PlanetaryPosition[];
}

interface AstrologyTimelineProps {
  selectedDate: Date;
}

export const AstrologyTimeline = ({ selectedDate }: AstrologyTimelineProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMinute, setSelectedMinute] = useState<MinuteData | null>(null);
  const [timelineData, setTimelineData] = useState<MinuteData[]>([]);

  const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
  const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

  // Calculate planetary positions for a given time
  const calculatePlanetaryPositions = (date: Date): PlanetaryPosition[] => {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000));
    const minuteOfDay = date.getHours() * 60 + date.getMinutes();
    
    return planets.map((planet, index) => {
      // Complex calculation simulating planetary movement
      const basePosition = (dayOfYear * (index + 1) * 0.986 + minuteOfDay * 0.25) % 360;
      const degree = Math.floor(basePosition);
      const signIndex = Math.floor(degree / 30);
      const house = Math.floor((degree + 180) / 30) % 12 + 1;
      
      // Retrograde periods (simplified)
      const retrograde = index > 1 && (dayOfYear % (60 + index * 20)) < 20;
      
      return {
        planet,
        degree: degree % 30,
        sign: zodiacSigns[signIndex],
        house,
        retrograde
      };
    });
  };

  // Calculate alignment score based on planetary aspects
  const calculateAlignment = (positions: PlanetaryPosition[]): number => {
    let score = 50; // Base score
    
    // Check for conjunctions (planets in same sign)
    const signCounts = positions.reduce((acc, pos) => {
      acc[pos.sign] = (acc[pos.sign] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.values(signCounts).forEach(count => {
      if (count > 1) score += count * 5;
    });
    
    // Check for trines (120 degrees apart)
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const signDiff = Math.abs(zodiacSigns.indexOf(positions[i].sign) - zodiacSigns.indexOf(positions[j].sign));
        if (signDiff === 4 || signDiff === 8) score += 8;
      }
    }
    
    // Retrograde planets reduce alignment slightly
    positions.forEach(pos => {
      if (pos.retrograde) score -= 3;
    });
    
    return Math.max(0, Math.min(100, score));
  };

  // Generate timeline data for the selected date
  useEffect(() => {
    const data: MinuteData[] = [];
    const baseDate = new Date(selectedDate);
    
    // Generate data for every 15 minutes (96 data points per day)
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = new Date(baseDate);
        time.setHours(hour, minute, 0, 0);
        
        const positions = calculatePlanetaryPositions(time);
        const alignment = calculateAlignment(positions);
        
        // Calculate moon phase (0-29.5 days)
        const daysSinceNewMoon = ((time.getTime() / (24 * 60 * 60 * 1000)) % 29.53);
        const moonPhase = (daysSinceNewMoon / 29.53) * 100;
        
        // Sun position (0-360 degrees through zodiac)
        const dayOfYear = Math.floor((time.getTime() - new Date(time.getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000));
        const sunPosition = (dayOfYear * 0.986) % 360;
        
        // Planetary hour (ancient system)
        const planetaryHourIndex = (hour + Math.floor(minute / 60)) % 7;
        const planetaryHour = planets[planetaryHourIndex];
        
        data.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          hour,
          minute,
          moonPhase,
          sunPosition,
          planetaryHour,
          alignment,
          positions
        });
      }
    }
    
    setTimelineData(data);
  }, [selectedDate]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const isCurrentTime = (data: MinuteData) => {
    if (!isSameDay(selectedDate, currentTime)) return false;
    return data.hour === currentTime.getHours() && 
           Math.abs(data.minute - currentTime.getMinutes()) < 15;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getAlignmentColor = (alignment: number) => {
    if (alignment >= 75) return "bg-green-500";
    if (alignment >= 50) return "bg-blue-500";
    if (alignment >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getAlignmentLabel = (alignment: number) => {
    if (alignment >= 75) return "Excellent";
    if (alignment >= 50) return "Good";
    if (alignment >= 25) return "Fair";
    return "Challenging";
  };

  return (
    <div className="space-y-6">
      {/* Timeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Daily Astrological Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Alignment Graph */}
            <div className="relative h-32 bg-muted/30 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-end justify-between px-1">
                {timelineData.map((data, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMinute(data)}
                    className={cn(
                      "flex-1 transition-all hover:opacity-80 rounded-t",
                      getAlignmentColor(data.alignment),
                      isCurrentTime(data) && "ring-2 ring-primary ring-offset-2",
                      selectedMinute?.time === data.time && "ring-2 ring-white"
                    )}
                    style={{ height: `${data.alignment}%` }}
                    title={`${data.time} - ${getAlignmentLabel(data.alignment)}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Time Labels */}
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:59</span>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span>Excellent (75-100)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span>Good (50-74)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded" />
                <span>Fair (25-49)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span>Challenging (0-24)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Time Details */}
      {selectedMinute && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                {selectedMinute.time}
              </span>
              <span className={cn(
                "text-sm font-normal px-3 py-1 rounded-full",
                getAlignmentColor(selectedMinute.alignment),
                "text-white"
              )}>
                {getAlignmentLabel(selectedMinute.alignment)} ({selectedMinute.alignment}%)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Celestial Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Moon className="h-4 w-4" />
                  <span className="text-sm">Moon Phase</span>
                </div>
                <div className="text-lg font-semibold">{selectedMinute.moonPhase.toFixed(1)}%</div>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Sun className="h-4 w-4" />
                  <span className="text-sm">Sun Position</span>
                </div>
                <div className="text-lg font-semibold">{selectedMinute.sunPosition.toFixed(1)}°</div>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Planetary Hour</span>
                </div>
                <div className="text-lg font-semibold">{selectedMinute.planetaryHour}</div>
              </div>
            </div>

            {/* Planetary Positions */}
            <div>
              <h4 className="font-medium mb-3">Planetary Positions</h4>
              <div className="space-y-2">
                {selectedMinute.positions.map((position, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium w-20">{position.planet}</span>
                      <span className="text-sm text-muted-foreground">
                        {position.degree.toFixed(1)}° {position.sign}
                      </span>
                      {position.retrograde && (
                        <span className="text-xs bg-orange-500/20 text-orange-600 px-2 py-0.5 rounded">
                          Retrograde
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      House {position.house}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Time Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Jump</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {[0, 3, 6, 9, 12, 15, 18, 21].map(hour => {
              const data = timelineData.find(d => d.hour === hour && d.minute === 0);
              return (
                <Button
                  key={hour}
                  variant={selectedMinute?.hour === hour ? "default" : "outline"}
                  size="sm"
                  onClick={() => data && setSelectedMinute(data)}
                  className="flex flex-col h-auto py-2"
                >
                  <span className="text-xs">{hour.toString().padStart(2, '0')}:00</span>
                  {data && (
                    <div className={cn(
                      "w-full h-1 mt-1 rounded",
                      getAlignmentColor(data.alignment)
                    )} />
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
