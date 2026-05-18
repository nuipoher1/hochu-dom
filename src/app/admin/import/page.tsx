"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Upload, CheckCircle, AlertCircle, ChevronLeft, FileSpreadsheet, Download } from "lucide-react";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/contractors" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand mb-4 transition-colors">
          <ChevronLeft size={15} /> Назад к партнёрам
        </Link>
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Импорт партнёров из Excel</h1>
        <p className="text-sm text-muted mt-1">Загрузите заполненный шаблон — новые партнёры будут созданы, существующие обновлены</p>
      </div>

      {/* Инструкция */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <h2 className="font-semibold text-[#1a1a1a] mb-3">Как пользоваться</h2>
        <ol className="text-sm text-muted space-y-2 list-decimal list-inside">
          <li>Скачайте шаблон Excel с правильными колонками</li>
          <li>Заполните таблицу — каждый партнёр на отдельной строке</li>
          <li>Несколько телефонов или подкатегорий разделяйте точкой с запятой <code className="bg-surface px-1 rounded">;</code></li>
          <li>Загрузите заполненный файл и нажмите «Импортировать»</li>
        </ol>
        <div className="mt-4 p-3 rounded-xl text-xs space-y-1" style={{ backgroundColor: "#F4EDE0", color: "#7a6f5e" }}>
          <p><b>Участник фестиваля / Спикер</b> — пишите <b>Да</b> или <b>Нет</b></p>
          <p><b>Услуга</b> — точное название услуги из каталога, несколько через <b>;</b></p>
          <p><b>География</b> — федеральный округ, несколько через <b>;</b></p>
          <p><b>Обновление</b> — если партнёр с таким именем уже есть, данные обновятся</p>
        </div>
      </div>

      {/* Загрузка */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href="/import-template.xlsx"
            download
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border hover:border-brand hover:text-brand transition-colors"
          >
            <Download size={15} /> Скачать шаблон
          </a>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border hover:border-brand hover:text-brand transition-colors"
          >
            <FileSpreadsheet size={16} />
            {file ? file.name : "Выбрать файл Excel"}
          </button>

          {file && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#2d6a4f" }}
            >
              <Upload size={15} />
              {loading ? "Импортируем..." : "Импортировать"}
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden"
          onChange={(e) => { setFile(e.target.files?.[0] || null); setResult(null); setError(""); }} />
      </div>

      {/* Результат */}
      {error && (
        <div className="rounded-2xl p-4 flex items-start gap-3 mb-6" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <h2 className="font-semibold text-[#1a1a1a]">Импорт завершён</h2>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: "#2d6a4f" }}>{result.created}</p>
              <p className="text-xs text-muted mt-1">создано</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#1a1a1a]">{result.updated}</p>
              <p className="text-xs text-muted mt-1">обновлено</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-amber-700 mb-2">Предупреждения ({result.errors.length}):</p>
              <ul className="space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-xs text-amber-600 flex items-start gap-1.5">
                    <span className="mt-0.5">⚠</span>{e}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link href="/admin/contractors" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
            Перейти к списку партнёров →
          </Link>
        </div>
      )}
    </div>
  );
}
