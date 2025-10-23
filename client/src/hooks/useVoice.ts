import { useState, useRef, useEffect, useCallback } from "react";

export type VoiceStatus = "idle" | "connecting" | "listening" | "speaking" | "error";

interface UseVoiceOptions {
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  onError?: (error: Error) => void;
}

export function useVoice({ onTranscript, onResponse, onError }: UseVoiceOptions = {}) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new AudioContext();
    audioElementRef.current = new Audio();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Start recording audio (push-to-talk)
  const startRecording = useCallback(async () => {
    try {
      setStatus("connecting");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setStatus("listening");
      
    } catch (error) {
      console.error("Error starting recording:", error);
      setStatus("error");
      onError?.(error as Error);
    }
  }, [onError]);

  // Stop recording audio
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("idle");
    }
  }, []);

  // Process recorded audio
  const processAudio = async (audioBlob: Blob) => {
    try {
      setStatus("connecting");
      
      // Convert audio to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove data:audio/webm;base64, prefix
        };
      });
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await base64Promise;

      // Send to backend for transcription and AI response
      const response = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ audio: audioBase64 }),
      });

      if (!response.ok) {
        throw new Error('Failed to process voice input');
      }

      const data = await response.json();
      
      // Handle transcript
      if (data.transcript) {
        setTranscript(data.transcript);
        onTranscript?.(data.transcript);
      }

      // Handle AI response
      if (data.response) {
        onResponse?.(data.response);
        
        // If audio response is provided, play it
        if (data.audioResponse) {
          await playAudioResponse(data.audioResponse);
        }
      }
      
      setStatus("idle");
      
    } catch (error) {
      console.error("Error processing audio:", error);
      setStatus("error");
      onError?.(error as Error);
    }
  };

  // Play audio response from Amanda
  const playAudioResponse = async (audioBase64: string) => {
    try {
      setStatus("speaking");
      
      // Convert base64 to blob
      const audioData = atob(audioBase64);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }
      const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play audio
      if (audioElementRef.current) {
        audioElementRef.current.src = audioUrl;
        audioElementRef.current.onended = () => {
          setStatus("idle");
          URL.revokeObjectURL(audioUrl);
        };
        await audioElementRef.current.play();
      }
      
    } catch (error) {
      console.error("Error playing audio:", error);
      setStatus("error");
      onError?.(error as Error);
    }
  };

  // Keyboard shortcut for push-to-talk (Space key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space key or Cmd/Ctrl+K for push-to-talk
      if ((e.code === "Space" || (e.metaKey || e.ctrlKey) && e.key === "k") && !isRecording) {
        e.preventDefault();
        startRecording();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.key === "k") && isRecording) {
        e.preventDefault();
        stopRecording();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isRecording, startRecording, stopRecording]);

  return {
    status,
    transcript,
    isRecording,
    startRecording,
    stopRecording,
  };
}
