export interface PokemonCry {
  latest: string | null;
  legacy: string | null;
}

export interface VersionFlavorText {
  version: string;
  versionName: string;
  flavorText: string;
  language: string;
}

export interface RegionalDexEntry {
  pokedexName: string;
  entryNumber: number;
}

export interface PokemonData {
  id: number;
  name: string;
  formattedId: string;
  types: string[];
  heightMeters: number;
  weightKg: number;
  cries: PokemonCry;
  sprites: {
    artwork: string;
    artworkShiny: string;
    animated: string;
    animatedShiny: string;
    pixel: string;
  };
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  flavorText?: string;
  genus?: string;
  flavorTextsByVersion: VersionFlavorText[];
  regionalEntries: RegionalDexEntry[];
}

export type CryVersion = 'latest' | 'legacy';

export interface PokedexEdition {
  id: string;
  name: string;
  region: string;
  generation: string;
  games: string;
  accentColor: string;
  pokedexApiName?: string;
  nationalRange?: { start: number; end: number };
  totalCount: number;
  description: string;
  iconPokemonId: number;
}

export interface EditionPokemonEntry {
  regionalNumber: number;
  nationalNumber: number;
  name: string;
  formattedRegionalId: string;
  formattedNationalId: string;
  spriteUrl: string;
}
