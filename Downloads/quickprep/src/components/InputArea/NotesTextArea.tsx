'use client';

import React, { useEffect, useRef, useState } from 'react';

interface NotesTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const MAX_LENGTH = 8000;

const NotesTextArea: React.FC<NotesTextAreaProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [charCount, setCharCount] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const displayValue = isListening ? value + interimTranscript : value;
    setCharCount(displayValue.length);
  }, [value, interimTranscript, isListening]);

  // Check browser support on mount
  useEffect(() => {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(supported);
    console.log('Voice input supported:', supported);
  }, []);

  // Debug function for testing microphone (accessible from browser console)
  useEffect(() => {
    (window as any).testMicrophone = async () => {
      console.log('🧪 Testing microphone functionality...');
      console.log('Browser:', navigator.userAgent);
      console.log('HTTPS/Secure context:', location.protocol === 'https:' || location.hostname === 'localhost');
      console.log('Speech Recognition API:', 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
      console.log('MediaDevices API:', !!navigator.mediaDevices);
      console.log('Permissions API:', !!navigator.permissions);

      try {
        const permission = await checkMicrophonePermission();
        console.log('Microphone permission result:', permission);
        return permission;
      } catch (error) {
        console.error('Microphone test failed:', error);
        return false;
      }
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = '0px';
    const newHeight = el.scrollHeight;
    el.style.height = `${newHeight}px`;
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value.slice(0, MAX_LENGTH);
    onChange(newValue);
  };

  // Check microphone permissions
  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      console.log('Checking microphone permission...');

      // First, try to get permission status
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          console.log('Permission status:', permissionStatus.state);

          if (permissionStatus.state === 'denied') {
            console.log('Microphone permission denied');
            return false;
          }

          if (permissionStatus.state === 'granted') {
            console.log('Microphone permission granted');
            return true;
          }
        } catch (permError) {
          console.warn('Permissions API query failed:', permError);
          // Continue to fallback method
        }
      }

      // If permission API not available or failed, try to get user media
      console.log('Requesting microphone access...');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('MediaDevices API not available');
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');

      // Stop the stream immediately since we just needed permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return false;
    }
  };

  const startVoiceInput = async () => {
    console.log('🎤 Voice input button clicked');
    console.log('isSupported:', isSupported);
    console.log('isListening:', isListening);
    console.log('disabled:', disabled);
    console.log('Browser support check:', 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

    if (!isSupported) {
      console.log('❌ Voice input not supported');
      alert('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari for voice input functionality.');
      return;
    }

    if (disabled) {
      console.log('❌ Voice input disabled');
      return;
    }

    // Check microphone permission first
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      console.log('Microphone permission not granted');
      alert('🎤 Microphone access is required for voice input.\n\nPlease:\n1. Click the microphone icon in your browser\'s address bar\n2. Select "Allow" for microphone access\n3. Try the voice input again\n\nIf you see "Block", click it and try again.');
      return;
    }

    // Check if we have user interaction permission (required by some browsers)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('MediaDevices API not available');
      alert('Your browser does not support microphone access. Please update to a modern browser.');
      return;
    }

    if (isListening) {
      // Stop listening
      console.log('Stopping voice input');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setInterimTranscript(''); // Clear interim transcript
      return;
    }

    // Start listening
    console.log('Starting voice input');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('SpeechRecognition API not found');
      alert('Speech recognition is not available in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true; // Enable interim results for better user feedback
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      console.log('Speech recognition result received', event);
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update interim transcript for display
      setInterimTranscript(interimTranscript);

      // Append final transcripts to the actual value
      if (finalTranscript.trim()) {
        console.log('Final transcript:', finalTranscript);
        const newValue = (value + finalTranscript).trim();
        const trimmedValue = newValue.slice(0, MAX_LENGTH);
        onChange(trimmedValue);
        setInterimTranscript(''); // Clear interim after committing final
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('🎤 Microphone access denied!\n\nPlease:\n1. Click the microphone icon in your browser\'s address bar\n2. Allow microphone access for this site\n3. Try the voice input again\n\nVoice input requires microphone permissions to work.');
      } else if (event.error === 'no-speech') {
        // No speech detected - this is normal, don't show error
        console.log('No speech detected');
      } else if (event.error === 'audio-capture') {
        alert('🎤 Microphone not available. Please check your microphone connection and try again.');
      } else if (event.error === 'network') {
        alert('🎤 Network error during speech recognition. Please check your connection and try again.');
      } else {
        console.error('Unexpected speech recognition error:', event.error);
        alert(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      setInterimTranscript(''); // Clear interim transcript
    };

    recognitionRef.current = recognition;
    try {
      console.log('Attempting to start speech recognition...');
      recognition.start();
      console.log('Speech recognition start() called successfully');
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
      alert('Failed to start voice input. This might be due to:\n\n• Microphone permissions denied\n• Another application using the microphone\n• Browser security restrictions\n\nPlease try refreshing the page and allowing microphone access.');
    }
  };

  return (
    <div className="notes-textarea-wrapper">
      <label className="field-label" htmlFor="notes">
        Lecture notes
      </label>
      <div className="notes-textarea-shell">
        <textarea
          id="notes"
          ref={textAreaRef}
          className="notes-textarea"
          value={isListening ? value + interimTranscript : value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="📝 Paste your lecture notes, textbook excerpts, or study summaries here...
  
💡 Example: 'Reinforcement Learning uses Markov Decision Processes (MDP) where agents learn optimal policies...'"
          style={{ 
            color: '#ffffff', 
            backgroundColor: 'rgba(10, 10, 25, 0.98)' 
          }}  /* INLINE FORCE */
          aria-label="Lecture notes input"
        />
      </div>
      <div className="notes-meta">
        <span id="notes-helper" className="helper-text">
          Longer, more detailed notes lead to better summaries, questions, and study plans.
        </span>
        <span
          id="notes-counter"
          className="char-counter"
          aria-live="polite"
        >
          {charCount}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  );
};

export default NotesTextArea;
