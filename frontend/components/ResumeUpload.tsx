"use client";
import { useRef, useState } from "react";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { resumeApi } from "@/lib/api";

interface Props {
  onParsed: (text: string) => void;
}

export default function ResumeUpload({ onParsed }: Props) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError("");
    setFilename(file.name);
    try {
      const res = await resumeApi.parse(file);
      onParsed(res.data.text);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to parse file");
      setFilename("");
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          dragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-gray-300 dark:border-slate-600 hover:border-indigo-400"
        }`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {loading ? (
          <div className="flex items-center justify-center gap-2" style={{ color: "var(--muted)" }}>
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span className="text-sm">Parsing resume...</span>
          </div>
        ) : filename ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">{filename} — parsed!</span>
            <button onClick={e => { e.stopPropagation(); setFilename(""); }} className="text-gray-400 hover:text-red-500 ml-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div style={{ color: "var(--muted)" }}>
            <Upload className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
            <p className="text-sm font-medium">Drop your resume or <span className="text-indigo-500">browse</span></p>
            <p className="text-xs mt-0.5">PDF, DOCX, or TXT</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
