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

  return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{cell?.ID_Celula ? 'Editar Célula' : 'Adicionar Nova Célula'}</h2>
            {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="Nome_Celula" value={formData.Nome_Celula || ''} onChange={handleChange} placeholder="Nome da Célula" className="p-2 border rounded md:col-span-2" required />
                    
                    <div className="p-3 border rounded-md md:col-span-2">
                        <h3 className="font-semibold mb-2 text-gray-600">Dados do Líder 1</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <input name="Nome_Lider_1" value={formData.Nome_Lider_1 || ''} onChange={handleChange} placeholder="Nome do Líder 1" className="p-2 border rounded" required />
                           <input name="Telefone_Lider_1" type="tel" value={formData.Telefone_Lider_1 || ''} onChange={handleChange} placeholder="Telefone do Líder 1" className="p-2 border rounded" required />
                        </div>
                    </div>
                     <div className="p-3 border rounded-md md:col-span-2">
                        <h3 className="font-semibold mb-2 text-gray-600">Dados do Líder 2 (Opcional)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <input name="Nome_Lider_2" value={formData.Nome_Lider_2 || ''} onChange={handleChange} placeholder="Nome do Líder 2" className="p-2 border rounded" />
                           <input name="Telefone_Lider_2" type="tel" value={formData.Telefone_Lider_2 || ''} onChange={handleChange} placeholder="Telefone do Líder 2" className="p-2 border rounded" />
                        </div>
                    </div>

                     <div className="p-3 border rounded-md md:col-span-2">
                        <h3 className="font-semibold mb-2 text-gray-600">Dados do Auxiliar (Opcional)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input name="Nome_Lider_Auxiliar" value={formData.Nome_Lider_Auxiliar || ''} onChange={handleChange} placeholder="Nome do Auxiliar" className="p-2 border rounded" />
                            <input name="Telefone_Lider_Auxiliar" type="tel" value={formData.Telefone_Lider_Auxiliar || ''} onChange={handleChange} placeholder="Telefone do Auxiliar" className="p-2 border rounded" />
                        </div>
                    </div>

                    <input name="Horario_Celula" value={formData.Horario_Celula || ''} onChange={handleChange} placeholder="Horário (Ex: Toda terça, 20:00)" className="p-2 border rounded" required />
                    <div className="relative">
                        <input name="CEP" value={formData.CEP || ''} onChange={handleChange} onBlur={handleCepBlur} placeholder="CEP" className="p-2 border rounded w-full" required />
                        {cepLoading && <div className="absolute right-2 top-2"><Spinner/></div>}
                    </div>
                    <input name="Endereco_Completo" value={formData.Endereco_Completo || ''} onChange={handleChange} placeholder="Endereço Completo" className="p-2 border rounded md:col-span-2" required />
                    <select name="Rede" value={formData.Rede || ''} onChange={handleChange} className="p-2 border rounded" required>
                        <option value="" disabled>Selecione a Rede</option>
                        {Object.values(Rede).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                     <select name="Tipo" value={formData.Tipo || ''} onChange={handleChange} className="p-2 border rounded" required>
                        <option value="" disabled>Selecione o Tipo</option>
                        {Object.values(Tipo).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select name="Status" value={formData.Status || ''} onChange={handleChange} className="p-2 border rounded" required>
                        <option value="" disabled>Selecione o Status</option>
                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400">Cancelar</button>
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300">
                        {loading ? <Spinner /> : 'Salvar'}
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
    if (password === 'admin123') { // Hardcoded password for demo
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
        headers.join(','), // header row
        ...cells.map(cell => 
            headers.map(header => {
                const value = cell[header];
                const stringValue = value === undefined || value === null ? '' : String(value);
                // Escape quotes by doubling them and wrap the whole field in quotes
                return `"${stringValue.replace(/"/g, '""')}"`;
            }).join(',')
        )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for UTF-8 BOM
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
        event.target.value = ''; // Clear the input if user cancels
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
                let currentField = '';
                let inQuotedField = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (inQuotedField) {
                        if (char === '"') {
                            if (i + 1 < line.length && line[i + 1] === '"') { // Escaped quote
                                currentField += '"';
                                i++;
                            } else { // End of quoted field
                                inQuotedField = false;
                            }
                        } else {
                            currentField += char;
                        }
                    } else { // Not in a quoted field
                        if (char === '"') {
                            inQuotedField = true;
                        } else if (char === ',') {
                            result.push(currentField);
                            currentField = '';
                        } else {
                            currentField += char;
                        }
                    }
                }
                result.push(currentField); // Add the last field
                return result;
            };
            
            const headers = parseCsvLine(lines[0]) as (keyof Celula)[];
            
            const importedCells: Celula[] = lines.slice(1).map((line, rowIndex) => {
                if (!line.trim()) return null;

                const values = parseCsvLine(line);

                if (values.length !== headers.length) {
                    throw new Error(`Linha ${rowIndex + 2}: número incorreto de colunas. Esperado ${headers.length}, encontrado ${values.length}.`);
                }

                const cellObject = {} as Partial<Celula>;
                headers.forEach((header, index) => {
                    const key = header;
                    const value = values[index];

                    if (key === 'Latitude' || key === 'Longitude') {
                        (cellObject as any)[key] = parseFloat(value) || 0;
                    } else {
                        (cellObject as any)[key] = value === 'undefined' ? undefined : value;
                    }
                });

                if (!cellObject.ID_Celula) {
                    cellObject.ID_Celula = `imported_${Date.now()}_${rowIndex}`;
                }
                
                if (!cellObject.Nome_Celula || !cellObject.Rede) {
                     throw new Error(`Linha ${rowIndex + 2}: Faltando dados essenciais (Nome ou Rede).`);
                }

                return cellObject as Celula;
            }).filter(Boolean) as Celula[];
            
            upsertCells(importedCells);
            alert(`${importedCells.length} células foram importadas/atualizadas com sucesso!`);
        } catch (err) {
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
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">Login do Administrador</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
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
            <h2 className="text-3xl font-bold">Gerenciamento de Células</h2>
            <div className="flex flex-wrap gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".csv" className="hidden" />
              <button onClick={handleImportClick} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
                <i className="fas fa-upload mr-2"></i> Importar CSV
              </button>
              <button onClick={handleExport} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">
                <i className="fas fa-download mr-2"></i> Exportar CSV
              </button>
              <button onClick={() => setEditingCell({})} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">
                <i className="fas fa-plus mr-2"></i> Adicionar Nova Célula
              </button>
            </div>
        </div>
        
        {loading ? <Spinner /> : (
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">Nome da Célula</th>
                            <th className="p-3">Líder 1</th>
                            <th className="p-3">Rede</th>
                            <th className="p-3">Tipo</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cells.map(cell => (
                            <tr key={cell.ID_Celula} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{cell.Nome_Celula}</td>
                                <td className="p-3">{cell.Nome_Lider_1}</td>
                                <td className="p-3">{cell.Rede}</td>
                                <td className="p-3">{cell.Tipo}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${cell.Status === 'Ativa' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {cell.Status}
                                    </span>
                                </td>
                                <td className="p-3 flex space-x-2">
                                    <button onClick={() => setEditingCell(cell)} className="text-blue-600 hover:text-blue-800"><i className="fas fa-edit"></i></button>
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