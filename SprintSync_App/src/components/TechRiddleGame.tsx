import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Lightbulb, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { techRiddles, Riddle } from '../utils/techRiddles';

const TechRiddleGame: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentRiddle, setCurrentRiddle] = useState<Riddle | null>(null);
  const [playsToday, setPlaysToday] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const maxPlays = 5;

  // Initialize/Load daily state
  useEffect(() => {
    if (user?.id) {
      const today = new Date().toDateString();
      const storageKey = `tech-riddles-${user.id}`;
      const savedData = localStorage.getItem(storageKey);
      
      let initializedPlays = 0;
      let initializedPlayedIds: number[] = [];

      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.date === today) {
            initializedPlays = parsed.plays || 0;
            initializedPlayedIds = parsed.playedIds || [];
          }
        } catch (e) {
          console.error("Failed to parse riddle data");
        }
      }
      setPlaysToday(initializedPlays);
      
      if (!showResult) {
        // Select a new random riddle not played today
        const remainingRiddles = techRiddles.filter(r => !initializedPlayedIds.includes(r.id));
        if (remainingRiddles.length > 0) {
          const randomIndex = Math.floor(Math.random() * remainingRiddles.length);
          setCurrentRiddle(remainingRiddles[randomIndex]);
        } else {
          // Fallback if all 60 played? Just pick random
          const randomIndex = Math.floor(Math.random() * techRiddles.length);
          setCurrentRiddle(techRiddles[randomIndex]);
        }
      }
    }
  }, [user?.id, isOpen, showResult]); // Reroll when opened or user changes

  const handleOptionClick = (option: string) => {
    if (showResult || !currentRiddle || !user?.id) return;
    
    setSelectedOption(option);
    const correct = option === currentRiddle.answer;
    setIsCorrect(correct);
    setShowResult(true);

    const newPlays = playsToday + 1;
    setPlaysToday(newPlays);

    // Save to local storage
    const today = new Date().toDateString();
    const storageKey = `tech-riddles-${user.id}`;
    const savedData = localStorage.getItem(storageKey);
    let playedIds: number[] = [currentRiddle.id];
    
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (parsed.date === today && Array.isArray(parsed.playedIds)) {
                playedIds = [...parsed.playedIds, currentRiddle.id];
            }
        } catch(e){}
    }
    
    localStorage.setItem(storageKey, JSON.stringify({
      date: today,
      plays: newPlays,
      playedIds: playedIds
    }));
  };

  const nextRiddle = () => {
    setIsOpen(false);
    setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
        setShowResult(false);
    }, 300);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group hover:bg-yellow-100/50 transition-colors">
          <Lightbulb className="h-4 w-4 text-yellow-600 group-hover:text-yellow-700" />
          {maxPlays - playsToday > 0 && playsToday < maxPlays && (
            <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-yellow-100 text-yellow-800 border-yellow-200 shadow-sm animate-pulse">
                {maxPlays - playsToday}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 overflow-hidden shadow-xl border-green-100">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <h3 className="font-semibold text-sm">Tech Riddle Game</h3>
            </div>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-[10px] font-medium">
              {playsToday}/{maxPlays} Today
            </Badge>
          </div>
        </div>
        
        <div className="p-4 bg-white">
          {playsToday >= maxPlays && !showResult ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lightbulb className="w-6 h-6 text-yellow-600 opacity-50" />
              </div>
              <h4 className="font-medium text-gray-900">Brain Needs Rest!</h4>
              <p className="text-sm text-gray-500">You've reached your daily limit of 5 riddles. Come back tomorrow for more IT challenges!</p>
              <Button onClick={() => setIsOpen(false)} variant="outline" size="sm" className="mt-4 w-full">Close</Button>
            </div>
          ) : currentRiddle ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-800 leading-relaxed italic border-l-2 border-green-500 pl-3 py-1 bg-green-50/50 rounded-r shadow-sm">
                "{currentRiddle.question}"
              </p>
              
              <div className="grid grid-cols-1 gap-2 mt-4">
                {currentRiddle.options.map((opt, idx) => (
                  <Button
                    key={idx}
                    variant={selectedOption === opt ? (opt === currentRiddle.answer ? "default" : "destructive") : "outline"}
                    className={`justify-start text-xs h-auto py-2 px-3 text-left w-full relative
                      ${showResult && opt === currentRiddle.answer && selectedOption !== opt ? 'border-green-500 bg-green-50 text-green-700' : ''}
                      ${!showResult ? 'hover:bg-green-50 hover:text-green-700 hover:border-green-200' : ''}`}
                    onClick={() => handleOptionClick(opt)}
                    disabled={showResult}
                  >
                    <span className="pr-6 line-clamp-2">{opt}</span>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {showResult && opt === currentRiddle.answer && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                        {showResult && selectedOption === opt && opt !== currentRiddle.answer && (
                        <XCircle className="w-4 h-4 text-red-500" />
                        )}
                    </div>
                  </Button>
                ))}
              </div>

              {showResult && (
                <div className="pt-3 flex justify-end animate-in fade-in duration-300">
                    <Button size="sm" onClick={nextRiddle} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 text-xs shadow-md transition-all">
                        {playsToday >= maxPlays ? "Close" : "Next Riddle"}
                    </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">Loading...</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TechRiddleGame;
