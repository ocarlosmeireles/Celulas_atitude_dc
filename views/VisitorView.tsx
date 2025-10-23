import React, { useState, useMemo } from 'react';
import { Rede, Tipo, type Celula, Coordinates } from '../types';
import { calculateDistance, fetchAddressFromCEP, geocodeAddress } from '../services/geoService';
import Spinner from '../components/Spinner';
import Devotional from '../components/Devotional';


interface VisitorViewProps {
  cells: Celula[];
}

const REDE_COLORS: Record<Rede, { bg: string, border: string, text: string, gradient: string }> = {
    Amarela: { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-yellow-800', gradient: 'from-yellow-400 to-yellow-300' },
    Verde:   { bg: 'bg-green-400', border: 'border-green-500', text: 'text-green-800', gradient: 'from-green-400 to-green-300' },
    Laranja: { bg: 'bg-orange-400', border: 'border-orange-500', text: 'text-orange-800', gradient: 'from-orange-400 to-orange-300' },
    Azul:    { bg: 'bg-blue-400', border: 'border-blue-500', text: 'text-blue-800', gradient: 'from-blue-400 to-blue-300' },
};

const TIPO_STYLES: Record<Tipo, { bg: string, text: string }> = {
  Adulto: { bg: 'bg-purple-100', text: 'text-purple-800' },
  Kids: { bg: 'bg-pink-100', text: 'text-pink-800' },
  Homens: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  Mulheres: { bg: 'bg-rose-100', text: 'text-rose-800' },
  Jovens: { bg: 'bg-teal-100', text: 'text-teal-800' },
}

const getNextOccurrenceDate = (horario: string): Date | null => {
    if (!horario) return null;

    const dayMap: { [key: string]: number } = {
        domingo: 0,
        segunda: 1,
        terça: 2,
        quarta: 3,
        quinta: 4,
        sexta: 5,
        sábado: 6,
    };

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

    // If it's today but the time has passed, schedule for next week
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
  
  const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });
  const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  return `${capitalizedDay}, ${time}`;
};


const CellDetailsModal: React.FC<{ cell: Celula, onClose: () => void }> = ({ cell, onClose }) => {
    const redeColor = REDE_COLORS[cell.Rede];
    const tipoStyle = TIPO_STYLES[cell.Tipo];
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 text-3xl">&times;</button>
                <div className={`mb-4 p-4 rounded-lg bg-gradient-to-br ${redeColor.gradient}`}>
                    <h2 className="text-2xl font-bold text-white shadow-sm">{cell.Nome_Celula}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <p className={`font-semibold ${redeColor.text} bg-white/70 px-3 py-1 rounded-full text-sm`}>{cell.Rede}</p>
                        <p className={`font-semibold ${tipoStyle.text} ${tipoStyle.bg} px-3 py-1 rounded-full text-sm`}>{cell.Tipo}</p>
                    </div>
                </div>

                <div className="space-y-3 text-gray-700 mb-6">
                    <p><i className="fas fa-clock w-6 text-center text-blue-500 mr-2"></i><strong>Horário:</strong> {cell.Horario_Celula}</p>
                    <p><i className="fas fa-map-marker-alt w-6 text-center text-blue-500 mr-2"></i><strong>Endereço:</strong> {cell.Endereco_Completo}</p>
                </div>
                
                <div className="space-y-4">
                    {cell.Nome_Lider_1 && cell.Telefone_Lider_1 && (
                        <div className="bg-gray-50 p-3 rounded-lg border">
                            <h3 className="font-bold text-gray-800">Líder 1: {cell.Nome_Lider_1}</h3>
                            <div className="mt-2 flex flex-col sm:flex-row gap-2">
                                <a href={`https://wa.me/55${cell.Telefone_Lider_1.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"><i className="fab fa-whatsapp mr-2"></i>WhatsApp</a>
                                <a href={`tel:${cell.Telefone_Lider_1}`} className="flex-1 text-center bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"><i className="fas fa-phone-alt mr-2"></i>Ligar</a>
                            </div>
                        </div>
                    )}
                     {cell.Nome_Lider_2 && cell.Telefone_Lider_2 && (
                        <div className="bg-gray-50 p-3 rounded-lg border">
                            <h3 className="font-bold text-gray-800">Líder 2: {cell.Nome_Lider_2}</h3>
                            <div className="mt-2 flex flex-col sm:flex-row gap-2">
                                <a href={`https://wa.me/55${cell.Telefone_Lider_2.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"><i className="fab fa-whatsapp mr-2"></i>WhatsApp</a>
                                <a href={`tel:${cell.Telefone_Lider_2}`} className="flex-1 text-center bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"><i className="fas fa-phone-alt mr-2"></i>Ligar</a>
                            </div>
                        </div>
                    )}
                     {cell.Nome_Lider_Auxiliar && cell.Telefone_Lider_Auxiliar && (
                        <div className="bg-gray-50 p-3 rounded-lg border">
                            <h3 className="font-bold text-gray-800">Auxiliar: {cell.Nome_Lider_Auxiliar}</h3>
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
    );
};

const VisitorView: React.FC<VisitorViewProps> = ({ cells }) => {
  const [selectedRedeFilters, setSelectedRedeFilters] = useState<Rede[]>([]);
  const [selectedTipoFilters, setSelectedTipoFilters] = useState<Tipo[]>([]);
  const [selectedCell, setSelectedCell] = useState<Celula | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const displayedCells = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    const hasSearch = lowercasedQuery !== '';
    const hasRedeFilters = selectedRedeFilters.length > 0;
    const hasTipoFilters = selectedTipoFilters.length > 0;

    if (!hasSearch && !hasRedeFilters && !hasTipoFilters) {
        return cells.slice(0, 10);
    }

    return cells.filter(cell => {
        if (hasRedeFilters && !selectedRedeFilters.includes(cell.Rede)) {
            return false;
        }
        if (hasTipoFilters && !selectedTipoFilters.includes(cell.Tipo)) {
            return false;
        }
        if (hasSearch) {
            const inName = cell.Nome_Celula.toLowerCase().includes(lowercasedQuery);
            const inAddress = cell.Endereco_Completo.toLowerCase().includes(lowercasedQuery);
            const inCep = cell.CEP.includes(lowercasedQuery);
            const inLider1 = cell.Nome_Lider_1.toLowerCase().includes(lowercasedQuery);
            const inLider2 = cell.Nome_Lider_2 && cell.Nome_Lider_2.toLowerCase().includes(lowercasedQuery);
            const inAux = cell.Nome_Lider_Auxiliar && cell.Nome_Lider_Auxiliar.toLowerCase().includes(lowercasedQuery);

            if (!inName && !inAddress && !inCep && !inLider1 && !inLider2 && !inAux) {
                return false;
            }
        }
        return true;
    });
  }, [cells, searchQuery, selectedRedeFilters, selectedTipoFilters]);
  
  const upcomingCells = useMemo(() => {
      return cells
        .filter(cell => cell.Status === 'Ativa')
        .map(cell => ({
          ...cell,
          nextOccurrence: getNextOccurrenceDate(cell.Horario_Celula),
        }))
        .filter(cell => cell.nextOccurrence !== null)
        .sort((a, b) => a.nextOccurrence!.getTime() - b.nextOccurrence!.getTime())
        .slice(0, 4); // Show the next 4
    }, [cells]);


  const toggleRedeFilter = (rede: Rede) => {
    setSelectedRedeFilters(prev => 
      prev.includes(rede) ? prev.filter(r => r !== rede) : [...prev, rede]
    );
  };

  const toggleTipoFilter = (tipo: Tipo) => {
    setSelectedTipoFilters(prev =>
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    );
  };
  
  const getResultsTitle = () => {
    const hasSearch = searchQuery.trim() !== '';
    const hasFilters = selectedRedeFilters.length > 0 || selectedTipoFilters.length > 0;
    if (hasSearch || hasFilters) {
        return "Resultados da Busca";
    }
    return "Conheça Nossas Células";
  }


  return (
    <div className="container mx-auto max-w-6xl">
       <Devotional />
       
      {upcomingCells.length > 0 && (
         <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Próximas Células</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {upcomingCells.map(cell => (
                    <div key={`upcoming-${cell.ID_Celula}`} onClick={() => setSelectedCell(cell)} className={`bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden border-t-4 ${REDE_COLORS[cell.Rede].border}`}>
                        <div className="p-4">
                            <p className="font-bold text-blue-600 text-sm">{formatUpcomingDate(cell.nextOccurrence!)}</p>
                            <h3 className="font-bold text-gray-800 mt-1 truncate" title={cell.Nome_Celula}>{cell.Nome_Celula}</h3>
                            <div className="text-sm text-gray-500 mt-2">
                                <p className="truncate" title={cell.Nome_Lider_1}><i className="fas fa-user-tie w-5 mr-2"></i>{cell.Nome_Lider_1}</p>
                                {cell.Nome_Lider_2 && <p className="truncate pl-7" title={cell.Nome_Lider_2}>{cell.Nome_Lider_2}</p>}
                                {cell.Nome_Lider_Auxiliar && <p className="truncate pl-7 text-xs italic" title={cell.Nome_Lider_Auxiliar}>(Aux) {cell.Nome_Lider_Auxiliar}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      )}

      <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Encontre sua Célula</h2>
            <div className="relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Busque por nome, líder, endereço ou CEP..."
                    className="w-full p-4 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                />
            </div>
        </section>

       <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Ou Filtre para Refinar sua Busca</h2>
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-center mb-3 text-gray-600">Filtrar por Rede:</h3>
                <div className="flex justify-center flex-wrap gap-2">
                    {Object.values(Rede).map(rede => (
                        <button 
                            key={rede} 
                            onClick={() => toggleRedeFilter(rede)}
                            className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all duration-200 ${selectedRedeFilters.includes(rede) ? `${REDE_COLORS[rede].bg} text-white border-transparent` : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                        >
                            {rede}
                        </button>
                    ))}
                </div>
            </div>
            <hr/>
            <div>
                <h3 className="font-semibold text-center mb-3 text-gray-600">Filtrar por Tipo:</h3>
                <div className="flex justify-center flex-wrap gap-2">
                    {Object.values(Tipo).map(tipo => (
                        <button 
                            key={tipo} 
                            onClick={() => toggleTipoFilter(tipo)}
                            className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all duration-200 ${selectedTipoFilters.includes(tipo) ? `${TIPO_STYLES[tipo].bg} ${TIPO_STYLES[tipo].text} border-transparent font-semibold` : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                        >
                            {tipo}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </section>

      <div>
         <h2 className="text-2xl font-bold text-gray-700 mb-4">{getResultsTitle()}</h2>
        {displayedCells.length === 0 && (
          <p className="text-center text-gray-600 bg-yellow-100 p-4 rounded-lg">Nenhuma célula encontrada com os critérios selecionados.</p>
        )}
        {displayedCells.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCells.map(cell => {
              const redeColor = REDE_COLORS[cell.Rede];
              const tipoStyle = TIPO_STYLES[cell.Tipo];
              const neighborhood = cell.Endereco_Completo.split(',')[2]?.trim() || cell.Endereco_Completo.split(',')[1]?.trim() || 'Bairro não informado';

              return (
                  <div key={cell.ID_Celula} onClick={() => setSelectedCell(cell)} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden group flex flex-col h-full">
                      <div className={`h-2 ${redeColor.bg}`}></div>
                      <div className="p-4 flex-grow">
                          <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors" title={cell.Nome_Celula}>
                              {cell.Nome_Celula}
                          </h3>
                          
                          <div className="mt-4 space-y-2 text-sm text-gray-600">
                              <div className="flex items-start min-h-[50px]">
                                  <i className="fas fa-users w-5 text-center text-gray-400 mr-2 pt-1 flex-shrink-0"></i>
                                  <div className="flex-1">
                                      <p className="font-medium text-gray-700 truncate" title={cell.Nome_Lider_1}>{cell.Nome_Lider_1}</p>
                                      {cell.Nome_Lider_2 && <p className="text-gray-500 truncate" title={cell.Nome_Lider_2}>{cell.Nome_Lider_2}</p>}
                                      {cell.Nome_Lider_Auxiliar && <p className="text-gray-500 text-xs italic mt-1 truncate" title={cell.Nome_Lider_Auxiliar}>(Aux) {cell.Nome_Lider_Auxiliar}</p>}
                                  </div>
                              </div>

                              <p className="flex items-center">
                                  <i className="fas fa-clock w-5 text-center text-gray-400 mr-2"></i>
                                  <span className="truncate" title={cell.Horario_Celula}>{cell.Horario_Celula}</span>
                              </p>
                              <p className="flex items-center">
                                  <i className="fas fa-map-marker-alt w-5 text-center text-gray-400 mr-2"></i>
                                  <span className="truncate" title={neighborhood}>{neighborhood}</span>
                              </p>
                              <p className="flex items-center">
                                  <i className="fas fa-map-pin w-5 text-center text-gray-400 mr-2"></i>
                                  <span className="truncate" title={cell.CEP}>{cell.CEP}</span>
                              </p>
                          </div>
                      </div>
                      <div className="px-4 pb-3 pt-2 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs mt-auto">
                          <span className={`font-semibold px-2 py-1 rounded-full ${redeColor.bg} ${redeColor.text}`}>{cell.Rede}</span>
                          <span className={`font-semibold px-2 py-1 rounded-full ${tipoStyle.bg} ${tipoStyle.text}`}>{cell.Tipo}</span>
                      </div>
                  </div>
              );
            })}
          </div>
        )}
      </div>
      
      {selectedCell && <CellDetailsModal cell={selectedCell} onClose={() => setSelectedCell(null)} />}
    </div>
  );
};

export default VisitorView;