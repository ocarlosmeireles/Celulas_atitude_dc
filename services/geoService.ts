
import type { Coordinates } from '../types';

// Mocked geocoding as a real API (e.g., Google Maps) would require an API key.
// This function simulates converting an address to coordinates by returning a
// location near Duque de Caxias, RJ, with a random offset.
export const geocodeAddress = async (address: string): Promise<Coordinates> => {
  console.log(`Geocoding (mocked) for: ${address}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  const baseLat = -22.7859; // Duque de Caxias
  const baseLng = -43.3117;
  return {
    latitude: baseLat + (Math.random() - 0.5) * 0.1,
    longitude: baseLng + (Math.random() - 0.5) * 0.1,
  };
};

export const fetchAddressFromCEP = async (cep: string) => {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) {
      throw new Error('CEP não encontrado');
    }
    const data = await response.json();
    if (data.erro) {
      throw new Error('CEP inválido');
    }
    return {
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
      fullAddress: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
    };
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
};

// Calculate distance between two points using the Haversine formula
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};
