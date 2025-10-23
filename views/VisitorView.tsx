import React, { useState, useMemo, useEffect } from 'react';
import { Rede, Tipo, type Celula, Coordinates } from '../types';
import { calculateDistance, fetchAddressFromCEP, geocodeAddress } from '../services/geoService';
import Spinner from '../components/Spinner';
import Devotional from '../components/Devotional';


interface VisitorViewProps {
  cells: Celula[];
}

const REDE_COLORS: Record<Rede, { bg: string, border: string, text: string, gradient: string, darkBg: string }> = {
    Amarela: { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-yellow-800', gradient: 'from-yellow-400 to-yellow-300', darkBg: 'dark:bg-yellow-500/30 dark:text-yellow-300 dark:border-yellow-500/40' },
    Verde:   { bg: 'bg-green-400', border: 'border-green-500', text: 'text-green-800', gradient: 'from-green-400 to-green-300', darkBg: 'dark:bg-green-500/30 dark:text-green-300 dark:border-green-500/40' },
    Laranja: { bg: 'bg-orange-400', border: 'border-orange-500', text: 'text-orange-800', gradient: 'from-orange-400 to-orange-300', darkBg: 'dark:bg-orange-500/30 dark:text-orange-300 dark:border-orange-500/40' },
    Azul:    { bg: 'bg-blue-400', border: 'border-blue-500', text: 'text-blue-800', gradient: 'from-blue-400 to-blue-300', darkBg: 'dark:bg-blue-500/30 dark:text-blue-300 dark:border-blue-500/40' },
};

const TIPO_STYLES: Record<Tipo, { bg: string, text: string, darkBg: string }> = {
  Adulto: { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'dark:bg-purple-500/30 dark:text-purple-300' },
  Kids: { bg: 'bg-pink-100', text: 'text-pink-800', darkBg: 'dark:bg-pink-500/30 dark:text-pink-300' },
  Homens: { bg: 'bg-indigo-100', text: 'text-indigo-800', darkBg: 'dark:bg-indigo-500/30 dark:text-indigo-300' },
  Mulheres: { bg: 'bg-rose-100', text: 'text-rose-800', darkBg: 'dark:bg-rose-500/30 dark:text-rose-300' },
  Jovens: { bg: 'bg-teal-100', text: 'text-teal-800', darkBg: 'dark:bg-teal-500/30 dark:text-teal-300' },
}

const getNextOccurrenceDate = (horario: string): Date | null => {
    if (!horario) return null;
    const dayMap: { [key: string]: number } = { domingo: 0, segunda: 1, terça: 2, quarta: 3, quinta: 4, sexta: 5, sábado: 6 };
    const horarioLower = horario.toLowerCase();
    const dayOfWeekStr = Object.keys(dayMap).find(day => horarioLower.includes(day));
    const timeMatch = horario.match(/(\d{2}):(\d{2})/);
    if (!dayOfWeekStr || !timeMatch) return null;
    const targetDay = dayMap[dayOfWeekStr];
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const now = new Date();
    const nextDate = new Date(now);
    const currentDay = now.getDay();
    let dayDifference = targetDay - currentDay;
    if (dayDifference < 0 || (dayDifference === 0 && (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() > minutes)))) {
        dayDifference += 7;
    }
    nextDate.setDate(now.getDate() + dayDifference);
    nextDate.setHours(hours, minutes, 0, 0);
    return nextDate;
};

const formatUpcomingDate = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 0) return `Hoje, ${time}`;
  if (diffDays === 1) return `Amanhã, ${time}`;
  const dayOfWeek = date.toLocaleString('pt-BR', { weekday: 'long' });
  return `${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}, ${time}`;
};

const CellDetailsModal: React.FC<{ cell: Celula, onClose: () => void, isOpen: boolean }> = ({ cell, onClose, isOpen }) => {
    const redeColor = REDE_COLORS[cell.Rede];
    const tipoStyle = TIPO_STYLES[cell.Tipo];

    return (
        <div className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
            <div className={`w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl p-4 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
                <div className="max-h-[80vh] overflow-y-auto px-2 pb-6">
                    <div className={`mb-4 p-4 rounded-lg bg-gradient-to-br ${redeColor.gradient}`}>
                        <h2 className="text-2xl font-bold text-white shadow-sm">{cell.Nome_Celula}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <p className={`font-semibold ${redeColor.text} bg-white/70 px-3 py-1 rounded-full text-sm`}>{cell.Rede}</p>
                            <p className={`font-semibold ${tipoStyle.text} ${tipoStyle.bg} px-3 py-1 rounded-full text-sm`}>{cell.Tipo}</p>
                        </div>
                    </div>
                    <div className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
                        <p><i className="fas fa-clock w-6 text-center text-blue-500 mr-2"></i><strong>Horário:</strong> {cell.Horario_Celula}</p>
                        <p><i className="fas fa-map-marker-alt w-6 text-center text-blue-500 mr-2"></i><strong>Endereço:</strong> {cell.Endereco_Completo}</p>
                    </div>
                    <div className="space-y-4">
                        {cell.Nome_Lider_1 && cell.Telefone_Lider_1 && (
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-gray-700">
                                <h3 className="font-bold text-gray-800 dark:text-gray-100">Líder 1: {cell.Nome_Lider_1}</h3>
                                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                                    <a href={`https://wa.me/55${cell.Telefone_Lider_1.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"><i className="fab fa-whatsapp mr-2"></i>WhatsApp</a>
                                    <a href={`tel:${cell.Telefone_Lider_1}`} className="flex-1 text-center bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"><i className="fas fa-phone-alt mr-2"></i>Ligar</a>
                                </div>
                            </div>
                        )}
                        {cell.Nome_Lider_2 && cell.Telefone_Lider_2 && (
                             <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-gray-700">
                                <h3 className="font-bold text-gray-800 dark:text-gray-100">Líder 2: {cell.Nome_Lider_2}</h3>
                                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                                    <a href={`https://wa.me/55${cell.Telefone_Lider_2.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"><i className="fab fa-whatsapp mr-2"></i>WhatsApp</a>
                                    <a href={`tel:${cell.Telefone_Lider_2}`} className="flex-1 text-center bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"><i className="fas fa-phone-alt mr-2"></i>Ligar</a>
                                </div>
                            </div>
                        )}
                        {cell.Nome_Lider_Auxiliar && cell.Telefone_Lider_Auxiliar && (
                             <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-gray-700">
                                <h3 className="font-bold text-gray-800 dark:text-gray-100">Auxiliar: {cell.Nome_Lider_Auxiliar}</h3>
                                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                                    <a href={`https://wa.me/55${cell.Telefone_Lider_Auxiliar.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"><i className="fab fa-whatsapp mr-2"></i>WhatsApp</a>
                                    <a href={`tel:${cell.Telefone_Lider_Auxiliar}`} className="flex-1 text-center bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"><i className="fas fa-phone-alt mr-2"></i>Ligar</a>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-6">
                         <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cell.Endereco_Completo)}`} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-gray-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"><i className="fas fa-map-signs mr-2"></i>Ver Rota no Mapa</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VisitorView: React.FC<VisitorViewProps> = ({ cells }) => {
  const [selectedRedeFilters, setSelectedRedeFilters] = useState<Rede[]>([]);
  const [selectedTipoFilters, setSelectedTipoFilters] = useState<Tipo[]>([]);
  const [selectedCell, setSelectedCell] = useState<Celula | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSelectCell = (cell: Celula) => {
    setSelectedCell(cell);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Optional: Delay clearing the cell to allow for the closing animation
    setTimeout(() => setSelectedCell(null), 300); 
  };

  const displayedCells = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    if (!lowercasedQuery && !selectedRedeFilters.length && !selectedTipoFilters.length) {
        return cells.slice(0, 10);
    }
    return cells.filter(cell => {
        if (selectedRedeFilters.length && !selectedRedeFilters.includes(cell.Rede)) return false;
        if (selectedTipoFilters.length && !selectedTipoFilters.includes(cell.Tipo)) return false;
        if (lowercasedQuery) {
            return (
                cell.Nome_Celula.toLowerCase().includes(lowercasedQuery) ||
                cell.Endereco_Completo.toLowerCase().includes(lowercasedQuery) ||
                cell.CEP.includes(lowercasedQuery) ||
                cell.Nome_Lider_1.toLowerCase().includes(lowercasedQuery) ||
                (cell.Nome_Lider_2 && cell.Nome_Lider_2.toLowerCase().includes(lowercasedQuery)) ||
                (cell.Nome_Lider_Auxiliar && cell.Nome_Lider_Auxiliar.toLowerCase().includes(lowercasedQuery))
            );
        }
        return true;
    });
  }, [cells, searchQuery, selectedRedeFilters, selectedTipoFilters]);
  
  const upcomingCells = useMemo(() => {
      return cells
        .filter(cell => cell.Status === 'Ativa')
        .map(cell => ({ ...cell, nextOccurrence: getNextOccurrenceDate(cell.Horario_Celula) }))
        .filter(cell => cell.nextOccurrence !== null)
        .sort((a, b) => a.nextOccurrence!.getTime() - b.nextOccurrence!.getTime())
        .slice(0, 4);
    }, [cells]);

  const toggleFilter = <T extends string>(selected: T[], setSelected: React.Dispatch<React.SetStateAction<T[]>>, item: T) => {
    setSelected(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };
  
  const getResultsTitle = () => (searchQuery.trim() || selectedRedeFilters.length || selectedTipoFilters.length) ? "Resultados da Busca" : "Conheça Nossas Células";

  return (
    <div className="container mx-auto max-w-6xl space-y-8">
       <Devotional />
       
      {upcomingCells.length > 0 && (
         <section>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">Próximas Células</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {upcomingCells.map(cell => (
                    <div key={`upcoming-${cell.ID_Celula}`} onClick={() => handleSelectCell(cell)} className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg dark:hover:shadow-blue-500/10 transition-shadow duration-300 cursor-pointer overflow-hidden border-t-4 ${REDE_COLORS[cell.Rede].border}`}>
                        <div className="p-4">
                            <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">{formatUpcomingDate(cell.nextOccurrence!)}</p>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 mt-1 truncate" title={cell.Nome_Celula}>{cell.Nome_Celula}</h3>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                <p className="truncate" title={cell.Nome_Lider_1}><i className="fas fa-user-tie w-5 mr-2"></i>{cell.Nome_Lider_1}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      )}

      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-center text-gray-700 dark:text-gray-200 mb-6">Encontre sua Célula</h2>
            <div className="relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Busque por nome, líder, endereço ou CEP..."
                    className="w-full p-4 pl-12 border dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                />
            </div>
      </section>

       <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700 dark:text-gray-200 mb-6">Ou Filtre para Refinar sua Busca</h2>
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-center mb-3 text-gray-600 dark:text-gray-300">Filtrar por Rede:</h3>
                <div className="flex justify-center flex-wrap gap-2">
                    {Object.values(Rede).map(rede => (
                        <button key={rede} onClick={() => toggleFilter(selectedRedeFilters, setSelectedRedeFilters, rede)} className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all duration-200 ${selectedRedeFilters.includes(rede) ? `${REDE_COLORS[rede].bg} text-white border-transparent` : `bg-white text-gray-600 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600`}`}>
                            {rede}
                        </button>
                    ))}
                </div>
            </div>
            <hr className="dark:border-gray-700"/>
            <div>
                <h3 className="font-semibold text-center mb-3 text-gray-600 dark:text-gray-300">Filtrar por Tipo:</h3>
                <div className="flex justify-center flex-wrap gap-2">
                    {Object.values(Tipo).map(tipo => (
                        <button key={tipo} onClick={() => toggleFilter(selectedTipoFilters, setSelectedTipoFilters, tipo)} className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all duration-200 ${selectedTipoFilters.includes(tipo) ? `${TIPO_STYLES[tipo].bg} ${TIPO_STYLES[tipo].text} dark:bg-opacity-30 border-transparent font-semibold` : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'}`}>
                            {tipo}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </section>

      <div>
         <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">{getResultsTitle()}</h2>
        {!displayedCells.length && <p className="text-center text-gray-600 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-500/20 p-4 rounded-lg">Nenhuma célula encontrada com os critérios selecionados.</p>}
        {displayedCells.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCells.map(cell => {
              const redeColor = REDE_COLORS[cell.Rede];
              const tipoStyle = TIPO_STYLES[cell.Tipo];
              const neighborhood = cell.Endereco_Completo.split(',')[2]?.trim() || cell.Endereco_Completo.split(',')[1]?.trim() || 'Bairro não informado';

              return (
                  <div key={cell.ID_Celula} onClick={() => handleSelectCell(cell)} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg dark:hover:shadow-blue-500/10 transition-shadow duration-300 cursor-pointer overflow-hidden group flex flex-col h-full">
                      <div className={`h-2 ${redeColor.bg}`}></div>
                      <div className="p-4 flex-grow">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={cell.Nome_Celula}>{cell.Nome_Celula}</h3>
                          <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-start"><i className="fas fa-users w-5 text-center text-gray-400 dark:text-gray-500 mr-2 pt-1"></i><div><p className="font-medium text-gray-700 dark:text-gray-300 truncate" title={cell.Nome_Lider_1}>{cell.Nome_Lider_1}</p></div></div>
                              <p className="flex items-center"><i className="fas fa-clock w-5 text-center text-gray-400 dark:text-gray-500 mr-2"></i><span className="truncate" title={cell.Horario_Celula}>{cell.Horario_Celula}</span></p>
                              <p className="flex items-center"><i className="fas fa-map-marker-alt w-5 text-center text-gray-400 dark:text-gray-500 mr-2"></i><span className="truncate" title={neighborhood}>{neighborhood}</span></p>
                          </div>
                      </div>
                      <div className="px-4 pb-3 pt-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs mt-auto">
                          <span className={`font-semibold px-2 py-1 rounded-full ${redeColor.bg} ${redeColor.text} ${redeColor.darkBg}`}>{cell.Rede}</span>
                          <span className={`font-semibold px-2 py-1 rounded-full ${tipoStyle.bg} ${tipoStyle.text} ${tipoStyle.darkBg}`}>{cell.Tipo}</span>
                      </div>
                  </div>
              );
            })}
          </div>
        )}
      </div>
      
      {selectedCell && <CellDetailsModal cell={selectedCell} onClose={handleCloseModal} isOpen={isModalOpen} />}
    </div>
  );
};

export default VisitorView;