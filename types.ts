export enum Rede {
  Amarela = 'Amarela',
  Verde = 'Verde',
  Laranja = 'Laranja',
  Azul = 'Azul',
}

export enum Status {
  Ativa = 'Ativa',
  Inativa = 'Inativa',
}

export enum Tipo {
  Adulto = 'Adulto',
  Kids = 'Kids',
  Homens = 'Homens',
  Mulheres = 'Mulheres',
  Jovens = 'Jovens',
}

export interface Celula {
  ID_Celula: string;
  Nome_Celula: string;
  Rede: Rede;
  Tipo: Tipo;
  Nome_Lider_1: string;
  Telefone_Lider_1: string;
  Nome_Lider_2?: string;
  Telefone_Lider_2?: string;
  Nome_Lider_Auxiliar?: string;
  Telefone_Lider_Auxiliar?: string;
  Horario_Celula: string;
  Endereco_Completo: string;
  CEP: string;
  Latitude: number;
  Longitude: number;
  Status: Status;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type View = 'visitor' | 'admin';