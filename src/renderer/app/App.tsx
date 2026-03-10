import { useState, useEffect, useRef, useCallback } from 'react';
import SourcePicker from './components/SourcePicker';
import ResolutionPicker from './components/ResolutionPicker';
import WebcamToggle from './components/WebcamToggle';
import RecordButton from './components/RecordButton';
import SettingsView from './components/SettingsView';
import type { DesktopSource, AppSettings, RecorderStatus, Resolution } from '../../shared/types';

type View = 'main' | 'settings';

export default function App() {
  const [view, setView] = useState<View>('main');
  const [sources, setSources] = useState<DesktopSource[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [status, setStatus] = useState<RecorderStatus>({ state: 'idle' });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    loadSources();
    loadSettings();
    const unsub1 = window.videso.onRecorderStatus!(setStatus);
    const unsub2 = window.videso.onBeginCapture!(handleBeginCapture);
    const unsub3 = window.videso.onStopCapture!(handleStopCapture);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  async function loadSources() {
    const s = await window.videso.getSources!();
    setSources(s);
    if (s.length > 0 && !selectedSourceId) {
      setSelectedSourceId(s[0].id);
      window.videso.selectSource!(s[0].id);
    }
  }

  async function loadSettings() {
    const s = await window.videso.getSettings!();
    setSettings(s);
  }

  function handleSelectSource(id: string) {
    setSelectedSourceId(id);
    window.videso.selectSource!(id);
  }

  async function handleResolutionChange(r: Resolution) {
    await window.videso.setSetting!('resolution', r);
    setSettings((prev) => prev ? { ...prev, resolution: r } : prev);
  }

  async function handleWebcamToggle(enabled: boolean) {
    await window.videso.setSetting!('webcamEnabled', enabled);
    setSettings((prev) => prev ? { ...prev, webcamEnabled: enabled } : prev);
  }

  function handleRecord() {
    if (status.state === 'idle') {
      window.videso.startRecording!();
    } else if (status.state === 'recording') {
      window.videso.stopRecording!();
    }
  }

  const handleBeginCapture = useCallback(async (sourceId: string) => {
    try {
      const constraints: any = {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
          },
        },
      };

      const desktopStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = desktopStream;

      let recordStream: MediaStream;

      if (settings?.webcamEnabled) {
        try {
          const webcamStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 200, height: 200 },
            audio: false,
          });
          webcamStreamRef.current = webcamStream;

          // Canvas compositing
          const canvas = document.createElement('canvas');
          const videoTrack = desktopStream.getVideoTracks()[0];
          const trackSettings = videoTrack.getSettings();
          canvas.width = trackSettings.width || 1920;
          canvas.height = trackSettings.height || 1080;
          canvasRef.current = canvas;

          const ctx = canvas.getContext('2d')!;
          const desktopVideo = document.createElement('video');
          desktopVideo.srcObject = desktopStream;
          desktopVideo.muted = true;
          await desktopVideo.play();

          const webcamVideo = document.createElement('video');
          webcamVideo.srcObject = webcamStream;
          webcamVideo.muted = true;
          await webcamVideo.play();

          const pipSize = 160;
          const pipMargin = 24;

          function drawFrame() {
            ctx.drawImage(desktopVideo, 0, 0, canvas.width, canvas.height);

            // Circular webcam PiP (bottom-left)
            const x = pipMargin + pipSize / 2;
            const y = canvas.height - pipMargin - pipSize / 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, pipSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(webcamVideo, x - pipSize / 2, y - pipSize / 2, pipSize, pipSize);
            ctx.restore();

            // Circle border
            ctx.beginPath();
            ctx.arc(x, y, pipSize / 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.lineWidth = 3;
            ctx.stroke();

            animFrameRef.current = requestAnimationFrame(drawFrame);
          }
          drawFrame();

          recordStream = canvas.captureStream(30);
        } catch {
          recordStream = desktopStream;
        }
      } else {
        recordStream = desktopStream;
      }

      const mediaRecorder = new MediaRecorder(recordStream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const buffer = await blob.arrayBuffer();
        window.videso.sendRecordingData!(buffer);
        cleanup();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
    } catch (err) {
      console.error('Failed to start capture:', err);
    }
  }, [settings?.webcamEnabled]);

  const handleStopCapture = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  function cleanup() {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
    webcamStreamRef.current = null;
    canvasRef.current = null;
    mediaRecorderRef.current = null;
  }

  if (!settings) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="title">Videso</span>
        <button className="icon-btn" onClick={() => setView(view === 'main' ? 'settings' : 'main')}>
          {view === 'main' ? '⚙' : '←'}
        </button>
      </div>

      {view === 'settings' ? (
        <SettingsView settings={settings} onUpdate={loadSettings} />
      ) : (
        <>
          <SourcePicker
            sources={sources}
            selectedId={selectedSourceId}
            onSelect={handleSelectSource}
            onRefresh={loadSources}
          />
          <div className="controls">
            <ResolutionPicker value={settings.resolution} onChange={handleResolutionChange} />
            <WebcamToggle enabled={settings.webcamEnabled} onToggle={handleWebcamToggle} />
          </div>
          <RecordButton state={status.state} onClick={handleRecord} />
          {status.state === 'converting' && (
            <div className="converting-bar">
              <div className="progress" style={{ width: `${status.progress || 0}%` }} />
              <span>Converting... {status.progress || 0}%</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
