import { useState } from "react";
import { UploadCloud, Loader, FileText, CheckCircle } from "lucide-react";

export default function UploadFile({ setWords }) {
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);

  function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();

    reader.onload = function (e) {
      const text = e.target.result;

      const lines = text
        .split("\n")
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w !== "");

      setWords(lines);

      setFileInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(2),
        total: lines.length,
      });

      setLoading(false);
    };

    reader.onerror = () => {
      alert("Erro ao ler o arquivo");
      setLoading(false);
    };

    reader.readAsText(file);
  }

  return (
    <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <UploadCloud />
        <h2 className="text-xl font-semibold">Carregar Arquivo TXT</h2>
      </div>

      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl p-10 cursor-pointer hover:border-blue-400 transition">
        {loading ? (
          <>
            <Loader className="animate-spin mb-2" />
            <p>Carregando arquivo...</p>
          </>
        ) : (
          <>
            <UploadCloud size={40} className="mb-2 text-blue-400" />
            <p>Clique para selecionar o arquivo</p>
          </>
        )}

        <input
          type="file"
          accept=".txt"
          onChange={handleFile}
          className="hidden"
        />
      </label>

      {fileInfo && (
        <div className="mt-6 bg-slate-700 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} />
            <p className="font-semibold">Arquivo carregado</p>
          </div>

          <div className="text-sm text-gray-300 space-y-1">
            <p>
              <strong>Nome:</strong> {fileInfo.name}
            </p>

            <p>
              <strong>Tamanho:</strong> {fileInfo.size} KB
            </p>

            <p>
              <strong>Total de palavras:</strong> {fileInfo.total}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-3 text-green-400 text-sm">
            <CheckCircle size={16} />
            Arquivo carregado com sucesso
          </div>
        </div>
      )}
    </div>
  );
}
