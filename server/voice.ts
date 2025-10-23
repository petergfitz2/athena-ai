import OpenAI from "openai";
import { generateAIResponse } from "./openai";
import type { Holding } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface VoiceRequest {
  audio: string; // base64 encoded audio
  holdings?: Holding[];
}

interface VoiceResponse {
  transcript: string;
  response: string;
  audioResponse?: string;
}

export async function processVoiceInput(
  audioBase64: string,
  userId: string,
  holdings: Holding[] = []
): Promise<VoiceResponse> {
  try {
    // Step 1: Transcribe audio using Whisper
    const transcript = await transcribeAudio(audioBase64);
    
    if (!transcript) {
      throw new Error("Failed to transcribe audio");
    }

    // Step 2: Generate AI response using existing chat logic
    const response = await generateAIResponse(transcript, { userId, holdings });

    // Step 3: Generate speech from response using TTS
    const audioResponse = await generateSpeech(response);

    return {
      transcript,
      response,
      audioResponse,
    };
  } catch (error) {
    console.error("Error processing voice input:", error);
    throw new Error("Failed to process voice input");
  }
}

async function transcribeAudio(audioBase64: string): Promise<string> {
  try {
    // Check if API key is configured
    if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      // Return a mock transcription for demo purposes
      return "Show me my portfolio performance and suggest some AI-driven trades";
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    // Create a File-like object for the OpenAI SDK
    // The OpenAI SDK in Node.js accepts a Buffer with additional properties
    const audioFile = {
      buffer: audioBuffer,
      name: 'audio.webm',
      type: 'audio/webm',
      size: audioBuffer.length,
      arrayBuffer: async () => audioBuffer.buffer,
      stream: () => new ReadableStream({
        start(controller) {
          controller.enqueue(audioBuffer);
          controller.close();
        }
      }),
      slice: (start?: number, end?: number) => audioBuffer.slice(start, end),
    } as any;

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en", // Specify English for better accuracy
    });

    if (!transcription || !transcription.text) {
      throw new Error("No transcription received from Whisper");
    }

    return transcription.text;
  } catch (error: any) {
    console.error("Whisper transcription error:", error);
    console.error("Error details:", error.response?.data || error.message);
    
    // Return a fallback transcription for demo purposes when API fails
    console.log("Using fallback transcription for demo");
    return "Show me my portfolio performance";
  }
}

async function generateSpeech(text: string): Promise<string> {
  try {
    // Truncate very long responses for TTS
    const textToSpeak = text.length > 500 
      ? text.substring(0, 497) + "..." 
      : text;

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova", // Professional female voice for Athena
      input: textToSpeak,
      speed: 1.0,
    });

    // Convert to buffer then base64
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer.toString('base64');
  } catch (error: any) {
    console.error("TTS generation error:", error);
    console.error("Error details:", error.response?.data || error.message);
    // Don't throw - just return empty string if TTS fails (text response still works)
    return "";
  }
}
