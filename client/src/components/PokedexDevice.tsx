import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Hash,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  Maximize2,
  Minimize2,
  Radio,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import type { PokemonData, CryVersion } from '../types';
import { audioService } from '../services/audioService';
import { HoloVisualizer } from './HoloVisualizer';
import { TYPE_COLORS, TYPE_TRANSLATIONS } from '../services/pokemonService';

interface PokedexDeviceProps {
  pokemon: PokemonData | null;
  loading: boolean;
  error: string | null;
  currentNumber: number;
  onNavigate: (newNumber: number) => void;
  onOpenKeypad: () => void;
  onSearch: (term: string) => void;
  autoPlayCry: boolean;
  setAutoPlayCry: (val: boolean) => void;
}

export const PokedexDevice: React.FC<PokedexDeviceProps> = ({
  pokemon,
  loading,
  error,
  currentNumber,
  onNavigate,
  onOpenKeypad,
  onSearch,
  autoPlayCry,
  setAutoPlayCry,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isShiny, setIsShiny] = useState<boolean>(false);
  const [useAnimated, setUseAnimated] = useState<boolean>(true);
  const [cryVersion, setCryVersion] = useState<CryVersion>('latest');
  const [isPlayingCry, setIsPlayingCry] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [activeTab, setActiveTab] = useState<'info' | 'stats'>('info');
  const [searchInput, setSearchInput] = useState<string>('');

  // Handle auto-playing cry when Pokémon changes
  useEffect(() => {
    if (pokemon && autoPlayCry && isOpen) {
      const timer = setTimeout(() => {
        handlePlayCry();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [pokemon?.id, autoPlayCry, isOpen, cryVersion]);

  const toggleOpen = () => {
    const nextState = !isOpen;
    audioService.playMechanicalSlideSound(nextState);
    setIsOpen(nextState);
  };

  const handlePlayCry = () => {
    if (!pokemon) return;

    if (isPlayingCry) {
      audioService.stopCry();
      setIsPlayingCry(false);
      return;
    }

    const cryUrl = cryVersion === 'legacy' && pokemon.cries.legacy
      ? pokemon.cries.legacy
      : pokemon.cries.latest;

    if (!cryUrl) return;

    setIsPlayingCry(true);
    audioService.playPokemonCry(
      cryUrl,
      () => setIsPlayingCry(false),
      () => setIsPlayingCry(false)
    );
  };

  const handleToggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    audioService.setVolume(vol);
    if (isMuted && vol > 0) {
      setIsMuted(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    audioService.playBeep(980, 0.06);
    onSearch(searchInput.trim());
    setSearchInput('');
  };

  const handlePrev = () => {
    audioService.playBeep(780, 0.05);
    if (currentNumber > 1) {
      onNavigate(currentNumber - 1);
    } else {
      onNavigate(1025);
    }
  };

  const handleNext = () => {
    audioService.playBeep(880, 0.05);
    if (currentNumber < 1025) {
      onNavigate(currentNumber + 1);
    } else {
      onNavigate(1);
    }
  };

  const primaryType = pokemon?.types[0] || 'normal';
  const typeStyle = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;

  // Selected sprite
  const currentSprite = pokemon
    ? isShiny
      ? useAnimated && pokemon.sprites.animatedShiny
        ? pokemon.sprites.animatedShiny
        : pokemon.sprites.artworkShiny || pokemon.sprites.artwork
      : useAnimated && pokemon.sprites.animated
      ? pokemon.sprites.animated
      : pokemon.sprites.artwork
    : '';

  return (
    <div className={`pokedex-chassis ${isOpen ? 'device-open' : 'device-closed'}`}>
      {/* Top Metallic Crimson Cap */}
      <div className="chassis-cap chassis-cap-top">
        <div className="cap-metallic-gloss" />
        <div className="cap-grip-grooves left-groove" />
        <div className="cap-grip-grooves right-groove" />

        <div className="cap-center-notch">
          <div className="pokeball-rim-half top-rim">
            <div className="lens-sensor" />
          </div>
        </div>

        {/* Closed mode quick info */}
        {!isOpen && (
          <div className="closed-status-preview" onClick={toggleOpen}>
            <span className="closed-id">{pokemon?.formattedId || `#${String(currentNumber).padStart(4, '0')}`}</span>
            <span className="closed-name">{pokemon?.name || 'Iniciando...'}</span>
          </div>
        )}

        <button
          className="holo-cap-toggle-btn"
          onClick={toggleOpen}
          title={isOpen ? 'Cerrar Pokédex' : 'Desplegar Pokédex'}
        >
          {isOpen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          <span>{isOpen ? 'REPLEGAR' : 'DESPLEGAR'}</span>
        </button>
      </div>

      {/* Central Holographic Screen (Retracts/Expands) */}
      <div className="chassis-screen-slider">
        <div className="holo-screen-surface">
          {/* Scanline and holographic shimmer effects */}
          <div className="holo-scanlines" />
          <div className="holo-vignette" />

          {/* Top Holographic Navigation & Status Bar */}
          <header className="holo-topbar">
            <div className="holo-brand">
              <span className="holo-badge-icon">
                <Radio size={14} className="pulse-icon" />
              </span>
              <span className="holo-brand-text">KALOS HOLO-DEX 2.0</span>
            </div>

            <div className="holo-top-controls">
              <button
                className={`holo-mini-btn ${isMuted ? 'active' : ''}`}
                onClick={handleToggleMute}
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              <button
                className="holo-mini-btn"
                onClick={onOpenKeypad}
                title="Teclado numérico directo"
              >
                <Hash size={15} />
                <span className="mini-label">DIAL #</span>
              </button>
            </div>
          </header>

          {/* Search bar input */}
          <form className="holo-search-strip" onSubmit={handleSearchSubmit}>
            <Search size={14} className="holo-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o número (#)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="holo-search-input"
            />
            <button type="submit" className="holo-search-btn">
              SCAN
            </button>
          </form>

          {/* Screen Content Body */}
          <main className="holo-content-body">
            {loading ? (
              <div className="holo-loading-state">
                <div className="holo-spinner" />
                <p>TRANSMITIENDO DATOS HOLOGRÁFICOS...</p>
                <span>Sincronizando con la red de Kalos</span>
              </div>
            ) : error ? (
              <div className="holo-error-state">
                <p className="error-title">ERROR DE LECTURA</p>
                <p className="error-msg">{error}</p>
                <button
                  className="holo-retry-btn"
                  onClick={() => onNavigate(currentNumber)}
                >
                  <RotateCcw size={14} /> Reintentar
                </button>
              </div>
            ) : pokemon ? (
              <>
                {/* Pokémon Identification Header */}
                <div className="holo-poke-header">
                  <div className="holo-id-badge" onClick={onOpenKeypad} title="Cambiar número">
                    <span className="num-hash">NO.</span>
                    <span className="num-digits">{pokemon.formattedId}</span>
                  </div>
                  <div className="holo-name-container">
                    <h1 className="holo-poke-name">{pokemon.name}</h1>
                    {pokemon.genus && <span className="holo-genus">{pokemon.genus}</span>}
                  </div>
                  <div className="holo-type-pills">
                    {pokemon.types.map((type) => {
                      const tInfo = TYPE_COLORS[type] || TYPE_COLORS.normal;
                      return (
                        <span
                          key={type}
                          className="holo-type-pill"
                          style={{
                            borderColor: tInfo.border,
                            boxShadow: `0 0 10px ${tInfo.glow}`,
                          }}
                        >
                          <span
                            className="type-dot"
                            style={{ backgroundColor: tInfo.bg }}
                          />
                          {TYPE_TRANSLATIONS[type] || type.toUpperCase()}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Stage: Holographic Pokémon Display */}
                <div className="holo-stage-area">
                  <div
                    className="holo-pedestal-glow"
                    style={{ background: `radial-gradient(ellipse at center, ${typeStyle.glow} 0%, transparent 70%)` }}
                  />
                  <div className="holo-image-wrapper">
                    <img
                      src={currentSprite}
                      alt={pokemon.name}
                      className={`holo-pokemon-sprite ${isPlayingCry ? 'sound-reacting' : ''}`}
                    />
                  </div>

                  {/* Floating Sprite Controls */}
                  <div className="holo-stage-controls">
                    <button
                      className={`holo-pill-btn ${isShiny ? 'active' : ''}`}
                      onClick={() => {
                        audioService.playBeep(1100, 0.05);
                        setIsShiny(!isShiny);
                      }}
                      title="Alternar Forma Shiny"
                    >
                      <Sparkles size={14} />
                      <span>{isShiny ? 'SHINY' : 'NORMAL'}</span>
                    </button>

                    <button
                      className={`holo-pill-btn ${useAnimated ? 'active' : ''}`}
                      onClick={() => {
                        audioService.playBeep(950, 0.05);
                        setUseAnimated(!useAnimated);
                      }}
                      title="Alternar Sprite Animado / Arte Oficial"
                    >
                      <span>{useAnimated ? 'ANIMADO' : 'HD ARTE'}</span>
                    </button>
                  </div>
                </div>

                {/* SONIDO DEL POKÉMON (Feature Principal) */}
                <section className="holo-sound-station">
                  <div className="sound-station-header">
                    <div className="station-title">
                      <Volume2 size={16} className="sound-icon-glow" />
                      <span>REGISTRO ACÚSTICO // GRITO POKÉMON</span>
                    </div>

                    {/* Selector de versión de sonido: Latest vs Legacy */}
                    {pokemon.cries.legacy && (
                      <div className="cry-version-toggle">
                        <button
                          className={`version-btn ${cryVersion === 'latest' ? 'selected' : ''}`}
                          onClick={() => {
                            audioService.playBeep(850, 0.04);
                            setCryVersion('latest');
                          }}
                        >
                          Moderno
                        </button>
                        <button
                          className={`version-btn ${cryVersion === 'legacy' ? 'selected' : ''}`}
                          onClick={() => {
                            audioService.playBeep(700, 0.04);
                            setCryVersion('legacy');
                          }}
                        >
                          Retro 8-bit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Big Play Button & Soundwave Visualizer */}
                  <div className="sound-interactive-strip">
                    <button
                      className={`holo-big-play-btn ${isPlayingCry ? 'playing' : ''}`}
                      onClick={handlePlayCry}
                      title={isPlayingCry ? 'Detener sonido' : 'Reproducir grito del Pokémon'}
                    >
                      {isPlayingCry ? <Pause size={24} /> : <Play size={24} className="play-indent" />}
                      <span className="btn-label">{isPlayingCry ? 'SONANDO' : 'REPRODUCIR'}</span>
                    </button>

                    <div className="visualizer-wrapper">
                      <HoloVisualizer isPlaying={isPlayingCry} accentColor={typeStyle.border} />
                      <div className="visualizer-caption">
                        <span>FRECUENCIA DE AUDIO VOCAL</span>
                        <span className="cry-indicator">
                          {isPlayingCry ? 'TRANSMITIENDO EN VIVO' : 'EN ESPERA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sound Settings row */}
                  <div className="sound-sub-controls">
                    <label className="holo-checkbox-label">
                      <input
                        type="checkbox"
                        checked={autoPlayCry}
                        onChange={(e) => setAutoPlayCry(e.target.checked)}
                      />
                      <span>Auto-sonar al cambiar de Pokémon</span>
                    </label>

                    <div className="holo-volume-slider-group">
                      <Sliders size={13} />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="holo-range"
                      />
                      <span className="vol-percent">{Math.round(volume * 100)}%</span>
                    </div>
                  </div>
                </section>

                {/* Tabs: Info / Estadísticas */}
                <div className="holo-tabs-nav">
                  <button
                    className={`holo-tab ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => {
                      audioService.playBeep(900, 0.04);
                      setActiveTab('info');
                    }}
                  >
                    DATOS DE CAMPO
                  </button>
                  <button
                    className={`holo-tab ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => {
                      audioService.playBeep(900, 0.04);
                      setActiveTab('stats');
                    }}
                  >
                    ESTADÍSTICAS BASE
                  </button>
                </div>

                {activeTab === 'info' ? (
                  <div className="holo-tab-panel info-panel">
                    <div className="metrics-row">
                      <div className="metric-box">
                        <span className="metric-label">ALTURA</span>
                        <span className="metric-val">{pokemon.heightMeters.toFixed(1)} m</span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-label">PESO</span>
                        <span className="metric-val">{pokemon.weightKg.toFixed(1)} kg</span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-label">TIPO PRINCIPAL</span>
                        <span className="metric-val">
                          {TYPE_TRANSLATIONS[primaryType] || primaryType}
                        </span>
                      </div>
                    </div>

                    {pokemon.flavorText && (
                      <div className="holo-desc-box">
                        <div className="desc-title">REGISTRO DE LA POKÉDEX:</div>
                        <p className="desc-text">"{pokemon.flavorText}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="holo-tab-panel stats-panel">
                    <div className="stats-bars-list">
                      {[
                        { key: 'hp', label: 'PS', val: pokemon.stats.hp, max: 255 },
                        { key: 'atk', label: 'Ataque', val: pokemon.stats.attack, max: 190 },
                        { key: 'def', label: 'Defensa', val: pokemon.stats.defense, max: 250 },
                        { key: 'spAtk', label: 'Atq. Esp', val: pokemon.stats.spAtk, max: 194 },
                        { key: 'spDef', label: 'Def. Esp', val: pokemon.stats.spDef, max: 250 },
                        { key: 'speed', label: 'Velocidad', val: pokemon.stats.speed, max: 200 },
                      ].map((s) => (
                        <div key={s.key} className="stat-row">
                          <span className="stat-name">{s.label}</span>
                          <span className="stat-number">{s.val}</span>
                          <div className="stat-bar-track">
                            <div
                              className="stat-bar-fill"
                              style={{
                                width: `${Math.min(100, (s.val / s.max) * 100)}%`,
                                backgroundColor: typeStyle.border,
                                boxShadow: `0 0 8px ${typeStyle.glow}`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </main>

          {/* Bottom Holographic Quick Navigation */}
          <footer className="holo-footer-nav">
            <button
              className="holo-nav-btn prev-btn"
              onClick={handlePrev}
              title="Pokémon anterior"
            >
              <ChevronLeft size={20} />
              <span>#{String(currentNumber > 1 ? currentNumber - 1 : 1025).padStart(4, '0')}</span>
            </button>

            <button
              className="holo-nav-center-dial"
              onClick={onOpenKeypad}
              title="Abrir teclado numérico"
            >
              <Hash size={18} />
              <span>DIAL NÚMERO</span>
            </button>

            <button
              className="holo-nav-btn next-btn"
              onClick={handleNext}
              title="Pokémon siguiente"
            >
              <span>#{String(currentNumber < 1025 ? currentNumber + 1 : 1).padStart(4, '0')}</span>
              <ChevronRight size={20} />
            </button>
          </footer>
        </div>
      </div>

      {/* Bottom Metallic Crimson Cap */}
      <div className="chassis-cap chassis-cap-bottom">
        <div className="cap-metallic-gloss" />
        <div className="cap-grip-grooves left-groove" />
        <div className="cap-grip-grooves right-groove" />

        <div className="cap-center-notch">
          <div className="pokeball-rim-half bottom-rim">
            <div className="mic-sensor-dot" />
          </div>
        </div>
      </div>

      {/* Closed mode center core orb */}
      {!isOpen && (
        <div className="closed-pokeball-core" onClick={toggleOpen} title="Tocar para desplegar Pokédex">
          <div className="core-holo-band" />
          <div className="glowing-blue-orb">
            <div className="orb-inner-ring" />
            <div className="orb-center-dot" />
          </div>
          <span className="touch-to-open">TOCAR PARA ABRIR</span>
        </div>
      )}
    </div>
  );
};
