import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Heart, Briefcase, Users } from "lucide-react";

interface NumerologyInsightsProps {
  primaryNumber: number;
  personalNumber?: number;
}

export const NumerologyInsights = ({ primaryNumber, personalNumber }: NumerologyInsightsProps) => {
  const getNumberMeaning = (num: number) => {
    const meanings: Record<number, { 
      title: string; 
      description: string; 
      energy: string;
      focus: string[];
      color: string;
    }> = {
      1: {
        title: "New Beginnings",
        description: "A day of leadership, independence, and fresh starts. Take initiative and trust your instincts.",
        energy: "Pioneering and assertive",
        focus: ["Start new projects", "Take leadership", "Be independent", "Assert yourself"],
        color: "text-red-500"
      },
      2: {
        title: "Harmony & Balance",
        description: "Focus on partnerships, diplomacy, and cooperation. Great for building relationships.",
        energy: "Cooperative and diplomatic",
        focus: ["Build partnerships", "Practice diplomacy", "Seek balance", "Listen to others"],
        color: "text-orange-500"
      },
      3: {
        title: "Creative Expression",
        description: "A day for creativity, communication, and joy. Express yourself freely and embrace optimism.",
        energy: "Creative and expressive",
        focus: ["Express creativity", "Communicate openly", "Socialize", "Spread joy"],
        color: "text-yellow-500"
      },
      4: {
        title: "Structure & Stability",
        description: "Focus on building foundations, organization, and practical matters. Hard work pays off.",
        energy: "Practical and disciplined",
        focus: ["Organize tasks", "Build foundations", "Work hard", "Be practical"],
        color: "text-green-500"
      },
      5: {
        title: "Change & Freedom",
        description: "Embrace change, adventure, and versatility. Perfect for trying new experiences.",
        energy: "Dynamic and adventurous",
        focus: ["Embrace change", "Seek adventure", "Be flexible", "Try new things"],
        color: "text-blue-500"
      },
      6: {
        title: "Love & Responsibility",
        description: "A day for nurturing, family, and service to others. Focus on home and relationships.",
        energy: "Nurturing and responsible",
        focus: ["Care for others", "Focus on family", "Create harmony", "Be compassionate"],
        color: "text-indigo-500"
      },
      7: {
        title: "Spiritual Insight",
        description: "Time for introspection, analysis, and spiritual growth. Seek deeper understanding.",
        energy: "Analytical and spiritual",
        focus: ["Meditate", "Analyze situations", "Seek wisdom", "Trust intuition"],
        color: "text-purple-500"
      },
      8: {
        title: "Power & Success",
        description: "Focus on achievement, abundance, and material success. Great for business matters.",
        energy: "Ambitious and powerful",
        focus: ["Pursue goals", "Make decisions", "Build wealth", "Show authority"],
        color: "text-pink-500"
      },
      9: {
        title: "Completion & Wisdom",
        description: "A day of endings, compassion, and universal love. Let go and embrace transformation.",
        energy: "Compassionate and wise",
        focus: ["Complete projects", "Show compassion", "Let go", "Help others"],
        color: "text-rose-500"
      },
      11: {
        title: "Master Intuition",
        description: "Heightened spiritual awareness and inspiration. Trust your inner guidance and inspire others.",
        energy: "Inspirational and intuitive",
        focus: ["Trust intuition", "Inspire others", "Seek enlightenment", "Channel creativity"],
        color: "text-cyan-500"
      },
      22: {
        title: "Master Builder",
        description: "Powerful manifestation energy. Turn dreams into reality through practical action.",
        energy: "Visionary and practical",
        focus: ["Build big dreams", "Manifest goals", "Lead projects", "Think globally"],
        color: "text-emerald-500"
      },
      33: {
        title: "Master Teacher",
        description: "Universal love and healing energy. Share wisdom and uplift humanity.",
        energy: "Compassionate and healing",
        focus: ["Teach others", "Heal wounds", "Spread love", "Serve humanity"],
        color: "text-amber-500"
      }
    };

    return meanings[num] || meanings[1];
  };

  const primaryMeaning = getNumberMeaning(primaryNumber);
  const personalMeaning = personalNumber ? getNumberMeaning(personalNumber) : null;

  const getLifeAreaAdvice = (num: number) => {
    const advice: Record<number, {
      love: string;
      career: string;
      health: string;
      finance: string;
    }> = {
      1: {
        love: "Take the lead in relationships. Express your desires clearly.",
        career: "Perfect day to pitch ideas or start new projects.",
        health: "High energy - great for starting new fitness routines.",
        finance: "Good time for independent financial decisions."
      },
      2: {
        love: "Focus on listening and understanding your partner.",
        career: "Collaborate and build partnerships for success.",
        health: "Practice gentle activities like yoga or meditation.",
        finance: "Consider joint ventures or shared investments."
      },
      3: {
        love: "Express your feelings creatively and joyfully.",
        career: "Use your communication skills to shine.",
        health: "Social activities boost your wellbeing.",
        finance: "Creative projects may bring financial rewards."
      },
      4: {
        love: "Build stability and trust in relationships.",
        career: "Focus on detailed work and long-term planning.",
        health: "Establish healthy routines and habits.",
        finance: "Budget and plan for financial security."
      },
      5: {
        love: "Keep things exciting and spontaneous.",
        career: "Embrace change and new opportunities.",
        health: "Try varied activities to stay engaged.",
        finance: "Be cautious with impulsive spending."
      },
      6: {
        love: "Nurture your relationships with care and attention.",
        career: "Help others and take on responsibilities.",
        health: "Focus on self-care and family health.",
        finance: "Invest in home and family needs."
      },
      7: {
        love: "Seek deeper emotional connections.",
        career: "Research and analysis lead to insights.",
        health: "Mental health and rest are priorities.",
        finance: "Analyze investments carefully before acting."
      },
      8: {
        love: "Balance power dynamics in relationships.",
        career: "Assert authority and pursue ambitious goals.",
        health: "Manage stress from high achievement drive.",
        finance: "Excellent day for major financial decisions."
      },
      9: {
        love: "Practice forgiveness and unconditional love.",
        career: "Complete projects and help others succeed.",
        health: "Release stress through compassionate activities.",
        finance: "Consider charitable giving or endings."
      },
      11: {
        love: "Connect on a spiritual and intuitive level.",
        career: "Inspire others with your vision and ideas.",
        health: "Balance high sensitivity with grounding practices.",
        finance: "Trust intuition but verify with facts."
      },
      22: {
        love: "Build lasting foundations in relationships.",
        career: "Think big and execute with precision.",
        health: "Channel intense energy into productive activities.",
        finance: "Major opportunities for wealth building."
      },
      33: {
        love: "Offer unconditional love and healing.",
        career: "Teach, heal, and serve in your work.",
        health: "Focus on holistic healing practices.",
        finance: "Abundance comes through service to others."
      }
    };

    return advice[num] || advice[1];
  };

  const advice = getLifeAreaAdvice(primaryNumber);

  return (
    <div className="space-y-4">
      {/* Primary Number Meaning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className={`h-5 w-5 ${primaryMeaning.color}`} />
            Day Energy: {primaryMeaning.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{primaryMeaning.description}</p>
          
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-2">Energy Type</div>
            <div className="text-sm">{primaryMeaning.energy}</div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Focus Areas Today</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {primaryMeaning.focus.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded">
                  <div className={`w-2 h-2 rounded-full ${primaryMeaning.color.replace('text-', 'bg-')}`} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Number Meaning */}
      {personalMeaning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className={`h-5 w-5 ${personalMeaning.color}`} />
              Your Personal Energy: {personalMeaning.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{personalMeaning.description}</p>
            <div className="mt-3 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm">
                This combines the day's energy ({primaryNumber}) with your life path, creating a unique vibration for you today.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Life Area Guidance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Guidance by Life Area
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="font-medium text-sm">Love & Relationships</span>
            </div>
            <p className="text-sm text-muted-foreground">{advice.love}</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Career & Work</span>
            </div>
            <p className="text-sm text-muted-foreground">{advice.career}</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">Health & Wellness</span>
            </div>
            <p className="text-sm text-muted-foreground">{advice.health}</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-sm">Finance & Abundance</span>
            </div>
            <p className="text-sm text-muted-foreground">{advice.finance}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
