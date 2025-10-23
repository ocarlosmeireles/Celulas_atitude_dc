import React, { useState, useMemo } from 'react';
import { Rede, Tipo, type Celula } from '../types';
import Spinner from '../components/Spinner';
import Devotional from '../components/Devotional';


interface VisitorViewProps {
  cells: Celula[];
}

const REDE_COLORS: Record<Rede, { bg: string, border: string, text: string, gradient: string, darkBg: string }> = {
    Amarela: { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-yellow-800', gradient: 'from-yellow-400 to-amber-300', darkBg: 'dark:bg-yellow-400/20' },
    Verde:   { bg: 'bg-green-400', border: 'border-green-500', text: 'text-green-800', gradient: 'from-green-400 to-emerald-300', darkBg: 'dark:bg-green-400/20' },
    Laranja: { bg: 'bg-orange-400', border: 'border-orange-500', text: 'text-orange-800', gradient: 'from-orange-400 to-red-300', darkBg: 'dark:bg-orange-400/20' },
    Azul:    { bg: 'bg-blue-400', border: 'border-blue-500', text: 'text-blue-800', gradient: 'from-blue-400 to-sky-300', darkBg: 'dark:bg-blue-400/20' },
};

const TIPO_STYLES: Record<Tipo, { bg: string, text: string, darkBg: string, darkText: string }> = {
  Adulto: { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'dark:bg-purple-500/20', darkText: 'dark:text-purple-300' },
  Kids: { bg: 'bg-pink-100', text: 'text-pink-800', darkBg: 'dark:bg-pink-500/20', darkText: 'dark:text-pink-300' },
  Homens: { bg: 'bg-indigo-100', text: 'text-indigo-800', darkBg: 'dark:bg-indigo-500/20', darkText: 'dark:text-indigo-300' },
  Mulheres: { bg: 'bg-rose-100', text: 'text-rose-800', darkBg: 'dark:bg-rose-500/20', darkText: 'dark:text-rose-300' },
  Jovens: { bg: 'bg-teal-100', text: 'text-teal-800', darkBg: 'dark:bg-teal-500/20', darkText: 'dark:text-teal-300' },
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
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-surface-light dark:bg-brand-surface-dark rounded-2xl shadow-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-secondary-light dark:text-brand-text-secondary-dark hover:text-brand-text-light dark:hover:text-brand-text-dark text-2xl">&times;</button>
                <div className={`mb-5 p-4 rounded-xl bg-gradient-to-br ${redeColor.gradient}`}>
                    <h2 className="text-3xl font-serif font-bold text-white shadow-sm">{cell.Nome_Celula}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <p className={`font-semibold bg-white/80 px-3 py-1 rounded-full text-sm ${redeColor.text}`}>{cell.Rede}</p>
                        <p className={`font-semibold px-3 py-1 rounded-full text-sm ${tipoStyle.bg} ${tipoStyle.text}`}>{cell.Tipo}</p>
                    </div>
                </div>

                <div className="space-y-3 text-brand-text-light dark:text-brand-text-dark mb-6">
                    <p className="flex items-center"><i className="fas fa-clock w-6 text-center text-brand-primary-light dark:text-brand-primary-dark mr-2"></i><strong>Horário:</strong><span className="ml-2">{cell.Horario_Celula}</span></p>
                    <p className="flex items-start"><i className="fas fa-map-marker-alt w-6 text-center text-brand-primary-light dark:text-brand-primary-dark mr-2 pt-1"></i><strong>Endereço:</strong><span className="ml-2">{cell.Endereco_Completo}</span></p>
                </div>
                
                <div className="space-y-4">
                    {[
                        { title: 'Líder 1', name: cell.Nome_Lider_1, phone: cell.Telefone_Lider_1 },
                        { title: 'Líder 2', name: cell.Nome_Lider_2, phone: cell.Telefone_Lider_2 },
                        { title: 'Auxiliar', name: cell.Nome_Lider_Auxiliar, phone: cell.Telefone_Lider_Auxiliar },
                    ].map((lider, index) => lider.name && lider.phone && (
                        <div key={index} className="bg-brand-bg-light dark:bg-brand-bg-dark p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-brand-text-light dark:text-brand-text-dark">{lider.title}: {lider.name}</h3>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <a href={`https://wa.me/55${lider.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-center bg-green-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-600 transition-transform hover:scale-105 flex items-center justify-center"><i className="fab fa-whatsapp mr-2"></i>WhatsApp</a>
                                <a href={`tel:${lider.phone}`} className="text-center bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-600 transition-transform hover:scale-105 flex items-center justify-center"><i className="fas fa-phone-alt mr-2"></i>Ligar</a>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6">
                     <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cell.Endereco_Completo)}`} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-brand-text-light dark:bg-brand-text-secondary-dark text-white dark:text-brand-text-dark font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 dark:hover:bg-opacity-90 transition-all flex items-center justify-center"><i className="fas fa-map-signs mr-2"></i>Ver Rota no Mapa</a>
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
        .slice(0, 4);
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
    <div className="container mx-auto max-w-7xl">
       <Devotional />
       
      {upcomingCells.length > 0 && (
         <section className="mb-10">
            <h2 className="text-3xl font-serif font-bold text-brand-text-light dark:text-brand-text-dark mb-5">Próximas Células</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {upcomingCells.map(cell => (
                    <div key={`upcoming-${cell.ID_Celula}`} onClick={() => setSelectedCell(cell)} className={`bg-brand-surface-light dark:bg-brand-surface-dark rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-l-4 ${REDE_COLORS[cell.Rede].border} hover:-translate-y-1`}>
                        <div className="p-4">
                            <p className="font-bold text-brand-primary-light dark:text-brand-primary-dark text-sm">{formatUpcomingDate(cell.nextOccurrence!)}</p>
                            <h3 className="font-bold text-brand-text-light dark:text-brand-text-dark mt-1 truncate" title={cell.Nome_Celula}>{cell.Nome_Celula}</h3>
                            <div className="text-sm text-brand-text-secondary-light dark:text-brand-text-secondary-dark mt-2">
                                <p className="truncate" title={cell.Nome_Lider_1}><i className="fas fa-user-tie w-5 mr-1 opacity-70"></i>{cell.Nome_Lider_1}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      )}

       <section className="bg-brand-surface-light dark:bg-brand-surface-dark p-6 rounded-2xl shadow-lg mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-1">
                    <h2 className="text-2xl font-serif font-bold text-brand-text-light dark:text-brand-text-dark mb-2">Encontre sua Célula</h2>
                    <p className="text-brand-text-secondary-light dark:text-brand-text-secondary-dark">Busque por nome, líder, ou use os filtros.</p>
                </div>
                <div className="relative lg:col-span-2">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary-light dark:text-brand-text-secondary-dark"></i>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Busque por nome, líder, endereço ou CEP..."
                        className="w-full p-4 pl-12 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-primary-light dark:focus:ring-brand-primary-dark transition-all bg-brand-bg-light dark:bg-brand-bg-dark text-brand-text-light dark:text-brand-text-dark placeholder:text-brand-text-secondary-light dark:placeholder:text-brand-text-secondary-dark"
                    />
                </div>
            </div>
            <hr className="my-6 border-gray-200 dark:border-gray-700"/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-center mb-3 text-brand-text-secondary-light dark:text-brand-text-secondary-dark">Filtrar por Rede:</h3>
                    <div className="flex justify-center flex-wrap gap-3">
                        {Object.values(Rede).map(rede => (
                            <button 
                                key={rede} 
                                onClick={() => toggleRedeFilter(rede)}
                                className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all duration-200 ${selectedRedeFilters.includes(rede) ? `${REDE_COLORS[rede].bg} text-white border-transparent shadow-md` : 'bg-transparent text-brand-text-secondary-light dark:text-brand-text-secondary-dark border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                {rede}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-center mb-3 text-brand-text-secondary-light dark:text-brand-text-secondary-dark">Filtrar por Tipo:</h3>
                    <div className="flex justify-center flex-wrap gap-3">
                        {Object.values(Tipo).map(tipo => (
                            <button 
                                key={tipo} 
                                onClick={() => toggleTipoFilter(tipo)}
                                className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 ${selectedTipoFilters.includes(tipo) ? `${TIPO_STYLES[tipo].bg} ${TIPO_STYLES[tipo].text} border-transparent font-semibold shadow-md` : 'bg-transparent text-brand-text-secondary-light dark:text-brand-text-secondary-dark border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                {tipo}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
      </section>

      <div>
         <h2 className="text-3xl font-serif font-bold text-brand-text-light dark:text-brand-text-dark mb-5">{getResultsTitle()}</h2>
        {displayedCells.length === 0 && (
          <div className="text-center text-brand-text-secondary-light dark:text-brand-text-secondary-dark bg-brand-surface-light dark:bg-brand-surface-dark p-8 rounded-2xl shadow">
            <i className="fas fa-search-minus text-4xl text-brand-accent-light dark:text-brand-accent-dark mb-4"></i>
            <p className="font-semibold">Nenhuma célula encontrada.</p>
            <p>Tente ajustar seus filtros ou o termo de busca.</p>
          </div>
        )}
        {displayedCells.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCells.map(cell => {
              const redeColor = REDE_COLORS[cell.Rede];
              const tipoStyle = TIPO_STYLES[cell.Tipo];
              const neighborhood = cell.Endereco_Completo.split(',')[2]?.trim() || cell.Endereco_Completo.split(',')[1]?.trim() || 'Bairro não informado';

              return (
                  <div key={cell.ID_Celula} onClick={() => setSelectedCell(cell)} className="bg-brand-surface-light dark:bg-brand-surface-dark rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col h-full hover:-translate-y-1.5">
                      <div className={`p-5 flex flex-col flex-grow bg-cover bg-center relative ${redeColor.darkBg}`}>
                        <div className={`absolute inset-0 bg-gradient-to-t ${redeColor.gradient} opacity-20 dark:opacity-10`}></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold font-serif text-brand-text-light dark:text-brand-text-dark group-hover:text-brand-primary-light dark:group-hover:text-brand-primary-dark transition-colors pr-4" title={cell.Nome_Celula}>
                                    {cell.Nome_Celula}
                                </h3>
                                <span className={`font-semibold text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${redeColor.bg} ${redeColor.text}`}>{cell.Rede}</span>
                            </div>
                            
                            <div className="mt-4 space-y-2.5 text-sm text-brand-text-secondary-light dark:text-brand-text-secondary-dark">
                                <p className="flex items-center">
                                    <i className="fas fa-user-tie w-5 text-center mr-2 opacity-70"></i>
                                    <span className="font-medium text-brand-text-light dark:text-brand-text-dark truncate" title={cell.Nome_Lider_1}>{cell.Nome_Lider_1}</span>
                                </p>
                                <p className="flex items-center">
                                    <i className="fas fa-map-marker-alt w-5 text-center mr-2 opacity-70"></i>
                                    <span className="truncate" title={neighborhood}>{neighborhood}</span>
                                </p>
                                <p className="flex items-center">
                                    <i className="fas fa-clock w-5 text-center mr-2 opacity-70"></i>
                                    <span className="truncate" title={cell.Horario_Celula}>{cell.Horario_Celula}</span>
                                </p>
                            </div>
                        </div>
                      </div>
                      <div className="px-5 py-3 bg-brand-bg-light dark:bg-black/10 border-t border-gray-200 dark:border-gray-700/50 flex justify-between items-center text-xs mt-auto">
                           <span className={`font-semibold px-2.5 py-1 rounded-full text-xs ${tipoStyle.bg} ${tipoStyle.text} ${tipoStyle.darkBg} ${tipoStyle.darkText}`}>{cell.Tipo}</span>
                           <span className="text-brand-primary-light dark:text-brand-primary-dark font-semibold group-hover:underline">
                               Ver Detalhes <i className="fas fa-arrow-right ml-1 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                           </span>
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