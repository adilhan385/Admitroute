import React, { useState } from 'react';
import type { UniversityProgram } from '../types';
import { X, Calendar, Award, Building2, Briefcase, ExternalLink, FileText, CheckCircle2, Users, Clock, ShieldCheck } from 'lucide-react';

interface UniversityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  university: UniversityProgram | null;
  onOpenEssayModal?: (uni: UniversityProgram) => void;
  isCompared?: boolean;
  onToggleCompare?: (id: string) => void;
}

export const UniversityDetailModal: React.FC<UniversityDetailModalProps> = ({
  isOpen,
  onClose,
  university,
  onOpenEssayModal,
  isCompared,
  onToggleCompare
}) => {
  const [activeTab, setActiveTab] = useState<'rounds' | 'grants' | 'campus' | 'career'>('rounds');

  if (!isOpen || !university) return null;

  const { details } = university;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-mono font-semibold text-slate-700">
                {university.shortName}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {university.city}, {university.country}
              </span>
              <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                Совпадение: {university.matchScore}%
              </span>
            </div>

            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              {university.name}
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm font-medium text-blue-700">
              {university.programTitle} • {university.degrees[0]}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-5 flex border-b border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('rounds')}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 transition ${
              activeTab === 'rounds'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Раунды подачи (3 волны)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grants')}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 transition ${
              activeTab === 'grants'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Гранты и статистика</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('campus')}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 transition ${
              activeTab === 'campus'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Кампус и жилье</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('career')}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 transition ${
              activeTab === 'career'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Карьера</span>
          </button>
        </div>

        {/* TAB 1: ADMISSION ROUNDS (EARLY, REGULAR, LATE) */}
        {activeTab === 'rounds' && (
          <div className="mt-5 space-y-4 text-xs">
            {/* Early Round */}
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  <Clock className="h-3 w-3" />
                  <span>Ранняя подача (Early Round)</span>
                </span>
                <span className="font-mono font-semibold text-emerald-900">
                  Срок: {details.rounds.early.deadline}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-semibold text-slate-900">
                {details.rounds.early.name}
              </h4>
              <p className="mt-1 text-slate-700 leading-relaxed">
                {details.rounds.early.description}
              </p>
              <div className="mt-2.5 flex items-start gap-1.5 text-emerald-800 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>Рекомендация: {details.rounds.early.recommendedFor}</span>
              </div>
            </div>

            {/* Regular Round */}
            <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                  <Clock className="h-3 w-3" />
                  <span>Основная подача (Regular Round)</span>
                </span>
                <span className="font-mono font-semibold text-blue-900">
                  Срок: {details.rounds.regular.deadline}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-semibold text-slate-900">
                {details.rounds.regular.name}
              </h4>
              <p className="mt-1 text-slate-700 leading-relaxed">
                {details.rounds.regular.description}
              </p>
              <div className="mt-2.5 flex items-start gap-1.5 text-blue-800 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>Рекомендация: {details.rounds.regular.recommendedFor}</span>
              </div>
            </div>

            {/* Late Round */}
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                  <Clock className="h-3 w-3" />
                  <span>Поздняя подача / Добор (Late Round)</span>
                </span>
                <span className="font-mono font-semibold text-amber-900">
                  Срок: {details.rounds.late.deadline}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-semibold text-slate-900">
                {details.rounds.late.name}
              </h4>
              <p className="mt-1 text-slate-700 leading-relaxed">
                {details.rounds.late.description}
              </p>
              <div className="mt-2.5 flex items-start gap-1.5 text-amber-800 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>Рекомендация: {details.rounds.late.recommendedFor}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GRANT STATISTICS OF LAST YEAR */}
        {activeTab === 'grants' && (
          <div className="mt-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                  Выделено грантов в прошлом году:
                </span>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {details.grantStats.lastYearGrantsCount}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                  Проходной балл на грант (прошлый год):
                </span>
                <p className="mt-1 text-sm font-bold text-slate-900 font-mono">
                  {details.grantStats.lastYearCutoff}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-slate-900">Конкурс и отбор:</span>
              </div>
              <p className="text-slate-700 font-medium">
                {details.grantStats.competitionRatio}
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-blue-700" />
                <span className="font-semibold text-blue-900">Аналитика шансов:</span>
              </div>
              <p className="text-slate-800 leading-relaxed">
                {details.grantStats.grantChanceSummary}
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: CAMPUS & HOUSING */}
        {activeTab === 'campus' && (
          <div className="mt-5 space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <h4 className="font-semibold text-slate-900 mb-1">Инфраструктура и кампус:</h4>
              <p className="text-slate-700 leading-relaxed">{details.aboutCampus}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <h4 className="font-semibold text-slate-900 mb-1">Студенческая жизнь:</h4>
              <p className="text-slate-700 leading-relaxed">{details.studentLife}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <h4 className="font-semibold text-slate-900 mb-1">Общежитие:</h4>
                <p className="text-slate-700 leading-relaxed">{details.dormitoryDetails}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <h4 className="font-semibold text-slate-900 mb-1">Расходы на жизнь в месяц:</h4>
                <p className="text-slate-700 leading-relaxed">{details.livingCostsPerMonth}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CAREER & EMPLOYERS */}
        {activeTab === 'career' && (
          <div className="mt-5 space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                Средняя стартовая зарплата выпускника:
              </span>
              <p className="mt-1 text-base font-bold text-slate-900 font-mono">
                {university.avgGraduateSalary}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <h4 className="font-semibold text-slate-900 mb-2">
                Ключевые компании-работодатели выпускников:
              </h4>
              <div className="flex flex-wrap gap-2">
                {details.topEmployers.map((emp, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 shadow-xs"
                  >
                    {emp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            {onOpenEssayModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEssayModal(university);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Составить план эссе</span>
              </button>
            )}

            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(university.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                  isCompared
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{isCompared ? 'В сравнении' : 'Добавить к сравнению'}</span>
              </button>
            )}
          </div>

          <a
            href={university.officialSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
          >
            <span>Официальный портал admissions</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
