import React, { useState, useRef, useEffect } from 'react';
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
  isOpen: boolean;
}> = ({ cell, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState<Partial<Celula>>(cell || {});
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset form data when the cell prop changes (e.g., opening for a new cell)
    setFormData(cell || {});
    setError('');
  }, [cell]);

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
          setFormData(prev => ({ ...prev, Endereco_Completo: addressData.fullAddress }));
        } else {
            setError('CEP não encontrado.');
        }
      } catch (err) { setError('Erro ao buscar CEP.'); } 
      finally { setCepLoading(false); }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const requiredFields: (keyof Celula)[] = ['Nome_Celula', 'Nome_Lider_1', 'Telefone_Lider_1', 'Horario_Celula', 'Endereco_Completo', 'CEP', 'Rede', 'Status', 'Tipo'];
    if (requiredFields.some(field => !formData[field])) {
        setError(`Preencha todos os campos obrigatórios.`);
        return;
    }
    setLoading(true);
    try {
      const { latitude, longitude } = await geocodeAddress(formData.Endereco_Completo!);
      onSave({ ...formData, ID_Celula: formData.ID_Celula || Date.now().toString(), Latitude: latitude, Longitude: longitude } as Celula);
    } catch (err) {
      setError('Falha ao geocodificar o endereço. Verifique e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formInputClass = "w-full p-3 border dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition";
  const formSelectClass = `${formInputClass} appearance-none`;
  const formSectionClass = "p-4 border dark:border-gray-700 rounded-lg md:col-span-2 space-y-3 bg-white dark:bg-gray-800/50";
  
  return (
     <div className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60" onClick={onCancel}></div>
        <div className={`w-full max-w-3xl bg-gray-100 dark:bg-gray-800 rounded-t-2xl shadow-2xl p-4 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
             <h2 className="text-2xl font-bold mb-4 px-2">{cell?.ID_Celula ? 'Editar Célula' : 'Adicionar Nova Célula'}</h2>
            <div className="max-h-[80vh] overflow-y-auto px-2 pb-6">
                {error && <p className="text-red-500 bg-red-100 dark:bg-red-500/20 dark:text-red-300 p-2 rounded-md mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="Nome_Celula" value={formData.Nome_Celula || ''} onChange={handleChange} placeholder="Nome da Célula" className={`${formInputClass} md:col-span-2`} required />
                        
                        <div className={formSectionClass}><h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Líder 1</h3><input name="Nome_Lider_1" value={formData.Nome_Lider_1 || ''} onChange={handleChange} placeholder="Nome" className={formInputClass} required /><input name="Telefone_Lider_1" type="tel" value={formData.Telefone_Lider_1 || ''} onChange={handleChange} placeholder="Telefone" className={formInputClass} required /></div>
                        <div className={formSectionClass}><h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Líder 2 (Opcional)</h3><input name="Nome_Lider_2" value={formData.Nome_Lider_2 || ''} onChange={handleChange} placeholder="Nome" className={formInputClass} /><input name="Telefone_Lider_2" type="tel" value={formData.Telefone_Lider_2 || ''} onChange={handleChange} placeholder="Telefone" className={formInputClass} /></div>
                        <div className={formSectionClass}><h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Auxiliar (Opcional)</h3><input name="Nome_Lider_Auxiliar" value={formData.Nome_Lider_Auxiliar || ''} onChange={handleChange} placeholder="Nome" className={formInputClass} /><input name="Telefone_Lider_Auxiliar" type="tel" value={formData.Telefone_Lider_Auxiliar || ''} onChange={handleChange} placeholder="Telefone" className={formInputClass} /></div>

                        <input name="Horario_Celula" value={formData.Horario_Celula || ''} onChange={handleChange} placeholder="Horário (Ex: Toda terça, 20:00)" className={formInputClass} required />
                        <div className="relative"><input name="CEP" value={formData.CEP || ''} onChange={handleChange} onBlur={handleCepBlur} placeholder="CEP" className={formInputClass} required />{cepLoading && <div className="absolute right-3 top-3"><Spinner/></div>}</div>
                        <input name="Endereco_Completo" value={formData.Endereco_Completo || ''} onChange={handleChange} placeholder="Endereço Completo" className={`${formInputClass} md:col-span-2`} required />
                        
                        <select name="Rede" value={formData.Rede || ''} onChange={handleChange} className={formSelectClass} required><option value="" disabled>Selecione a Rede</option>{Object.values(Rede).map(r => <option key={r} value={r}>{r}</option>)}</select>
                        <select name="Tipo" value={formData.Tipo || ''} onChange={handleChange} className={formSelectClass} required><option value="" disabled>Selecione o Tipo</option>{Object.values(Tipo).map(t => <option key={t} value={t}>{t}</option>)}</select>
                        <select name="Status" value={formData.Status || ''} onChange={handleChange} className={`${formSelectClass} md:col-span-2`} required><option value="" disabled>Selecione o Status</option>{Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button>
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">{loading ? <Spinner /> : 'Salvar'}</button>
                    </div>
                </form>
            </div>
        </div>
     </div>
  );
};


const AdminView: React.FC<AdminViewProps> = ({ cellsHook }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [editingCell, setEditingCell] = useState<Partial<Celula> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { cells, addCell, updateCell, upsertCells, loading } = cellsHook;
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { setIsAuthenticated(true); setError(''); } 
    else { setError('Senha incorreta.'); }
  };

  const handleOpenForm = (cell: Partial<Celula> | null = {}) => {
      setEditingCell(cell);
      setIsFormOpen(true);
  }

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTimeout(() => setEditingCell(null), 300);
  }

  const handleSaveCell = (cellData: Celula) => {
    if (editingCell?.ID_Celula) { updateCell(cellData); } 
    else { addCell(cellData); }
    handleCloseForm();
  };
  
  const toggleStatus = (cell: Celula) => updateCell({ ...cell, Status: cell.Status === Status.Ativa ? Status.Inativa : Status.Ativa });

  const handleExport = () => {
    if (!cells.length) { alert("Não há dados para exportar."); return; }
    const headers = Object.keys(cells[0]) as (keyof Celula)[];
    const csvContent = [headers.join(','), ...cells.map(cell => headers.map(header => `"${String(cell[header] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'base_de_celulas.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!window.confirm("Tem certeza que deseja importar? As células existentes serão atualizadas e as novas adicionadas.")) { event.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const lines = (e.target?.result as string).trim().split(/\r?\n/);
            if (lines.length < 2) throw new Error("CSV precisa de cabeçalho e pelo menos uma linha de dados.");
            const parseCsvLine = (line: string): string[] => { let res = [], f = '', q = false; for (let i = 0; i < line.length; i++) { let c = line[i]; if (q) { if (c === '"') { if (i + 1 < line.length && line[i + 1] === '"') { f += '"'; i++; } else { q = false; } } else { f += c; } } else { if (c === '"') { q = true; } else if (c === ',') { res.push(f); f = ''; } else { f += c; } } } res.push(f); return res; };
            const headers = parseCsvLine(lines[0]) as (keyof Celula)[];
            const importedCells = lines.slice(1).map((line, i) => { if (!line.trim()) return null; const values = parseCsvLine(line); if (values.length !== headers.length) throw new Error(`Linha ${i + 2}: número incorreto de colunas.`); const cell = {} as Partial<Celula>; headers.forEach((h, j) => { const v = values[j]; (cell as any)[h] = (h === 'Latitude' || h === 'Longitude') ? (parseFloat(v) || 0) : (v === 'undefined' ? undefined : v); }); if (!cell.ID_Celula) cell.ID_Celula = `imported_${Date.now()}_${i}`; if (!cell.Nome_Celula || !cell.Rede) throw new Error(`Linha ${i + 2}: Faltando Nome ou Rede.`); return cell as Celula; }).filter(Boolean) as Celula[];
            upsertCells(importedCells);
            alert(`${importedCells.length} células importadas/atualizadas!`);
        } catch (err) { alert(`Erro ao importar: ${err.message}`); }
    };
    reader.readAsText(file, "UTF-8");
    event.target.value = '';
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">Login do Administrador</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full p-3 border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition" />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold">Gerenciamento de Células</h2>
            <div className="flex flex-wrap gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".csv" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"><i className="fas fa-upload mr-2"></i> Importar</button>
              <button onClick={handleExport} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"><i className="fas fa-download mr-2"></i> Exportar</button>
              <button onClick={() => handleOpenForm()} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"><i className="fas fa-plus mr-2"></i> Adicionar</button>
            </div>
        </div>
        
        {loading ? <Spinner /> : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            {['Nome da Célula', 'Líder 1', 'Rede', 'Status', 'Ações'].map(h => <th key={h} className="p-4 font-semibold">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {cells.map(cell => (
                            <tr key={cell.ID_Celula} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="p-4 font-medium">{cell.Nome_Celula}</td>
                                <td className="p-4 text-gray-600 dark:text-gray-300">{cell.Nome_Lider_1}</td>
                                <td className="p-4 text-gray-600 dark:text-gray-300">{cell.Rede}</td>
                                <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${cell.Status === 'Ativa' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'}`}>{cell.Status}</span></td>
                                <td className="p-4 flex space-x-4">
                                    <button onClick={() => handleOpenForm(cell)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><i className="fas fa-edit"></i></button>
                                    <button onClick={() => toggleStatus(cell)} title="Ativar/Desativar">{cell.Status === 'Ativa' ? <i className="fas fa-toggle-on text-green-500 text-xl"></i> : <i className="fas fa-toggle-off text-red-500 text-xl"></i>}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        <CellForm cell={editingCell} onSave={handleSaveCell} onCancel={handleCloseForm} isOpen={isFormOpen} />
    </div>
  );
};

export default AdminView;