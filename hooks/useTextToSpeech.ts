import { useState, useEffect, useCallback, useRef } from 'react';

export const useAdvancedTextToSpeech = (options: {
  onBoundary: (e: SpeechSynthesisEvent) => void;
  onEnd: () => void;
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Use a ref to hold the latest callbacks without making speak/cancel functions unstable
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const handleVoicesChanged = () => {
      const allVoices = window.speechSynthesis.getVoices();
      
      let preferredVoices = allVoices.filter(voice => voice.lang.startsWith('en') && voice.name.includes('Google'));

      if (preferredVoices.length === 0) {
        // Fallback: English voices, excluding Microsoft, if no Google voices are available
        preferredVoices = allVoices.filter(voice => voice.lang.startsWith('en') && !voice.name.includes('Microsoft'));
      }

      // Sort the filtered list for quality
      preferredVoices.sort((a, b) => {
          if (a.default) return -1;
          if (b.default) return 1;
          if (a.localService && !b.localService) return -1;
          if (!a.localService && b.localService) return 1;
          return 0;
      });

      setVoices(preferredVoices);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    handleVoicesChanged(); // Initial load
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string, selectedVoiceURI: string | null, rate: number) => {
    if (!window.speechSynthesis) {
      console.warn("Text-to-speech not supported in this browser.");
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoiceURI) {
        const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
        if(selectedVoice) utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      // Use ref to ensure the latest callback is always called
      optionsRef.current.onBoundary({ charIndex: 0 } as SpeechSynthesisEvent); // Reset highlight
      if (optionsRef.current.onEnd) optionsRef.current.onEnd();
    };
    utterance.onpause = () => {
      setIsSpeaking(true);
      setIsPaused(true);
    }
    utterance.onresume = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    }
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      // The "interrupted" error is expected when we call `cancel()`, so we don't log it.
      if (event.error !== 'interrupted') {
        console.error("An error occurred during speech synthesis:", event.error);
      }
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onboundary = (e) => {
        if (optionsRef.current.onBoundary) {
            optionsRef.current.onBoundary(e);
        }
    };

    window.speechSynthesis.speak(utterance);
  }, [voices]);

  const pause = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }, []);
  
  const resume = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }, []);

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);
  
  return { isSpeaking, isPaused, voices, speak, pause, resume, cancel };
};


// Keep the simple hook for the AI companion chat
export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      console.warn("Text-to-speech not supported in this browser.");
      return;
    }
    
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.error("An error occurred during speech synthesis:", event.error);
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { isSpeaking, speak, cancel };
};