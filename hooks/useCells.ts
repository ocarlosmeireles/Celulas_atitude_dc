import { useState, useEffect, useCallback } from 'react';
import type { Celula } from '../types';
import { Rede, Status, Tipo } from '../types';

const MOCK_CELLS: Celula[] = [
  {
    ID_Celula: '1',
    Nome_Celula: 'Célula Ágape',
    Rede: Rede.Amarela,
    Tipo: Tipo.Adulto,
    Nome_Lider_1: 'João da Silva',
    Telefone_Lider_1: '21987654321',
    Nome_Lider_2: 'Ana Souza',
    Telefone_Lider_2: '21988881111',
    Horario_Celula: 'Toda terça-feira, às 20:00',
    Endereco_Completo: 'Rua das Flores, 10, Jardim Primavera, Duque de Caxias - RJ',
    CEP: '25215-260',
    Latitude: -22.788,
    Longitude: -43.315,
    Status: Status.Ativa,
  },
  {
    ID_Celula: '2',
    Nome_Celula: 'Célula Nova Vida',
    Rede: Rede.Verde,
    Tipo: Tipo.Jovens,
    Nome_Lider_1: 'Maria Oliveira',
    Telefone_Lider_1: '21912345678',
    Horario_Celula: 'Toda quinta-feira, às 19:30',
    Endereco_Completo: 'Avenida Brasil, 500, Centro, Duque de Caxias - RJ',
    CEP: '25070-000',
    Latitude: -22.785,
    Longitude: -43.311,
    Status: Status.Ativa,
  },
  {
    ID_Celula: '3',
    Nome_Celula: 'Célula da Paz',
    Rede: Rede.Laranja,
    Tipo: Tipo.Mulheres,
    Nome_Lider_1: 'Carlos Pereira',
    Telefone_Lider_1: '21988887777',
    Nome_Lider_Auxiliar: 'Mariana Costa',
    Telefone_Lider_Auxiliar: '21977778888',
    Horario_Celula: 'Toda quarta-feira, às 20:00',
    Endereco_Completo: 'Rua dos Lírios, 123, Bairro 25 de Agosto, Duque de Caxias - RJ',
    CEP: '25075-120',
    Latitude: -22.79,
    Longitude: -43.30,
    Status: Status.Inativa,
  },
    {
    ID_Celula: '4',
    Nome_Celula: 'Célula da Fé',
    Rede: Rede.Azul,
    Tipo: Tipo.Homens,
    Nome_Lider_1: 'Ricardo Almeida',
    Telefone_Lider_1: '21966665555',
    Horario_Celula: 'Toda sexta-feira, às 19:00',
    Endereco_Completo: 'Rua Paulo Lins, 45, Vila São Luís, Duque de Caxias - RJ',
    CEP: '25065-160',
    Latitude: -22.78,
    Longitude: -43.32,
    Status: Status.Ativa,
  },
   {
    ID_Celula: '5',
    Nome_Celula: 'Célula Sementinhas',
    Rede: Rede.Verde,
    Tipo: Tipo.Kids,
    Nome_Lider_1: 'Fernanda Lima',
    Telefone_Lider_1: '21955554444',
    Horario_Celula: 'Todo Sábado, às 10:00',
    Endereco_Completo: 'Praça do Pacificador, 10, Centro, Duque de Caxias - RJ',
    CEP: '25020-000',
    Latitude: -22.786,
    Longitude: -43.310,
    Status: Status.Ativa,
  },
];


const LOCAL_STORAGE_KEY = 'church_cells_data';

export const useCells = () => {
  const [cells, setCells] = useState<Celula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const storedCells = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedCells) {
        setCells(JSON.parse(storedCells));
      } else {
        // Se não houver dados no localStorage, inicializa com os dados de exemplo.
        console.log("Initializing with mock data and saving to local storage.");
        setCells(MOCK_CELLS);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_CELLS));
      }
    } catch (error) {
      console.error("Failed to load cells from local storage:", error);
      // Em caso de erro (ex: JSON corrompido), volta para os dados de exemplo.
      setCells(MOCK_CELLS);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveCellsToLocal = useCallback((updatedCells: Celula[]) => {
    setCells(updatedCells);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCells));
    console.log("Cell data saved to local storage.");
  }, []);

  const addCell = useCallback((newCell: Celula) => {
    const updatedCells = [...cells, newCell];
    saveCellsToLocal(updatedCells);
  }, [cells, saveCellsToLocal]);

  const updateCell = useCallback((updatedCellData: Celula) => {
    const updatedCells = cells.map(cell =>
      cell.ID_Celula === updatedCellData.ID_Celula ? updatedCellData : cell
    );
    saveCellsToLocal(updatedCells);
  }, [cells, saveCellsToLocal]);
  
  const upsertCells = useCallback((incomingCells: Celula[]) => {
    const cellsMap = new Map(cells.map(cell => [cell.ID_Celula, cell]));
    incomingCells.forEach(newCell => {
        // Isso irá adicionar novas células e atualizar as existentes com o mesmo ID
        cellsMap.set(newCell.ID_Celula, newCell);
    });
    const updatedCells = Array.from(cellsMap.values());
    saveCellsToLocal(updatedCells);
  }, [cells, saveCellsToLocal]);

  const replaceAllCells = useCallback((newCells: Celula[]) => {
    saveCellsToLocal(newCells);
  }, [saveCellsToLocal]);


  return { cells, addCell, updateCell, replaceAllCells, loading, upsertCells };
};