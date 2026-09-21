import React, { useState } from 'react';
import { audioService } from '../services/audioService';
import { Delete, ArrowRight, X, Sparkles } from 'lucide-react';

interface KeypadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNumber: (num: number) => void;
  currentNumber: number;
}

const GENERATIONS = [
  { gen: 'Gen 1', start: 1, label: '#001 Kanto' },
  { gen: 'Gen 2', start: 152, label: '#152 Johto' },
  { gen: 'Gen 3', start: 252, label: '#252 Hoenn' },
  { gen: 'Gen 4', start: 387, label: '#387 Sinnoh' },
  { gen: 'Gen 5', start: 494, label: '#494 Teselia' },
  { gen: 'Gen 6', start: 650, label: '#650 Kalos' },
  { gen: 'Gen 7', start: 722, label: '#722 Alola' },
  { gen: 'Gen 8', start: 810, label: '#810 Galar' },
  { gen: 'Gen 9', start: 906, label: '#906 Paldea' },
];

export const KeypadModal: React.FC<KeypadModalProps> = ({
  isOpen,
  onClose,
  onSelectNumber,
  currentNumber,
}) => {
  const [inputVal, setInputVal] = useState<string>('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    audioService.playBeep(920, 0.05);
    if (inputVal.length >= 4) return;
    const nextVal = inputVal + digit;
    const num = parseInt(nextVal, 10);
    if (num <= 1025) {
      setInputVal(nextVal);
    }
  };

  const handleBackspace = () => {
    audioService.playBeep(640, 0.05);
    setInputVal(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    audioService.playBeep(520, 0.06);
    setInputVal('');
  };

  const handleConfirm = () => {
    const num = parseInt(inputVal, 10);
    if (num >= 1 && num <= 1025) {
      audioService.playBeep(1200, 0.12);
      onSelectNumber(num);
      setInputVal('');
      onClose();
    }
  };

  const handleGenJump = (start: number) => {
    audioService.playBeep(1100, 0.08);
    onSelectNumber(start);
    setInputVal('');
    onClose();
  };

  const handleRandom = () => {
    const randomNum = Math.floor(Math.random() * 1025) + 1;
    audioService.playBeep(1300, 0.1);
    onSelectNumber(randomNum);
    setInputVal('');
    onClose();
  };

  return (
    <div className="holo-modal-overlay" onClick={onClose}>
      <div className="holo-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="holo-modal-header">
          <div className="holo-modal-title">
            <span className="holo-dot" />
            DIAL DIRECTO POR NÚMERO POKÉDEX
          </div>
          <button className="holo-icon-btn close-btn" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Display Screen */}
        <div className="holo-keypad-screen">
          <span className="holo-screen-label">NÚMERO OBJETIVO</span>
          <div className="holo-screen-number">
            #{inputVal ? inputVal.padStart(4, '0') : String(currentNumber).padStart(4, '0')}
          </div>
          <span className="holo-screen-range">Rango válido: #0001 - #1025</span>
        </div>

        {/* Numeric Grid */}
        <div className="holo-keypad-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              className="holo-key-btn"
              onClick={() => handleDigit(String(n))}
            >
              {n}
            </button>
          ))}
          <button className="holo-key-btn func-clear" onClick={handleClear}>
            C
          </button>
          <button
            className="holo-key-btn"
            onClick={() => handleDigit('0')}
          >
            0
          </button>
          <button className="holo-key-btn func-del" onClick={handleBackspace} title="Borrar">
            <Delete size={18} />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="holo-keypad-actions">
          <button className="holo-action-btn random-btn" onClick={handleRandom}>
            <Sparkles size={16} />
            Aleatorio
          </button>
          <button
            className="holo-action-btn confirm-btn"
            disabled={!inputVal || parseInt(inputVal, 10) < 1}
            onClick={handleConfirm}
          >
            Ir a #{inputVal ? inputVal.padStart(4, '0') : '----'}
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Quick Gen Selector */}
        <div className="holo-gens-section">
          <span className="holo-gens-title">ACCESO RÁPIDO POR GENERACIÓN</span>
          <div className="holo-gens-grid">
            {GENERATIONS.map((g) => (
              <button
                key={g.gen}
                className="holo-gen-chip"
                onClick={() => handleGenJump(g.start)}
              >
                <strong>{g.gen}</strong>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
