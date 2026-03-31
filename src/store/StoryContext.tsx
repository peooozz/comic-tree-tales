import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type StoryPhase = 'INTRO' | 'BOAST' | 'STORM_BUILD' | 'PEAK_STORM' | 'SNAP' | 'AFTERMATH';

interface StoryState {
  step: number;
  windPower: number;
  phase: StoryPhase;
  activeCharacter: 'TREE' | 'BRAMBLE' | 'NARRATOR' | null;
  dialogueText: string;
  triggerSnap: boolean;
  isSpeaking: boolean;
  setWindPower: (val: number) => void;
  nextStep: () => void;
  resetStory: () => void;
}

const defaultState: StoryState = {
  step: 0,
  windPower: 0,
  phase: 'INTRO',
  activeCharacter: null,
  dialogueText: '',
  triggerSnap: false,
  isSpeaking: false,
  setWindPower: () => {},
  nextStep: () => {},
  resetStory: () => {}
};

const StoryContext = createContext<StoryState>(defaultState);

export const useStory = () => useContext(StoryContext);

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState(0);
  const [windPower, setWindPower] = useState(0);
  const [phase, setPhase] = useState<StoryPhase>('INTRO');
  const [activeCharacter, setActiveCharacter] = useState<'TREE' | 'BRAMBLE' | 'NARRATOR' | null>(null);
  const [dialogueText, setDialogueText] = useState('');
  const [triggerSnap, setTriggerSnap] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const voicesInitialized = useRef(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const initVoices = () => {
      window.speechSynthesis.getVoices();
      voicesInitialized.current = true;
    };
    initVoices();
    window.speechSynthesis.onvoiceschanged = initVoices;
  }, []);

  const speak = useCallback((text: string, character: 'TREE' | 'BRAMBLE' | 'NARRATOR', onStart?: () => void) => {
    window.speechSynthesis.cancel();

    setTimeout(() => {
      setActiveCharacter(character);
      setDialogueText(text);
      if (onStart) onStart();

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      if (character === 'TREE') {
        utterance.pitch = 0.5;
        utterance.rate = 0.85;
        const maleVoice = voices.find(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Daniel'));
        if (maleVoice) utterance.voice = maleVoice;
      } else if (character === 'BRAMBLE') {
        utterance.pitch = 1.8;
        utterance.rate = 1.1;
        const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha'));
        if (femaleVoice) utterance.voice = femaleVoice;
      } else {
        utterance.pitch = 1.0;
        utterance.rate = 0.95;
        const narratorVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Alex'));
        if (narratorVoice) utterance.voice = narratorVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }, 100);
  }, []);

  const executeStep = useCallback((newStep: number) => {
    window.speechSynthesis.cancel();
    setStep(newStep);

    switch (newStep) {
      case 0:
        setPhase('INTRO');
        setWindPower(0);
        setTriggerSnap(false);
        speak("High up on a mountain stood a tall, proud fir tree and a small, thorny bramble bush. 🌲", "NARRATOR");
        break;
      case 1:
        setPhase('INTRO');
        speak("Straight, strong, and towering above all, it looked down at the bramble.", "NARRATOR");
        break;
      case 2:
        setPhase('BOAST');
        setWindPower(15);
        speak("Look at you! So small, so weak. I stand tall against the strongest winds!", "TREE");
        break;
      case 3:
        setPhase('BOAST');
        speak("I may be small, but I bend when the wind blows.", "BRAMBLE");
        break;
      case 4:
        setPhase('STORM_BUILD');
        setWindPower(55);
        speak("One day, a fierce storm arrived. 🌪️ The winds howled and pushed against the mighty fir tree.", "NARRATOR");
        break;
      case 5:
        setPhase('PEAK_STORM');
        setWindPower(85);
        speak("I will never bend!", "TREE");
        break;
      case 6:
        setPhase('PEAK_STORM');
        setWindPower(95);
        speak("The storm grew stronger… and stronger…", "NARRATOR");
        break;
      case 7:
        setPhase('SNAP');
        setWindPower(100);
        setTriggerSnap(true);
        speak("CRACK! ⚡ The rigid fir tree snapped and fell.", "NARRATOR");
        break;
      case 8:
        setPhase('AFTERMATH');
        setWindPower(10);
        setTriggerSnap(false); // Hide the CRACK! text
        speak("Down below, the bramble swayed, bent, and survived. When the storm passed, only the humble bramble remained.", "NARRATOR");
        break;
      case 9:
        setPhase('AFTERMATH');
        setTriggerSnap(false);
        speak("What happens if something refuses to bend? Is strength always about being stiff?", "NARRATOR");
        break;
    }
  }, [speak]);

  const nextStep = useCallback(() => {
    if (step < 9) executeStep(step + 1);
  }, [step, executeStep]);

  const resetStory = useCallback(() => {
    executeStep(0);
  }, [executeStep]);

  useEffect(() => {
    const timer = setTimeout(() => {
      resetStory();
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StoryContext.Provider value={{
      step, windPower, phase, activeCharacter, dialogueText,
      triggerSnap, isSpeaking, setWindPower, nextStep, resetStory
    }}>
      {children}
    </StoryContext.Provider>
  );
};
