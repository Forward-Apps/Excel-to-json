import React, { ChangeEvent } from 'react';
import * as XLSX from 'xlsx';

export default function App() {
  const [items, setItems] = React.useState<any[]>([]);
  const [sheetName, setSheetName] = React.useState<string>('');
  const [sheetNames, setSheetNames] = React.useState<string[]>([]);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        const data = event.target!.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        setSheetNames(workbook.SheetNames); // Salva os nomes das abas

        if (workbook.SheetNames.length > 0 && !sheetName) {
          setSheetName(workbook.SheetNames[0]); // Define a primeira aba como padrão se nenhuma estiver selecionada
        }
      };

      reader.readAsBinaryString(file);
    }
  };

  React.useEffect(() => {
    if (sheetName && sheetNames.includes(sheetName)) {
      const file = document.getElementById('excel') as HTMLInputElement;
      if (file && file.files && file.files[0]) {
        const reader = new FileReader();

        reader.onload = (event: ProgressEvent<FileReader>) => {
          const data = event.target!.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const worksheet = workbook.Sheets[sheetName];
          const range = XLSX.utils.decode_range(worksheet['!ref']!);
          const columnHeaders: any[] = [];
          const rows: any[] = [];

          // Adjust this loop to read headers from the first row
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const headerCell = worksheet[XLSX.utils.encode_cell({ c: C, r: range.s.r })];
            columnHeaders.push(headerCell ? headerCell.v : `Column ${C + 1}`);
          }

          // Start from the second row for data rows
          for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const row: any = {};
            let isEmpty = true;

            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
              const cell = worksheet[cellRef];
              const key = columnHeaders[C - range.s.c];

              if (cell) {
                if (key === "a" ||
                  key === "b" ||
                  key === "c" ||
                  key === "d" 
                ) {
                  row['options'] = {
                    ...row['options'],
                    [key]: cell.v
                  }
                } else {
                  row[key] = cell.v;
                }
                
                isEmpty = false;
              }
            }

          if (isEmpty) break;

          
          row.id = row.id.toString()
          rows.push(row);
          }

          setItems(rows);
        };

        reader.readAsBinaryString(file.files[0]);
      }
    }
  }, [sheetName]);

  const handleSheetChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSheetName(e.target.value);
  };

  return (
    <div className="h-full min-h-screen bg-slate-950">
      <div className="container mx-auto flex flex-col items-center">
        <div className="flex py-5">
          <input type="file" name="excel" id="excel" accept=".xlsx, .xls" className="mr-20 text-white" onChange={handleFile}/>
          <select onChange={handleSheetChange} className="ml-4">
            {sheetNames.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <pre className="bg-slate-800 text-wrap p-9 relative">
            <button className='absolute top-0 right-0 p-3 bg-emerald-200' type="button" onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(items, null, 2))
                .then(() => alert('Dados copiados com sucesso!'))
                .catch(err => alert('Erro ao copiar dados: ' + err));
            }}>
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
