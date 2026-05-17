"use client";

import { useState, useEffect } from "react";
import { playTypingSound } from "@/lib/audio";

export function TypewriterText({ text, delay = 20 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        
        // Play typing sound periodically to avoid overwhelming the audio context
        if (index % 3 === 0) {
            playTypingSound();
        }
        
        index++;
      } else {
        clearInterval(interval);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [text, delay]);

  return <>{displayedText}</>;
}
