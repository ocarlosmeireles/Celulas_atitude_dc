import React, { useState, useRef } from 'react';
import { Rede, Status, Tipo } from '../types';
import type { Celula } from '../types';
import { useCells } from '../hooks/useCells';
import { geocodeAddress, fetchAddressFromCEP } from '../services/geoService';
import Spinner from '../components/Spinner';

type CellsHook = ReturnType<typeof useCells>;

interface AdminViewProps {
  cellsHook: CellsHook;
}

const CellForm: React.FC<{
  cell: Partial<Celula> | null;
  onSave: (cell: Celula) => void;
  onCancel: () => void;
}> = ({ cell, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Celula>>(cell || {});
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      setCepLoading(true);
      setError('');
      try {
        const addressData = await fetchAddressFromCEP(cep);
        if (addressData) {
          setFormData(prev => ({
            ...prev,
            Endereco_Completo: addressData.fullAddress
          }));
        } else {
            setError('CEP não encontrado.');
        }
      } catch (err) {
        setError('Erro ao buscar CEP.');
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const requiredFields: (keyof Celula)[] = ['Nome_Celula', 'Nome_Lider_1', 'Telefone_Lider_1', 'Horario_Celula', 'Endereco_Completo', 'CEP', 'Rede', 'Status', 'Tipo'];
    for (const field of requiredFields) {
        if (!formData[field]) {
            setError(`O campo "${field.replace(/_/g, ' ')}" é obrigatório.`);
            return;
        }
    }

    setLoading(true);
    try {
      const { latitude, longitude } = await geocodeAddress(formData.Endereco_Completo!);
      const finalCellData: Celula = {
        ...formData,
        ID_Celula: formData.ID_Celula || Date.now().toString(),
        Latitude: latitude,
        Longitude: longitude,
      } as Celula;
      onSave(finalCellData);
    } catch (err) {
      setError('Falha ao geocodificar o endereço. Verifique e tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const formInputClass = "p-3 border rounded-md bg-brand-bg-light dark:bg-brand-bg-dark border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-brand-primary-light dark:focus:ring-brand-primary-dark outline-none transition placeholder:text-brand-text-secondary-light";
  const formSelectClass = `${formInputClass} appearance-none`;

  return (
     <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-brand-surface-light dark:bg-brand-surface-dark rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto text-brand-text-light dark:text-brand-text-dark" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-serif font-bold mb-4">{cell?.ID_Celula ? 'Editar Célula' : 'Adicionar Nova Célula'}</h2>
            {error && <p className="text-red-500 bg-red-100 dark:bg-red-500/20 dark:text-red-300 p-3 rounded-md mb-4 text-sm"><i className="fas fa-exclamation-circle mr-2"></i>{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="Nome_Celula" value={formData.Nome_Celula || ''} onChange={handleChange} placeholder="Nome da Célula" className={`${formInputClass} md:col-span-2`} required />
                    
                    {[
                        { title: 'Líder 1 (Obrigatório)', nameKey: 'Nome_Lider_1', phoneKey: 'Telefone_Lider_1', required: true },
                        { title: 'Líder 2 (Opcional)', nameKey: 'Nome_Lider_2', phoneKey: 'Telefone_Lider_2', required: false },
                        { title: 'Auxiliar (Opcional)', nameKey: 'Nome_Lider_Auxiliar', phoneKey: 'Telefone_Lider_Auxiliar', required: false },
                    ].map(lider => (
                        <div key={lider.nameKey} className="p-4 border rounded-md md:col-span-2 dark:border-gray-600 bg-brand-bg-light/50 dark:bg-brand-bg-dark/50 space-y-3">
                            <h3 className="font-semibold text-brand-text-secondary-light dark:text-brand-text-secondary-dark">{lider.title}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <input name={lider.nameKey} value={formData[lider.nameKey as keyof Celula] as string || ''} onChange={handleChange} placeholder={`Nome do ${lider.title.split(' ')[0]}`} className={`${formInputClass} bg-white dark:bg-brand-surface-dark`} required={lider.required} />
                               <input name={lider.phoneKey} type="tel" value={formData[lider.phoneKey as keyof Celula] as string || ''} onChange={handleChange} placeholder={`Telefone do ${lider.title.split(' ')[0]}`} className={`${formInputClass} bg-white dark:bg-brand-surface-dark`} required={lider.required} />
                            </div>
                        </div>
                    ))}

                    <input name="Horario_Celula" value={formData.Horario_Celula || ''} onChange={handleChange} placeholder="Horário (Ex: Toda terça, 20:00)" className={formInputClass} required />
                    <div className="relative">
                        <input name="CEP" value={formData.CEP || ''} onChange={handleChange} onBlur={handleCepBlur} placeholder="CEP" className={`${formInputClass} w-full`} required />
                        {cepLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner/></div>}
                    </div>
                    <input name="Endereco_Completo" value={formData.Endereco_Completo || ''} onChange={handleChange} placeholder="Endereço Completo" className={`${formInputClass} md:col-span-2`} required />
                    
                    <select name="Rede" value={formData.Rede || ''} onChange={handleChange} className={formSelectClass} required>
                        <option value="" disabled>Selecione a Rede</option>
                        {Object.values(Rede).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                     <select name="Tipo" value={formData.Tipo || ''} onChange={handleChange} className={formSelectClass} required>
                        <option value="" disabled>Selecione o Tipo</option>
                        {Object.values(Tipo).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select name="Status" value={formData.Status || ''} onChange={handleChange} className={`${formSelectClass} md:col-span-2`} required>
                        <option value="" disabled>Selecione o Status</option>
                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-brand-text-light dark:text-brand-text-dark font-bold py-2 px-5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-all">Cancelar</button>
                    <button type="submit" disabled={loading} className="bg-brand-primary-light dark:bg-brand-primary-dark text-white font-bold py-2 px-5 rounded-lg hover:bg-opacity-90 disabled:bg-opacity-50 transition-all flex items-center justify-center min-w-[100px]">
                        {loading ? <Spinner variant="white" /> : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
     </div>
  );
};


const AdminView: React.FC<AdminViewProps> = ({ cellsHook }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [editingCell, setEditingCell] = useState<Partial<Celula> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { cells, addCell, updateCell, upsertCells, loading } = cellsHook;
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Senha incorreta.');
    }
  };

  const handleSaveCell = (cellData: Celula) => {
    if (editingCell?.ID_Celula) {
      updateCell(cellData);
    } else {
      addCell(cellData);
    }
    setEditingCell(null);
  };
  
  const toggleStatus = (cell: Celula) => {
    const newStatus = cell.Status === Status.Ativa ? Status.Inativa : Status.Ativa;
    updateCell({ ...cell, Status: newStatus });
  };

  const handleExport = () => {
    if (cells.length === 0) {
        alert("Não há dados para exportar.");
        return;
    }
    const headers = Object.keys(cells[0]) as (keyof Celula)[];
    const csvRows = [
        headers.join(','),
        ...cells.map(cell => 
            headers.map(header => {
                const value = cell[header];
                const stringValue = value === undefined || value === null ? '' : String(value);
                return `"${stringValue.replace(/"/g, '""')}"`;
            }).join(',')
        )
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'base_de_celulas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Tem certeza que deseja importar os dados deste arquivo? As células existentes serão atualizadas e as novas serão adicionadas.")) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
            const lines = text.trim().split(/\r?\n/);
            if (lines.length < 2) throw new Error("CSV inválido: precisa de cabeçalho e pelo menos uma linha de dados.");

            const parseCsvLine = (line: string): string[] => {
                const result: string[] = [];
                let currentField = ''; let inQuotedField = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (inQuotedField) { if (char === '"') { if (i + 1 < line.length && line[i + 1] === '"') { currentField += '"'; i++; } else { inQuotedField = false; } } else { currentField += char; }
                    } else { if (char === '"') { inQuotedField = true; } else if (char === ',') { result.push(currentField); currentField = ''; } else { currentField += char; } }
                }
                result.push(currentField);
                return result;
            };
            
            const headers = parseCsvLine(lines[0]) as (keyof Celula)[];
            const importedCells: Celula[] = lines.slice(1).map((line, rowIndex) => {
                if (!line.trim()) return null;
                const values = parseCsvLine(line);
                if (values.length !== headers.length) throw new Error(`Linha ${rowIndex + 2}: número incorreto de colunas.`);
                const cellObject = {} as Partial<Celula>;
                headers.forEach((header, index) => {
                    const key = header; const value = values[index];
                    if (key === 'Latitude' || key === 'Longitude') { (cellObject as any)[key] = parseFloat(value) || 0; } else { (cellObject as any)[key] = value === 'undefined' ? undefined : value; }
                });
                if (!cellObject.ID_Celula) cellObject.ID_Celula = `imported_${Date.now()}_${rowIndex}`;
                if (!cellObject.Nome_Celula || !cellObject.Rede) throw new Error(`Linha ${rowIndex + 2}: Faltando dados essenciais.`);
                return cellObject as Celula;
            }).filter(Boolean) as Celula[];
            
            upsertCells(importedCells);
            alert(`${importedCells.length} células foram importadas/atualizadas com sucesso!`);
        } catch (err: any) {
            console.error(err);
            alert(`Erro ao importar o arquivo CSV. Verifique o formato do arquivo e tente novamente. Detalhe: ${err.message}`);
        }
    };
    reader.readAsText(file, "UTF-8");
    event.target.value = '';
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-brand-surface-light dark:bg-brand-surface-dark p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-serif font-bold text-center mb-6 text-brand-text-light dark:text-brand-text-dark">Área Restrita</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de Acesso"
              className="w-full p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary-light dark:focus:ring-brand-primary-dark bg-brand-bg-light dark:bg-brand-bg-dark text-brand-text-light dark:text-brand-text-dark transition-all"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-brand-primary-light dark:bg-brand-primary-dark text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h2 className="text-4xl font-serif font-bold text-brand-text-light dark:text-brand-text-dark">Gerenciamento</h2>
            <div className="flex flex-wrap gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".csv" className="hidden" />
              <button onClick={handleImportClick} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-transform hover:scale-105"><i className="fas fa-upload mr-2"></i> Importar CSV</button>
              <button onClick={handleExport} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-transform hover:scale-105"><i className="fas fa-download mr-2"></i> Exportar CSV</button>
              <button onClick={() => setEditingCell({})} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-transform hover:scale-105"><i className="fas fa-plus mr-2"></i> Adicionar Célula</button>
            </div>
        </div>
        
        {loading ? <Spinner /> : (
            <div className="bg-brand-surface-light dark:bg-brand-surface-dark rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-left text-brand-text-light dark:text-brand-text-dark">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="p-4 font-semibold">Nome da Célula</th>
                            <th className="p-4 font-semibold">Líder 1</th>
                            <th className="p-4 font-semibold">Rede</th>
                            <th className="p-4 font-semibold">Tipo</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cells.map(cell => (
                            <tr key={cell.ID_Celula} className="border-b dark:border-gray-700 hover:bg-brand-bg-light/50 dark:hover:bg-brand-bg-dark/50 transition-colors">
                                <td className="p-4 font-medium">{cell.Nome_Celula}</td>
                                <td className="p-4">{cell.Nome_Lider_1}</td>
                                <td className="p-4">{cell.Rede}</td>
                                <td className="p-4">{cell.Tipo}</td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${cell.Status === 'Ativa' ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300'}`}>
                                        {cell.Status}
                                    </span>
                                </td>
                                <td className="p-4 flex space-x-4">
                                    <button onClick={() => setEditingCell(cell)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" title="Editar"><i className="fas fa-edit"></i></button>
                                    <button onClick={() => toggleStatus(cell)} className="text-gray-600 hover:text-gray-800" title="Ativar/Desativar">
                                      {cell.Status === 'Ativa' ? <i className="fas fa-toggle-on text-green-500 text-xl"></i> : <i className="fas fa-toggle-off text-red-500 text-xl"></i>}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {editingCell && <CellForm cell={editingCell} onSave={handleSaveCell} onCancel={() => setEditingCell(null)} />}
    </div>
  );
};

export default AdminView;