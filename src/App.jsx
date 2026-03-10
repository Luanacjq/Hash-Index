import { useState } from "react";
import UploadFile from "./components/UploadFile";
import PageViewer from "./components/PageViewer";

import { Database, FileText, Layers, PlayCircle } from "lucide-react";

export default function App() {
  const [words, setWords] = useState([]);
  const [pageSize, setPageSize] = useState("");
  const [pages, setPages] = useState([]);

  function createPages() {
    if (words.length === 0) {
      alert("Carregue um arquivo primeiro");
      return;
    }

    if (!pageSize || pageSize <= 0) {
      alert("Digite um tamanho de página válido");
      return;
    }

    const size = Number(pageSize);
    const newPages = [];

    for (let i = 0; i < words.length; i += size) {
      newPages.push(words.slice(i, i + size));
    }

    console.log("Total páginas:", newPages.length);

    setPages(newPages);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <Database size={36} className="text-blue-400" />

          <h1 className="text-4xl font-bold">Hash Index</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <UploadFile setWords={setWords} />

          <div className="bg-slate-800/80 backdrop-blur p-6 rounded-2xl shadow-xl border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={20} />

              <h2 className="text-xl font-semibold">Configuração de Página</h2>
            </div>

            <input
              type="number"
              placeholder="Registros por página"
              className="w-full p-3 rounded-lg text-black"
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
            />

            <button
              onClick={createPages}
              className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition"
            >
              <PlayCircle size={18} />
              Dividir em Páginas
            </button>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Total de palavras</p>
                <p className="text-2xl font-bold">{words.length}</p>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Total de páginas</p>
                <p className="text-2xl font-bold">{pages.length}</p>
              </div>
            </div>
          </div>
        </div>

        {pages.length > 0 && <PageViewer pages={pages} />}
      </div>
    </div>
  );
}
