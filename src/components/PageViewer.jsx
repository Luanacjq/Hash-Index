import { useState } from "react";
import { ChevronLeft, ChevronRight, Database, Search } from "lucide-react";

export default function PageViewer({ pages }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageInput, setPageInput] = useState("");

  if (!pages || pages.length === 0) return null;

  const page = pages[currentPage] || [];

  function nextPage() {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }

  function goToPage() {
    const pageNumber = Number(pageInput);

    if (isNaN(pageNumber)) return;

    if (pageNumber >= 0 && pageNumber < pages.length) {
      setCurrentPage(pageNumber);
      setPageInput("");
    } else {
      alert("Página inválida");
    }
  }

  return (
    <div className="mt-12 bg-slate-800 p-6 rounded-2xl border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database />
          <h2 className="text-xl font-semibold">Visualização de Página</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            className="px-3 py-3 bg-slate-700 rounded hover:bg-slate-600"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={nextPage}
            className="px-3 py-3 bg-slate-700 rounded hover:bg-slate-600"
          >
            <ChevronRight size={16} />
          </button>

          <input
            type="number"
            placeholder="Página"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") goToPage();
            }}
            className="p-2 rounded text-black w-25 ml-2"
          />

          <button
            onClick={goToPage}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 px-3 py-3 rounded"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Página atual: {currentPage} / {pages.length - 1}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {page.slice(0, 25).map((word, i) => (
          <div key={i} className="bg-slate-700 p-2 rounded text-sm text-center">
            {word}
          </div>
        ))}
      </div>
    </div>
  );
}
