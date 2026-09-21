import React, { useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';

interface HoloVisualizerProps {
  isPlaying: boolean;
  accentColor?: string;
}

export const HoloVisualizer: React.FC<HoloVisualizerProps> = ({ isPlaying, accentColor = '#00F0FF' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 28;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const analyser = audioService.getAnalyser();
      const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : 32);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      }

      const barWidth = width / barCount - 2;

      // Draw subtle holographic grid line in center
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < barCount; i++) {
        let value = 0;

        if (isPlaying) {
          // If we have real analyser frequency data, use it; else generate lively synth wave
          const freqVal = dataArray[i % dataArray.length] || 0;
          if (freqVal > 0) {
            value = freqVal / 255;
          } else {
            // Harmonic wave fallback when audio plays
            value = (Math.sin(phase + i * 0.4) * 0.5 + 0.5) * (Math.cos(phase * 0.7 + i * 0.3) * 0.4 + 0.6);
          }
        } else {
          // Idle ambient pulse
          value = (Math.sin(phase * 0.3 + i * 0.25) * 0.15 + 0.2) * 0.25;
        }

        const barHeight = Math.max(4, value * (height - 8));
        const x = i * (barWidth + 2) + 2;
        const y = (height - barHeight) / 2;

        // Gradient glow
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, accentColor);
        gradient.addColorStop(0.5, '#66FFFF');
        gradient.addColorStop(1, accentColor);

        ctx.fillStyle = gradient;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = isPlaying ? 8 : 2;

        // Rounded bar
        ctx.beginPath();
        const r = Math.min(barWidth / 2, 2);
        ctx.roundRect(x, y, barWidth, barHeight, r);
        ctx.fill();

        // Top and bottom spark dots when playing
        if (isPlaying && value > 0.4) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, y - 2, 1.2, 0, Math.PI * 2);
          ctx.arc(x + barWidth / 2, y + barHeight + 2, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;
      phase += isPlaying ? 0.18 : 0.04;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, accentColor]);

  return (
    <div className="holo-visualizer-container">
      <div className="holo-visualizer-glow-bg" />
      <canvas
        ref={canvasRef}
        width={340}
        height={56}
        className="holo-visualizer-canvas"
      />
    </div>
  );
};
