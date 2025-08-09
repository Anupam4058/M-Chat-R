import React, { useEffect, useMemo, useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { UserExampleAudio } from "../redux/Action";

type Props = {
  disabled?: boolean;
  maxDurationMs?: number; // default 60000
  onSave: (audio: UserExampleAudio) => void;
  onDiscard?: () => void;
  initialAudio?: UserExampleAudio | null;
  className?: string;
};

const formatTime = (ms: number) => {
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const AudioRecorder: React.FC<Props> = ({
  disabled,
  maxDurationMs = 60000,
  onSave,
  onDiscard,
  initialAudio,
  className,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [startTs, setStartTs] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);
  const [previewAudio, setPreviewAudio] = useState<UserExampleAudio | null>(initialAudio || null);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({ audio: true, video: false, askPermissionOnMount: false });

  const isRecording = status === "recording";

  useEffect(() => {
    let timer: any;
    if (isRecording && startTs) {
      timer = setInterval(() => {
        setElapsed(Date.now() - startTs);
      }, 200);
    }
    return () => timer && clearInterval(timer);
  }, [isRecording, startTs]);

  useEffect(() => {
    if (isRecording && startTs && maxDurationMs > 0) {
      const timeout = setTimeout(() => {
        stopRecording();
      }, maxDurationMs - (Date.now() - startTs));
      return () => clearTimeout(timeout);
    }
  }, [isRecording, startTs, maxDurationMs, stopRecording]);

  useEffect(() => {
    setPreviewAudio(initialAudio || null);
  }, [initialAudio]);

  useEffect(() => {
    // When mediaBlobUrl updates after stopRecording, build the dataUrl and metadata
    const processBlob = async () => {
      try {
        if (!mediaBlobUrl) return;
        const resp = await fetch(mediaBlobUrl);
        const blob = await resp.blob();
        const dataUrl = await blobToDataUrl(blob);
        const durationMs = elapsed || 0;
        const mimeType = blob.type || "audio/webm";
        const audio: UserExampleAudio = {
          dataUrl,
          mimeType,
          durationMs,
          createdAt: new Date().toISOString(),
        };
        setPreviewAudio(audio);
      } catch (e: any) {
        setError("Failed to prepare audio preview.");
      }
    };
    processBlob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaBlobUrl]);

  const canRecord = useMemo(() => !disabled && !isRecording, [disabled, isRecording]);

  const handleStart = async () => {
    setError(null);
    setElapsed(0);
    setStartTs(Date.now());
    try {
      await startRecording();
    } catch (e: any) {
      setError("Microphone permission denied or not supported.");
    }
  };

  const handleStop = async () => {
    try {
      stopRecording();
    } catch (e) {
      // ignore
    }
  };

  const handleSave = () => {
    if (!previewAudio) return;
    onSave(previewAudio);
  };

  const handleDiscard = () => {
    setPreviewAudio(null);
    setElapsed(0);
    setStartTs(null);
    onDiscard && onDiscard();
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canRecord}
          onClick={handleStart}
          className={`px-3 py-2 rounded-md text-sm font-medium ${canRecord ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-300 text-gray-600"}`}
        >
          Start Recording
        </button>
        <button
          type="button"
          disabled={!isRecording}
          onClick={handleStop}
          className={`px-3 py-2 rounded-md text-sm font-medium ${isRecording ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-300 text-gray-600"}`}
        >
          Stop
        </button>
        <div className="text-xs text-gray-600">
          {isRecording ? `Recording… ${formatTime(elapsed)} / ${formatTime(maxDurationMs)}` : previewAudio ? `Ready to save` : `Idle`}
        </div>
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-600">{error}</div>
      )}

      {previewAudio && (
        <div className="mt-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
          <audio controls src={previewAudio.dataUrl} className="w-full" />
          <div className="mt-1 text-xs text-gray-600">Duration: {Math.round((previewAudio.durationMs || 0) / 1000)}s</div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Save recording
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              className="px-3 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;


