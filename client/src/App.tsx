import { useState, useEffect, useCallback } from 'react';
import { PokedexDevice } from './components/PokedexDevice';
import { KeypadModal } from './components/KeypadModal';
import { EditionSelectorModal } from './components/EditionSelectorModal';
import { EditionRosterDrawer } from './components/EditionRosterDrawer';
import { fetchPokemon, fetchEditionPokemonList } from './services/pokemonService';
import { POKEDEX_EDITIONS } from './services/editionsData';
import type { PokemonData, PokedexEdition, EditionPokemonEntry } from './types';
import './App.css';

export function App() {
  const [currentNumber, setCurrentNumber] = useState<number>(1); // Inicia siempre en el Pokémon #0001 (Bulbasaur)
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isKeypadOpen, setIsKeypadOpen] = useState<boolean>(false);
  const [isEditionModalOpen, setIsEditionModalOpen] = useState<boolean>(false);
  const [isRosterDrawerOpen, setIsRosterDrawerOpen] = useState<boolean>(false);
  const [autoPlayCry, setAutoPlayCry] = useState<boolean>(false);

  // Active Pokédex edition (defaults to Kanto)
  const [currentEdition, setCurrentEdition] = useState<PokedexEdition>(POKEDEX_EDITIONS[0]);
  const [roster, setRoster] = useState<EditionPokemonEntry[]>([]);
  const [loadingRoster, setLoadingRoster] = useState<boolean>(true);

  // Load roster when currentEdition changes
  useEffect(() => {
    let isCancelled = false;
    async function loadRoster() {
      setLoadingRoster(true);
      try {
        const list = await fetchEditionPokemonList(currentEdition.id);
        if (!isCancelled) {
          setRoster(list);
          // Ensure we are on a valid Pokémon of this edition, or default to the first one
          const isPresent = list.some((p) => p.nationalNumber === currentNumber);
          if (!isPresent && list.length > 0) {
            setCurrentNumber(list[0].nationalNumber);
          }
        }
      } catch (err) {
        console.error('Error cargando róster de edición:', err);
      } finally {
        if (!isCancelled) {
          setLoadingRoster(false);
        }
      }
    }

    loadRoster();

    return () => {
      isCancelled = true;
    };
  }, [currentEdition.id]);

  const loadPokemonData = useCallback(async (idOrName: number | string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPokemon(idOrName);
      setPokemon(data);
      setCurrentNumber(data.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido al cargar el Pokémon';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPokemonData(currentNumber);
  }, [currentNumber, loadPokemonData]);

  const handleNavigate = (num: number) => {
    setCurrentNumber(num);
  };

  const handleSearch = (term: string) => {
    loadPokemonData(term);
  };

  const handleSelectEdition = async (edition: PokedexEdition) => {
    setCurrentEdition(edition);
    try {
      const list = await fetchEditionPokemonList(edition.id);
      if (list.length > 0) {
        setCurrentNumber(list[0].nationalNumber);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="pokedex-app-wrapper">
      {/* Dynamic ambient sci-fi background particles & grid */}
      <div className="ambient-particles" />
      <div className="ambient-grid-overlay" />

      {/* Main Holo-Dex Container */}
      <main className="pokedex-viewport">
        <PokedexDevice
          pokemon={pokemon}
          loading={loading}
          error={error}
          currentNumber={currentNumber}
          onNavigate={handleNavigate}
          onOpenKeypad={() => setIsKeypadOpen(true)}
          onSearch={handleSearch}
          autoPlayCry={autoPlayCry}
          setAutoPlayCry={setAutoPlayCry}
          currentEdition={currentEdition}
          roster={roster}
          onOpenEditionSelector={() => setIsEditionModalOpen(true)}
          onOpenRosterDrawer={() => setIsRosterDrawerOpen(true)}
        />
      </main>

      {/* Direct Dial Keypad Modal */}
      <KeypadModal
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        onSelectNumber={handleNavigate}
        currentNumber={currentNumber}
      />

      {/* All Editions Selector Modal */}
      <EditionSelectorModal
        isOpen={isEditionModalOpen}
        onClose={() => setIsEditionModalOpen(false)}
        currentEditionId={currentEdition.id}
        onSelectEdition={handleSelectEdition}
      />

      {/* Active Edition Roster Browser Drawer / Modal */}
      <EditionRosterDrawer
        isOpen={isRosterDrawerOpen}
        onClose={() => setIsRosterDrawerOpen(false)}
        edition={currentEdition}
        roster={roster}
        loadingRoster={loadingRoster}
        currentNationalId={currentNumber}
        onSelectPokemon={handleNavigate}
        onOpenEditionSelector={() => {
          setIsRosterDrawerOpen(false);
          setIsEditionModalOpen(true);
        }}
      />
    </div>
  );
}

export default App;
