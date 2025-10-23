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
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    // Create a File-like object for OpenAI
    const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    return transcription.text;
  } catch (error) {
    console.error("Whisper transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
}

async function generateSpeech(text: string): Promise<string> {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova", // Professional female voice for Amanda
      input: text,
      speed: 1.0,
    });

    // Convert to buffer then base64
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer.toString('base64');
  } catch (error) {
    console.error("TTS generation error:", error);
    throw new Error("Failed to generate speech");
  }
}
