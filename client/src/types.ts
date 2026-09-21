export interface PokemonCry {
  latest: string | null;
  legacy: string | null;
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
}

export type CryVersion = 'latest' | 'legacy';
