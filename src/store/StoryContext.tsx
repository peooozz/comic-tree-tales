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
        speak("High on a mountain, stood a tall, proud fir tree and a humble bramble bush.", "NARRATOR");
        break;
      case 1:
        setPhase('BOAST');
        setWindPower(10);
        speak("Look at you! So small, so weak. I stand tall against any wind!", "TREE");
        break;
      case 2:
        setPhase('BOAST');
        speak("I may be small, but I bend when the wind blows.", "BRAMBLE");
        break;
      case 3:
        setPhase('STORM_BUILD');
        setWindPower(50);
        speak("A fierce storm arrived, twisting the wind.", "NARRATOR");
        break;
      case 4:
        setPhase('PEAK_STORM');
        setWindPower(80);
        speak("Bring it on! I... will... never... bend!", "TREE");
        break;
      case 5:
        setPhase('SNAP');
        setWindPower(100);
        setTriggerSnap(true);
        speak("CRACK! The rigid fir tree snapped. The humble bramble survived.", "NARRATOR");
        break;
      case 6:
        setPhase('AFTERMATH');
        setWindPower(0);
        speak("Is strength always about being stiff? Sometimes, true strength is knowing how to bend.", "NARRATOR");
        break;
    }
  }, [speak]);

  const nextStep = useCallback(() => {
    if (step < 6) executeStep(step + 1);
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
      triggerSnap, isSpeaking, nextStep, resetStory
    }}>
      {children}
    </StoryContext.Provider>
  );
};
