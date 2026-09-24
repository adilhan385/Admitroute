import React, { useState, useEffect } from 'react';
import { getShareLinkStatus, createShareLink, revokeShareLink } from '../services/retention';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareRoadmapModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(isOpen);
  const [hasActiveLink, setHasActiveLink] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      getShareLinkStatus().then(data => {
        if (!isMounted) return;
        setHasActiveLink(data.hasActiveLink);
        setShareUrl(data.shareUrl || null);
        setLoading(false);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleCreate = async () => {
    setLoading(true);
    const res = await createShareLink();
    if (res.success && res.shareUrl) {
      setHasActiveLink(true);
      setShareUrl(res.shareUrl);
    }
    setLoading(false);
  };

  const handleRevoke = async () => {
    if (!confirm('Отозвать ссылку? Родители и менторы больше не смогут просматривать дорожную карту по этой ссылке.')) return;
    setLoading(true);
    const ok = await revokeShareLink();
    if (ok) {
      setHasActiveLink(false);
      setShareUrl(null);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm transition"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl">
            👥
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Доступ для родителей / ментора</h3>
            <p className="text-xs text-slate-500">Безопасный режим только для чтения (Read-Only)</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Поделитесь дорожной картой поступления с родителями или школьным ментором. Они смогут отслеживать статус подачи документов и дедлайны без необходимости входить в аккаунт.
        </p>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 mb-5 text-[11px] text-slate-600 space-y-1.5">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <span>🛡️</span> Конфиденциальность и безопасность:
          </div>
          <div>• Ментор видит только выбранные вузы, этапы канбан-трекера и дедлайны.</div>
          <div>• Личные переписки с куратором, черновики эссе и пароли <b>строго скрыты</b>.</div>
          <div>• Вы можете в один клик отозвать доступ в любое время.</div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Обработка запроса...</div>
        ) : hasActiveLink && shareUrl ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
              <div className="text-xs font-semibold text-indigo-900">Активная ссылка доступа:</div>
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>{copied ? '✓' : '📋'}</span> {copied ? 'Скопировано!' : 'Скопировать ссылку'}
                </button>
                <button
                  onClick={handleRevoke}
                  className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold transition"
                >
                  Отозвать
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleCreate}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
          >
            <span>🔗</span> Сгенерировать защищённую ссылку
          </button>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
