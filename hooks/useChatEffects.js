import { useState, useEffect } from 'react';

export function useAutoFocus(inputRef, dependencies = []) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, dependencies);
}

export function useMessageSound() {
  const playSound = (type = 'send') => {
    // Create a simple audio feedback without external files
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different tones for different actions
    if (type === 'send') {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    } else if (type === 'receive') {
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.1);
    }
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  return { playSound };
}
