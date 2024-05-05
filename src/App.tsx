import React, { ChangeEvent } from 'react';
import * as XLSX from 'xlsx';

interface QuizItem {
  id: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  [key: string]: any;
}

export default function App() {
  const [items, setItems] = React.useState<QuizItem[]>([]);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        const data = event.target!.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const range = XLSX.utils.decode_range(worksheet['!ref']!);
        const columnHeaders: string[] = [];
        const rows: QuizItem[] = [];

        // Lendo os cabeçalhos da linha 2
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const headerCell = worksheet[XLSX.utils.encode_cell({ c: C, r: range.s.r + 1 })];
          if (headerCell) {
            columnHeaders.push(headerCell.v);
          }
        }

        // Lendo os dados de cada linha
        for (let R = range.s.r + 2; R <= range.e.r; ++R) {
          let isEmpty = true;
          const row: Partial<QuizItem> = { options: {} };

          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
            const cell = worksheet[cellRef];
            const key = columnHeaders[C - range.s.c];
            if (cell && cell.v !== "") {
              isEmpty = false;
              if (['a', 'b', 'c', 'd'].includes(key)) {
                row.options[key] = cell.v;
              } else {
                row[key] = cell.v;
              }
            }
          }

          if (isEmpty) {
            break; // Se a linha estiver vazia, interrompe o loop
          }

          row.id = (R - range.s.r - 2).toString();  // Adicionando o ID começando de 0
          rows.push(row as QuizItem);
        }

        setItems(rows);
      };

      reader.readAsBinaryString(file);
    }
  };

  const copyToClipboard = () => {
    const jsonStr = JSON.stringify(items, null, 2);
    navigator.clipboard.writeText(jsonStr)
      .then(() => alert('Dados copiados com sucesso!'))
      .catch(err => alert('Erro ao copiar dados: ' + err));
  };

  return (
    <div className="h-full min-h-screen bg-slate-950">
      <div className="container mx-auto flex flex-col items-center">
        <div className="flex py-5">
        <input type="file" name="excel" id="excel" accept=".xlsx, .xls" className="mr-20 text-white" onChange={handleFile}/>
        </div>
        
      <div className="w-full" >
        <pre className="bg-slate-800 text-wrap p-9 relative">
          <button className='absolute top-0 right-0 p-3 bg-emerald-200' type="button" onClick={copyToClipboard}>
            Copiar
          </button>
          <code className="text-white overflow-x-scroll" id="json">
            {JSON.stringify(items, null, 2)}
          </code>
        </pre>
      </div>

    </div>
    </div>
    
  )
}
