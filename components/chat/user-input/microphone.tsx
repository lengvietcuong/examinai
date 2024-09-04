"use client";

import { useState, useRef } from "react";
import {
  createClient,
  LiveClient,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";
import { getDeepgramTemporaryKey } from "@/lib/deepgram";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AiOutlineLoading as LoadingCircleIcon } from "react-icons/ai";
import { PiMicrophoneBold as MicrophoneIcon } from "react-icons/pi";

interface MicrophoneProps {
  onActivate: () => void;
  onTranscript: (transcript: string, isFinal: boolean) => void;
}

export default function Microphone({ onActivate, onTranscript }: MicrophoneProps) {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const connectionRef = useRef<LiveClient | null>(null);
  const microphoneRef = useRef<MediaRecorder | null>(null);
  const keepAliveInterval = useRef<NodeJS.Timeout | undefined>(undefined);
  const silenceTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  async function initializeConnection() {
    const key = await getDeepgramTemporaryKey();
    const deepgram = createClient(key);
    const conn = deepgram.listen.live({
      model: "nova-2",
      interim_results: true,
      smart_format: true,
      filler_words: true,
      utterance_end_ms: 3000,
    });

    await new Promise((resolve, _) => {
      conn.addListener(LiveTranscriptionEvents.Open, () => {
        resolve(null); // Resolve the promise when the connection is open
      });
    });

    conn.addListener(
      LiveTranscriptionEvents.Transcript,
      (data: LiveTranscriptionEvent) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (!transcript.trim()) return;

        onTranscript(transcript, data.is_final || false);
        resetSilenceTimeout();
      },
    );

    keepAliveInterval.current = setInterval(() => {
      connectionRef.current?.keepAlive();
    }, 10_000);

    connectionRef.current = conn;
  }

  async function initializeMicrophone() {
    const userMedia = await navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: true,
        echoCancellation: true,
      },
    });

    const mic = new MediaRecorder(userMedia);
    mic.addEventListener("dataavailable", (event: BlobEvent) => {
      if (microphoneRef.current?.state === "recording" && event.data.size > 0) {
        connectionRef.current?.send(event.data);
      }
    });
    mic.start(250); // Send data every 250ms

    microphoneRef.current = mic;
  }

  async function startListening() {
    setIsConnecting(true);
    try {
      if (!connectionRef.current) {
        await initializeConnection();
      }
      if (!microphoneRef.current) {
        await initializeMicrophone();
      } else {
        microphoneRef.current?.resume();
      }

      setIsListening(true);
      onActivate();
    } catch (error) {
      if (error instanceof Error && error.name === "NotAllowedError") {
        window.alert("Please allow microphone access to use voice input.");
      }
      setIsListening(false);
    } finally {
      clearInterval(keepAliveInterval.current); // No need to keep alive if listening or failed to connect
      setIsConnecting(false);
    }
  }

  function stopListening() {
    microphoneRef.current?.pause();
    clearTimeout(silenceTimeout.current);
    connectionRef.current?.keepAlive();
    keepAliveInterval.current = setInterval(() => {
      connectionRef.current?.keepAlive();
    }, 10_000);
    setIsListening(false);
  }

  function resetSilenceTimeout() {
    clearTimeout(silenceTimeout.current);
    silenceTimeout.current = setTimeout(() => {
      stopListening();
    }, 10_000);
  }

  function toggleMicrophone() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className="h-6">
          <button type="button" onClick={toggleMicrophone} className="relative">
            <MicrophoneIcon
              className={`size-6 transition-colors hover:cursor-pointer ${isListening ? "fill-primary hover:fill-primary/90" : "hover:fill-muted-foreground"}`}
            />
            {isConnecting && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <LoadingCircleIcon className="size-10 animate-spin" />
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{`${isListening ? "Turn off mircophone" : "Turn on microphone"}`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
