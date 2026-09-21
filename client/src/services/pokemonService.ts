import type { PokemonData } from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2';
const cache = new Map<number | string, PokemonData>();

export const TYPE_COLORS: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  normal: { bg: '#919AA2', border: '#A8A878', glow: 'rgba(168, 168, 120, 0.4)', text: '#FFFFFF' },
  fire: { bg: '#FF4422', border: '#F08030', glow: 'rgba(240, 128, 48, 0.5)', text: '#FFFFFF' },
  water: { bg: '#3399FF', border: '#6890F0', glow: 'rgba(104, 144, 240, 0.5)', text: '#FFFFFF' },
  electric: { bg: '#FFCC00', border: '#F8D030', glow: 'rgba(248, 208, 48, 0.6)', text: '#1A1A1A' },
  grass: { bg: '#77CC55', border: '#78C850', glow: 'rgba(120, 200, 80, 0.5)', text: '#FFFFFF' },
  ice: { bg: '#66CCFF', border: '#98D8D8', glow: 'rgba(152, 216, 216, 0.6)', text: '#1A1A1A' },
  fighting: { bg: '#BB5544', border: '#C03028', glow: 'rgba(192, 48, 40, 0.5)', text: '#FFFFFF' },
  poison: { bg: '#AA5599', border: '#A040A0', glow: 'rgba(160, 64, 160, 0.5)', text: '#FFFFFF' },
  ground: { bg: '#DDBB55', border: '#E0C068', glow: 'rgba(224, 192, 104, 0.5)', text: '#FFFFFF' },
  flying: { bg: '#8899FF', border: '#A890F0', glow: 'rgba(168, 144, 240, 0.5)', text: '#FFFFFF' },
  psychic: { bg: '#FF5599', border: '#F85888', glow: 'rgba(248, 88, 136, 0.5)', text: '#FFFFFF' },
  bug: { bg: '#AABB22', border: '#A8B820', glow: 'rgba(168, 184, 32, 0.5)', text: '#FFFFFF' },
  rock: { bg: '#BBAA66', border: '#B8A038', glow: 'rgba(184, 160, 56, 0.5)', text: '#FFFFFF' },
  ghost: { bg: '#6666BB', border: '#705898', glow: 'rgba(112, 88, 152, 0.5)', text: '#FFFFFF' },
  dragon: { bg: '#7766EE', border: '#7038F8', glow: 'rgba(112, 56, 248, 0.5)', text: '#FFFFFF' },
  dark: { bg: '#775544', border: '#705848', glow: 'rgba(112, 88, 72, 0.5)', text: '#FFFFFF' },
  steel: { bg: '#AAAABB', border: '#B8B8D0', glow: 'rgba(184, 184, 208, 0.5)', text: '#FFFFFF' },
  fairy: { bg: '#EE99EE', border: '#EE99AC', glow: 'rgba(238, 153, 172, 0.6)', text: '#1A1A1A' },
};

export const TYPE_TRANSLATIONS: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  electric: 'Eléctrico',
  grass: 'Planta',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada',
};

interface PokeApiRaw {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{ slot: number; type: { name: string; url: string } }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
  cries: {
    latest: string | null;
    legacy: string | null;
  };
  sprites: {
    front_default: string;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
        front_shiny: string | null;
      };
      showdown?: {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
  };
}

interface SpeciesRaw {
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
  genera: Array<{
    genus: string;
    language: { name: string };
  }>;
}

export async function fetchPokemon(idOrName: string | number): Promise<PokemonData> {
  const query = typeof idOrName === 'string' ? idOrName.trim().toLowerCase() : idOrName;

  if (cache.has(query)) {
    return cache.get(query)!;
  }

  const res = await fetch(`${BASE_URL}/pokemon/${query}`);
  if (!res.ok) {
    throw new Error(`No se encontró el Pokémon #${query}`);
  }

  const raw: PokeApiRaw = await res.json();

  // Try fetching species for description and genus in Spanish
  let flavorText = '';
  let genus = '';

  try {
    const speciesRes = await fetch(`${BASE_URL}/pokemon-species/${raw.id}`);
    if (speciesRes.ok) {
      const speciesRaw: SpeciesRaw = await speciesRes.json();
      const esEntry = speciesRaw.flavor_text_entries.find(e => e.language.name === 'es');
      const enEntry = speciesRaw.flavor_text_entries.find(e => e.language.name === 'en');
      const text = esEntry?.flavor_text || enEntry?.flavor_text || '';
      flavorText = text.replace(/[\n\f]/g, ' ');

      const esGenus = speciesRaw.genera.find(g => g.language.name === 'es');
      const enGenus = speciesRaw.genera.find(g => g.language.name === 'en');
      genus = esGenus?.genus || enGenus?.genus || '';
    }
  } catch {
    // Graceful fallback if species fail
  }

  const artwork = raw.sprites.other?.['official-artwork']?.front_default || raw.sprites.front_default || '';
  const artworkShiny = raw.sprites.other?.['official-artwork']?.front_shiny || '';
  const animated = raw.sprites.other?.showdown?.front_default || raw.sprites.front_default || '';
  const animatedShiny = raw.sprites.other?.showdown?.front_shiny || artworkShiny;

  const statMap: Record<string, number> = {};
  raw.stats.forEach(s => {
    statMap[s.stat.name] = s.base_stat;
  });

  const pokemonData: PokemonData = {
    id: raw.id,
    name: raw.name.charAt(0).toUpperCase() + raw.name.slice(1),
    formattedId: `#${String(raw.id).padStart(4, '0')}`,
    types: raw.types.map(t => t.type.name),
    heightMeters: raw.height / 10,
    weightKg: raw.weight / 10,
    cries: {
      latest: raw.cries?.latest || `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${raw.id}.ogg`,
      legacy: raw.cries?.legacy || null,
    },
    sprites: {
      artwork,
      artworkShiny,
      animated,
      animatedShiny,
      pixel: raw.sprites.front_default,
    },
    stats: {
      hp: statMap['hp'] || 0,
      attack: statMap['attack'] || 0,
      defense: statMap['defense'] || 0,
      spAtk: statMap['special-attack'] || 0,
      spDef: statMap['special-defense'] || 0,
      speed: statMap['speed'] || 0,
    },
    flavorText,
    genus,
  };

  cache.set(pokemonData.id, pokemonData);
  cache.set(pokemonData.name.toLowerCase(), pokemonData);

  return pokemonData;
}
