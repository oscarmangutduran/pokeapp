import type { PokemonData, VersionFlavorText, RegionalDexEntry, EditionPokemonEntry } from '../types';
import { EDITION_MAP, VERSION_NAMES } from './editionsData';

const BASE_URL = 'https://pokeapi.co/api/v2';
const cache = new Map<number | string, PokemonData>();
const editionListCache = new Map<string, EditionPokemonEntry[]>();

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
    version: { name: string };
  }>;
  genera: Array<{
    genus: string;
    language: { name: string };
  }>;
  pokedex_numbers: Array<{
    entry_number: number;
    pokedex: { name: string; url: string };
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

  let flavorText = '';
  let genus = '';
  const flavorTextsByVersion: VersionFlavorText[] = [];
  const regionalEntries: RegionalDexEntry[] = [];

  try {
    const speciesRes = await fetch(`${BASE_URL}/pokemon-species/${raw.id}`);
    if (speciesRes.ok) {
      const speciesRaw: SpeciesRaw = await speciesRes.json();

      // Regional pokedex numbers
      if (speciesRaw.pokedex_numbers && Array.isArray(speciesRaw.pokedex_numbers)) {
        speciesRaw.pokedex_numbers.forEach(pn => {
          regionalEntries.push({
            pokedexName: pn.pokedex.name,
            entryNumber: pn.entry_number,
          });
        });
      }

      // Group flavor texts by game version prioritizing Spanish
      const versionMap = new Map<string, { text: string; lang: string }>();

      speciesRaw.flavor_text_entries.forEach(entry => {
        const v = entry.version.name;
        const lang = entry.language.name;
        const cleanText = entry.flavor_text.replace(/[\n\f]/g, ' ');

        if (lang === 'es') {
          versionMap.set(v, { text: cleanText, lang: 'es' });
        } else if (lang === 'en' && !versionMap.has(v)) {
          versionMap.set(v, { text: cleanText, lang: 'en' });
        }
      });

      versionMap.forEach((val, v) => {
        flavorTextsByVersion.push({
          version: v,
          versionName: VERSION_NAMES[v] || (v.charAt(0).toUpperCase() + v.slice(1).replace(/-/g, ' ')),
          flavorText: val.text,
          language: val.lang,
        });
      });

      // Default flavor text (preferably in Spanish)
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
    flavorTextsByVersion,
    regionalEntries,
  };

  cache.set(pokemonData.id, pokemonData);
  cache.set(pokemonData.name.toLowerCase(), pokemonData);

  return pokemonData;
}

/**
 * Fetches the list of Pokémon in a specific edition / regional Pokédex.
 */
export async function fetchEditionPokemonList(editionId: string): Promise<EditionPokemonEntry[]> {
  if (editionListCache.has(editionId)) {
    return editionListCache.get(editionId)!;
  }

  const edition = EDITION_MAP[editionId] || EDITION_MAP.national;

  if (edition.id === 'national') {
    const res = await fetch(`${BASE_URL}/pokemon?limit=1025`);
    if (!res.ok) throw new Error('Error al cargar la Pokédex Nacional');
    const data = await res.json();
    const list: EditionPokemonEntry[] = data.results.map((p: { name: string; url: string }, index: number) => {
      const nationalId = index + 1;
      return {
        regionalNumber: nationalId,
        nationalNumber: nationalId,
        name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
        formattedRegionalId: `#${String(nationalId).padStart(4, '0')}`,
        formattedNationalId: `#${String(nationalId).padStart(4, '0')}`,
        spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nationalId}.png`,
      };
    });
    editionListCache.set(editionId, list);
    return list;
  }

  // Regional Pokédex from PokeAPI
  const apiName = edition.pokedexApiName || edition.id;
  const res = await fetch(`${BASE_URL}/pokedex/${apiName}`);
  if (!res.ok) {
    throw new Error(`Error al cargar la Pokédex de ${edition.name}`);
  }

  const data = await res.json();
  const list: EditionPokemonEntry[] = data.pokemon_entries.map((entry: {
    entry_number: number;
    pokemon_species: { name: string; url: string };
  }) => {
    const urlParts = entry.pokemon_species.url.split('/').filter(Boolean);
    const nationalId = parseInt(urlParts[urlParts.length - 1], 10);
    const regNum = entry.entry_number;

    return {
      regionalNumber: regNum,
      nationalNumber: nationalId,
      name: entry.pokemon_species.name.charAt(0).toUpperCase() + entry.pokemon_species.name.slice(1),
      formattedRegionalId: `#${String(regNum).padStart(4, '0')}`,
      formattedNationalId: `#${String(nationalId).padStart(4, '0')}`,
      spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nationalId}.png`,
    };
  });

  editionListCache.set(editionId, list);
  return list;
}
