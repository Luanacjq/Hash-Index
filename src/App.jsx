import { useState } from "react";
import UploadFile from "./components/UploadFile";
import PageViewer from "./components/PageViewer";

import { Database, FileText, Layers, PlayCircle, Search } from "lucide-react";

export default function App() {
  const [words, setWords] = useState([]);
  const [pageSize, setPageSize] = useState("");
  const [pages, setPages] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [bucketSize] = useState(4);
  const [indexTime, setIndexTime] = useState(0);
  const [collisions, setCollisions] = useState(0);
  const [overflows, setOverflows] = useState(0);
  const [searchWord, setSearchWord] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanTime, setScanTime] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [scanSteps, setScanSteps] = useState([]);
  const [lastBucket, setLastBucket] = useState(null);
  const [highlightPage, setHighlightPage] = useState(null);

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

  function createBuckets() {
    const NR = words.length;
    const FR = bucketSize;

    let NB = Math.ceil(NR / FR) + 1;

    if (NB <= NR / FR) {
      alert("Número de buckets inválido");
      return;
    }

    const newBuckets = Array.from({ length: NB }, () => []);

    setBuckets(newBuckets);

    return newBuckets;
  }

  function hashFunction(word, totalBuckets) {
    let hash = 0;

    for (let i = 0; i < word.length; i++) {
      hash += word.charCodeAt(i);
    }

    return hash % totalBuckets;
  }

  function buildHashIndex() {
    if (pages.length === 0) {
      alert("Crie as páginas primeiro");
      return;
    }

    const start = performance.now();
    const newBuckets = createBuckets();
    let collisionCount = 0;
    let overflowCount = 0;

    pages.forEach((page, pageIndex) => {
      page.forEach((word) => {
        const normalizedWord = word.trim().toLowerCase();
        const bucketIndex = hashFunction(normalizedWord, newBuckets.length);
        const bucket = newBuckets[bucketIndex];

        if (bucket.length >= bucketSize) {
          collisionCount++;
          overflowCount++;
        }

        if (bucket.length < bucketSize) {
          bucket.push({
            key: normalizedWord,
            page: pageIndex,
          });
        } else {
          collisionCount++;
          overflowCount++;

          if (!bucket.overflow) {
            bucket.overflow = [];
          }

          bucket.overflow.push({
            key: normalizedWord,
            page: pageIndex,
          });
        }
      });
    });

    const end = performance.now();

    setBuckets(newBuckets);
    setIndexTime((end - start).toFixed(2));
    setCollisions(collisionCount);
    setOverflows(overflowCount);
  }

  function searchKey() {
    if (!searchWord) return;

    if (buckets.length === 0) {
      alert("Construa o índice primeiro");
      return;
    }
    const start = performance.now();
    const key = searchWord.trim().toLowerCase();
    const bucketIndex = hashFunction(key, buckets.length);
    const bucket = buckets[bucketIndex];
    setLastBucket(bucketIndex);

    let foundPage = null;

    for (let item of bucket) {
      if (item.key === key) {
        foundPage = item.page;
        break;
      }
    }

    if (foundPage === null && bucket.overflow) {
      for (let item of bucket.overflow) {
        if (item.key === key) {
          foundPage = item.page;
          break;
        }
      }
    }

    const end = performance.now();
    setSearchTime((end - start).toFixed(2));

    if (foundPage !== null) {
      setHighlightPage(foundPage);
      setSearchResult({
        found: true,
        page: foundPage,
        cost: 2,
      });
    } else {
      setSearchResult({
        found: false,
        cost: 2,
      });
    }
  }

  function tableScan() {
    if (!searchWord) return;

    if (pages.length === 0) {
      alert("Crie as páginas primeiro");
      return;
    }

    const start = performance.now();
    const key = searchWord.trim().toLowerCase();
    let pagesRead = 0;
    let foundPage = null;
    let steps = [];

    for (let i = 0; i < pages.length; i++) {
      pagesRead++;

      steps.push(`Lendo página ${i}`);

      for (let word of pages[i]) {
        if (word.trim().toLowerCase() === key) {
          foundPage = i;
          break;
        }
      }

      if (foundPage !== null) break;
    }

    const end = performance.now();

    setScanTime((end - start).toFixed(2));
    setScanSteps(steps);

    if (foundPage !== null) {
      setHighlightPage(foundPage);

      setScanResult({
        found: true,
        page: foundPage,
        cost: pagesRead,
      });
    } else {
      setScanResult({
        found: false,
        cost: pagesRead,
      });
    }
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

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
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

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={createPages}
                className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition text-center"
              >
                <PlayCircle size={18} />
                Dividir em Páginas
              </button>

              <button
                onClick={buildHashIndex}
                className="mt-4 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition text-center"
              >
                Construir Índice Hash
              </button>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Total de palavras</p>
                <p className="text-2xl font-bold">{words.length}</p>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Total de páginas</p>
                <p className="text-2xl font-bold">{pages.length}</p>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Buckets</p>
                <p className="text-2xl font-bold">{buckets.length}</p>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Tempo do índice</p>
                <p className="text-2xl font-bold">{indexTime} ms</p>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Colisões</p>
                <p className="text-2xl font-bold">{collisions}</p>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Overflow</p>
                <p className="text-2xl font-bold">{overflows}</p>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Taxa de colisão</p>
                <p className="text-2xl font-bold">
                  {words.length
                    ? ((collisions / words.length) * 100).toFixed(2)
                    : 0}
                  %
                </p>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Taxa de overflow</p>
                <p className="text-2xl font-bold">
                  {words.length
                    ? ((overflows / words.length) * 100).toFixed(2)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Search />
            <h2 className="text-xl font-semibold">Buscar Palavra</h2>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite a palavra..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              className="flex-1 p-3 rounded-lg text-black"
            />

            <button
              onClick={searchKey}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
            >
              Buscar
            </button>

            <button
              onClick={tableScan}
              className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg"
            >
              Executar Table Scan
            </button>
          </div>

          {searchResult && (
            <div className="mt-4 text-sm">
              {searchResult.found ? (
                <>
                  <p className="text-green-400">
                    Palavra encontrada na página {searchResult.page}
                  </p>

                  <p className="text-gray-400">
                    Custo estimado: {searchResult.cost} leituras de página
                  </p>
                </>
              ) : (
                <p className="text-red-400">Palavra não encontrada</p>
              )}

              {lastBucket !== null && (
                <p className="text-blue-400 text-sm mt-2">
                  Bucket acessado: {lastBucket}
                </p>
              )}
            </div>
          )}

          {scanResult && (
            <div className="mt-4 text-sm">
              {scanResult.found ? (
                <p className="text-purple-400">
                  (Scan) Encontrado na página {scanResult.page}
                </p>
              ) : (
                <p className="text-red-400">(Scan) Palavra não encontrada</p>
              )}

              <p className="text-gray-400">
                Custo scan: {scanResult.cost} páginas
              </p>
            </div>
          )}

          {searchResult && scanResult && (
            <div className="mt-4 text-sm border-t border-slate-600 pt-4">
              <p className="text-yellow-400 font-semibold">Comparação:</p>

              <p>Tempo índice: {searchTime} ms</p>
              <p>Tempo scan: {scanTime} ms</p>

              <p>Diferença: {(scanTime - searchTime).toFixed(2)} ms</p>

              <p>Custo índice: {searchResult.cost}</p>
              <p>Custo scan: {scanResult.cost}</p>
            </div>
          )}

          {scanSteps.length > 0 && (
            <div className="mt-4 text-xs text-gray-400 max-h-32 overflow-y-auto">
              {scanSteps.map((step, i) => (
                <p key={i}>{step}</p>
              ))}
            </div>
          )}
        </div>

        {pages.length > 0 && (
          <PageViewer pages={pages} highlightPage={highlightPage} />
        )}
      </div>
    </div>
  );
}
