import React, { useState } from 'react';
import type { EssayDraft, UniversityProgram } from '../types';
import { X, FileText, Copy, Check } from 'lucide-react';

interface EssayAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  essayDraft: EssayDraft | null;
  targetUni: UniversityProgram | null;
}

export const EssayAssistantModal: React.FC<EssayAssistantModalProps> = ({
  isOpen,
  onClose,
  essayDraft,
  targetUni
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !essayDraft || !targetUni) return null;

  const fullText = `МОТИВАЦИОННОЕ ПИСЬМО (PERSONAL STATEMENT)
Целевой университет: ${targetUni.name}
Программа: ${targetUni.programTitle}

1. ВВОДНАЯ ЧАСТЬ (ХУК):
${essayDraft.hook}

2. АКАДЕМИЧЕСКИЙ ОПЫТ И ПРОЕКТЫ:
${essayDraft.academicBackground}

3. ПОЧЕМУ ИМЕННО ЭТОТ УНИВЕРСИТЕТ:
${essayDraft.whyUniversity}

4. КАРЬЕРНАЯ ЦЕЛЬ И ВКЛАД:
${essayDraft.futureImpact}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Ассистент мотивационного письма
                </span>
              </div>
              <h2 className="text-base font-semibold text-slate-900">
                Каркас эссе для {targetUni.shortName}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4-Part Structure */}
        <div className="mt-6 space-y-4 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <span className="font-semibold text-slate-900 block mb-1">
              1. Вводная часть (личный триггер интереса к специальности):
            </span>
            <p className="text-slate-700 leading-relaxed">{essayDraft.hook}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <span className="font-semibold text-slate-900 block mb-1">
              2. Академический опыт и прикладные навыки:
            </span>
            <p className="text-slate-700 leading-relaxed">{essayDraft.academicBackground}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <span className="font-semibold text-slate-900 block mb-1">
              3. Почему именно {targetUni.shortName}:
            </span>
            <p className="text-slate-700 leading-relaxed">{essayDraft.whyUniversity}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <span className="font-semibold text-slate-900 block mb-1">
              4. Карьерная траектория и вклад выпускника:
            </span>
            <p className="text-slate-700 leading-relaxed">{essayDraft.futureImpact}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Скопировано в буфер!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Скопировать структуру эссе</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
