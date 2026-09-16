import React from 'react';
import { Compass, RotateCcw, Printer, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  hasProfile: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, hasProfile }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
            <Compass className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight text-slate-900">
                AdmitRoute
              </span>
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-700">
                LOCUSCASE2
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 sm:block">
              Персональный AI-навигатор поступления
            </p>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 md:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
            <span>9–11 класс и бакалавриат</span>
          </div>

          {hasProfile && (
            <>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                title="Печать или экспорт плана"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Экспорт плана</span>
              </button>

              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                title="Сбросить и заполнить заново"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span>Новый расчет</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
