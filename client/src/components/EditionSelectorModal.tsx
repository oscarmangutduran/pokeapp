import React from 'react';
import { X, Check, Disc, Sparkles } from 'lucide-react';
import { POKEDEX_EDITIONS } from '../services/editionsData';
import { audioService } from '../services/audioService';
import type { PokedexEdition } from '../types';

interface EditionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEditionId: string;
  onSelectEdition: (edition: PokedexEdition) => void;
}

export const EditionSelectorModal: React.FC<EditionSelectorModalProps> = ({
  isOpen,
  onClose,
  currentEditionId,
  onSelectEdition,
}) => {
  if (!isOpen) return null;

  const handleSelect = (edition: PokedexEdition) => {
    audioService.playBeep(1050, 0.08);
    onSelectEdition(edition);
    onClose();
  };

  return (
    <div className="holo-modal-overlay" onClick={onClose}>
      <div
        className="holo-modal-card edition-selector-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="holo-modal-header">
          <div className="holo-modal-title">
            <Disc size={18} className="spin-slow text-cyan-400" />
            <span>BASE DE DATOS: TODAS LAS EDICIONES DE LA POKÉDEX</span>
          </div>
          <button className="holo-icon-btn close-btn" onClick={onClose} title="Cerrar selector">
            <X size={18} />
          </button>
        </div>

        {/* Subtitle / Description */}
        <div className="edition-modal-intro">
          <p>
            Selecciona la edición o generación para sintonizar los registros de la Pokédex,
            su numeración regional, catálogo de especies y descripciones de campo originales.
          </p>
        </div>

        {/* Editions Grid */}
        <div className="editions-grid-scroll">
          {POKEDEX_EDITIONS.map((ed) => {
            const isSelected = ed.id === currentEditionId;
            const isFeatured = ed.id === 'national';
            const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${ed.iconPokemonId}.png`;

            return (
              <div
                key={ed.id}
                className={`edition-card ${isSelected ? 'edition-active' : ''} ${isFeatured ? 'edition-card-featured' : ''}`}
                style={{
                  '--edition-accent': ed.accentColor,
                } as React.CSSProperties}
                onClick={() => handleSelect(ed)}
              >
                <div className="edition-card-glow" />

                <div className="edition-card-header">
                  <div className="edition-gen-tag">
                    {isFeatured ? (
                      <span className="featured-sparkle-pill">
                        <Sparkles size={12} /> TODAS LAS EDICIONES COMPILADAS
                      </span>
                    ) : (
                      ed.generation
                    )}
                  </div>
                  <div className="edition-count-badge">
                    <span>{ed.totalCount}</span> Pkmn
                  </div>
                </div>

                <div className="edition-card-body">
                  <div className="edition-icon-wrapper">
                    <img
                      src={spriteUrl}
                      alt={ed.name}
                      className="edition-pokemon-thumb"
                      loading="lazy"
                    />
                  </div>

                  <div className="edition-info">
                    <div className="edition-region-name">{ed.name}</div>
                    <div className="edition-games-list">{ed.games}</div>
                    <p className="edition-desc-snippet">{ed.description}</p>
                  </div>
                </div>

                <div className="edition-card-footer">
                  {isSelected ? (
                    <div className="active-badge">
                      <Check size={14} />
                      <span>EDICIÓN SINTONIZADA</span>
                    </div>
                  ) : (
                    <div className="select-action-label">
                      <Sparkles size={13} />
                      <span>SINTONIZAR POKÉDEX</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
