import React, { useState, useMemo } from 'react';
import { X, Search, Layers, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { audioService } from '../services/audioService';
import type { EditionPokemonEntry, PokedexEdition } from '../types';

interface EditionRosterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  edition: PokedexEdition;
  roster: EditionPokemonEntry[];
  loadingRoster: boolean;
  currentNationalId: number;
  onSelectPokemon: (nationalNumber: number) => void;
  onOpenEditionSelector: () => void;
}

export const EditionRosterDrawer: React.FC<EditionRosterDrawerProps> = ({
  isOpen,
  onClose,
  edition,
  roster,
  loadingRoster,
  currentNationalId,
  onSelectPokemon,
  onOpenEditionSelector,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return roster;
    const term = searchTerm.trim().toLowerCase();
    return roster.filter((p) => {
      const matchName = p.name.toLowerCase().includes(term);
      const matchReg = p.formattedRegionalId.includes(term) || String(p.regionalNumber) === term;
      const matchNat = p.formattedNationalId.includes(term) || String(p.nationalNumber) === term;
      return matchName || matchReg || matchNat;
    });
  }, [roster, searchTerm]);

  if (!isOpen) return null;

  const handleSelect = (natId: number) => {
    audioService.playBeep(980, 0.05);
    onSelectPokemon(natId);
    onClose();
  };

  return (
    <div className="holo-modal-overlay" onClick={onClose}>
      <div
        className="holo-modal-card roster-drawer-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          '--edition-accent': edition.accentColor,
        } as React.CSSProperties}
      >
        {/* Drawer Header */}
        <div className="holo-modal-header">
          <div className="holo-modal-title">
            <Layers size={18} style={{ color: edition.accentColor }} />
            <span>RÓSTER COMPLETO // POKÉDEX DE {edition.name.toUpperCase()}</span>
          </div>

          <div className="roster-header-actions">
            <button
              className="holo-edition-badge-btn"
              onClick={() => {
                audioService.playBeep(850, 0.04);
                onOpenEditionSelector();
              }}
              title="Cambiar edición"
            >
              <span className="dot" style={{ backgroundColor: edition.accentColor }} />
              <span>{edition.name} ({edition.generation})</span>
              <SlidersHorizontal size={13} />
            </button>

            <button className="holo-icon-btn close-btn" onClick={onClose} title="Cerrar lista">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="roster-filter-bar">
          <div className="roster-search-box">
            <Search size={15} className="roster-search-icon" />
            <input
              type="text"
              placeholder={`Buscar en Pokédex de ${edition.name} (nombre o #)...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="roster-search-input"
              autoFocus
            />
            {searchTerm && (
              <button
                className="roster-clear-search"
                onClick={() => setSearchTerm('')}
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="roster-count-stat">
            <span>{filteredList.length}</span> de <span>{roster.length}</span> especies
          </div>
        </div>

        {/* Roster Grid / List */}
        <div className="roster-scroll-container">
          {loadingRoster ? (
            <div className="roster-loading-state">
              <div className="holo-spinner" />
              <p>DESCARGANDO RÓSTER DE {edition.name.toUpperCase()}...</p>
              <span>Sincronizando índices con la base de datos</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="roster-empty-state">
              <p>No se encontraron Pokémon con "{searchTerm}" en esta edición.</p>
            </div>
          ) : (
            <div className="roster-grid">
              {filteredList.map((pkmn) => {
                const isCurrent = pkmn.nationalNumber === currentNationalId;

                return (
                  <div
                    key={`${edition.id}-${pkmn.regionalNumber}-${pkmn.nationalNumber}`}
                    className={`roster-item-card ${isCurrent ? 'active-pokemon' : ''}`}
                    onClick={() => handleSelect(pkmn.nationalNumber)}
                  >
                    <div className="roster-card-ids">
                      <span className="roster-reg-id" title="Número en esta Pokédex regional">
                        {pkmn.formattedRegionalId}
                      </span>
                      {edition.id !== 'national' && (
                        <span className="roster-nat-id" title="Número Nacional global">
                          {pkmn.formattedNationalId}
                        </span>
                      )}
                    </div>

                    <div className="roster-sprite-wrapper">
                      <img
                        src={pkmn.spriteUrl}
                        alt={pkmn.name}
                        className="roster-thumb-img"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback if sprite fails
                          (e.target as HTMLImageElement).src =
                            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
                        }}
                      />
                    </div>

                    <div className="roster-name-row">
                      <span className="roster-pkmn-name">{pkmn.name}</span>
                      <ChevronRight size={13} className="roster-arrow-icon" />
                    </div>

                    {isCurrent && <div className="current-indicator-strip" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
