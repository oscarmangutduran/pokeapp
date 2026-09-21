import { useState, useEffect, useCallback } from 'react';
import { PokedexDevice } from './components/PokedexDevice';
import { KeypadModal } from './components/KeypadModal';
import { fetchPokemon } from './services/pokemonService';
import type { PokemonData } from './types';
import './App.css';

export function App() {
  const [currentNumber, setCurrentNumber] = useState<number>(25); // Start with Pikachu (#0025)
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isKeypadOpen, setIsKeypadOpen] = useState<boolean>(false);
  const [autoPlayCry, setAutoPlayCry] = useState<boolean>(false);

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
        />
      </main>

      {/* Direct Dial Keypad Modal */}
      <KeypadModal
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        onSelectNumber={handleNavigate}
        currentNumber={currentNumber}
      />
    </div>
  );
}

export default App;
