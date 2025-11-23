import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Orbit } from "lucide-react";

interface Planet {
  name: string;
  angle: number;
  distance: number;
  color: string;
  size: number;
}

interface PlanetaryAlignmentProps {
  date: Date;
  time?: string;
}

export const PlanetaryAlignment = ({ date, time }: PlanetaryAlignmentProps) => {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [rotation, setRotation] = useState(0);

  const planetColors = {
    Sun: "#FDB813",
    Moon: "#C0C0C0",
    Mercury: "#8C7853",
    Venus: "#FFC649",
    Mars: "#E27B58",
    Jupiter: "#C88B3A",
    Saturn: "#FAD5A5"
  };

  const planetSizes = {
    Sun: 20,
    Moon: 12,
    Mercury: 8,
    Venus: 12,
    Mars: 10,
    Jupiter: 18,
    Saturn: 16
  };

  // Calculate planetary positions
  useEffect(() => {
    const calculatePositions = () => {
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000));
      const [hours, minutes] = time ? time.split(':').map(Number) : [date.getHours(), date.getMinutes()];
      const minuteOfDay = hours * 60 + minutes;

      const planetData: Planet[] = [
        {
          name: "Sun",
          angle: (dayOfYear * 0.986 + minuteOfDay * 0.041) % 360,
          distance: 0,
          color: planetColors.Sun,
          size: planetSizes.Sun
        },
        {
          name: "Moon",
          angle: (dayOfYear * 13.176 + minuteOfDay * 0.549) % 360,
          distance: 40,
          color: planetColors.Moon,
          size: planetSizes.Moon
        },
        {
          name: "Mercury",
          angle: (dayOfYear * 4.092 + minuteOfDay * 0.171) % 360,
          distance: 60,
          color: planetColors.Mercury,
          size: planetSizes.Mercury
        },
        {
          name: "Venus",
          angle: (dayOfYear * 1.602 + minuteOfDay * 0.067) % 360,
          distance: 80,
          color: planetColors.Venus,
          size: planetSizes.Venus
        },
        {
          name: "Mars",
          angle: (dayOfYear * 0.524 + minuteOfDay * 0.022) % 360,
          distance: 100,
          color: planetColors.Mars,
          size: planetSizes.Mars
        },
        {
          name: "Jupiter",
          angle: (dayOfYear * 0.083 + minuteOfDay * 0.003) % 360,
          distance: 120,
          color: planetColors.Jupiter,
          size: planetSizes.Jupiter
        },
        {
          name: "Saturn",
          angle: (dayOfYear * 0.033 + minuteOfDay * 0.001) % 360,
          distance: 140,
          color: planetColors.Saturn,
          size: planetSizes.Saturn
        }
      ];

      setPlanets(planetData);
    };

    calculatePositions();
    
    // Animate rotation
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [date, time]);

  // Calculate aspect lines (conjunctions, trines, squares, oppositions)
  const getAspects = () => {
    const aspects: { from: Planet; to: Planet; type: string; color: string }[] = [];
    
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const angle = Math.abs(planets[i].angle - planets[j].angle);
        const normalizedAngle = Math.min(angle, 360 - angle);
        
        // Conjunction (0°) - tolerance ±8°
        if (normalizedAngle <= 8) {
          aspects.push({
            from: planets[i],
            to: planets[j],
            type: "Conjunction",
            color: "#22c55e"
          });
        }
        // Trine (120°) - tolerance ±8°
        else if (Math.abs(normalizedAngle - 120) <= 8) {
          aspects.push({
            from: planets[i],
            to: planets[j],
            type: "Trine",
            color: "#3b82f6"
          });
        }
        // Square (90°) - tolerance ±8°
        else if (Math.abs(normalizedAngle - 90) <= 8) {
          aspects.push({
            from: planets[i],
            to: planets[j],
            type: "Square",
            color: "#ef4444"
          });
        }
        // Opposition (180°) - tolerance ±8°
        else if (Math.abs(normalizedAngle - 180) <= 8) {
          aspects.push({
            from: planets[i],
            to: planets[j],
            type: "Opposition",
            color: "#f59e0b"
          });
        }
      }
    }
    
    return aspects;
  };

  const aspects = getAspects();

  // Convert polar to cartesian coordinates
  const polarToCartesian = (angle: number, distance: number, centerX: number, centerY: number) => {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: centerX + distance * Math.cos(radians),
      y: centerY + distance * Math.sin(radians)
    };
  };

  const svgSize = 400;
  const center = svgSize / 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Orbit className="h-5 w-5" />
          Planetary Alignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* SVG Visualization */}
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="max-w-md mx-auto"
          >
            {/* Zodiac circle */}
            <circle
              cx={center}
              cy={center}
              r={160}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.2"
            />
            
            {/* Orbital paths */}
            {[40, 60, 80, 100, 120, 140].map((radius, index) => (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.1"
                strokeDasharray="2,2"
              />
            ))}

            {/* Aspect lines */}
            {aspects.map((aspect, index) => {
              const fromPos = polarToCartesian(aspect.from.angle, aspect.from.distance || 0, center, center);
              const toPos = polarToCartesian(aspect.to.angle, aspect.to.distance, center, center);
              
              return (
                <g key={index}>
                  <line
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke={aspect.color}
                    strokeWidth="1.5"
                    opacity="0.4"
                    strokeDasharray="4,4"
                  />
                </g>
              );
            })}

            {/* Planets */}
            {planets.map((planet, index) => {
              const pos = polarToCartesian(planet.angle + rotation * 0.1, planet.distance, center, center);
              
              return (
                <g key={index}>
                  {/* Planet orbit indicator */}
                  {planet.distance > 0 && (
                    <line
                      x1={center}
                      y1={center}
                      x2={pos.x}
                      y2={pos.y}
                      stroke="currentColor"
                      strokeWidth="0.5"
                      opacity="0.1"
                    />
                  )}
                  
                  {/* Planet */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={planet.size}
                    fill={planet.color}
                    stroke="white"
                    strokeWidth="2"
                    className="drop-shadow-lg"
                  />
                  
                  {/* Planet label */}
                  <text
                    x={pos.x}
                    y={pos.y + planet.size + 12}
                    textAnchor="middle"
                    fontSize="10"
                    fill="currentColor"
                    className="font-medium"
                  >
                    {planet.name}
                  </text>
                </g>
              );
            })}

            {/* Center point (Earth) */}
            <circle
              cx={center}
              cy={center}
              r={8}
              fill="#4ade80"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={center}
              y={center + 20}
              textAnchor="middle"
              fontSize="10"
              fill="currentColor"
              className="font-medium"
            >
              Earth
            </text>
          </svg>

          {/* Aspects Legend */}
          {aspects.length > 0 && (
            <div className="w-full space-y-2">
              <h4 className="font-medium text-sm">Active Aspects</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {aspects.map((aspect, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: aspect.color }}
                    />
                    <span className="font-medium">{aspect.from.name}</span>
                    <span className="text-muted-foreground">{aspect.type}</span>
                    <span className="font-medium">{aspect.to.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aspects.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              No major planetary aspects at this time
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
