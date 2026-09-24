import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
}

export const ReferralModal: React.FC<Props> = ({ isOpen, onClose, referralCode = 'AR-7X9K2M' }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${referralCode}`
    : `https://admitroute.kz/?ref=${referralCode}`;

  const shareText = `Привет! Я готовлюсь к поступлению в университет через AdmitRoute. Регистрируйся по моей ссылке и получи +5 бесплатных AI-подборов программ: ${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTelegramShare = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Получи +5 AI-поисков для поступления в AdmitRoute!')}`, '_blank');
  };

  const handleWhatsappShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm transition"
        >
          ✕
        </button>

        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-amber-500/20">
            🎁
          </div>
          <h3 className="text-xl font-black text-slate-900">Пригласи друга в AdmitRoute</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Получите по <b>+5 бонусных AI-поисков</b> программ и грантов вы и ваш друг!
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-2">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Ваш персональный реферальный код
            </div>
            <div className="text-2xl font-mono font-black text-slate-900 tracking-wider">
              {referralCode}
            </div>
            <div className="text-[11px] text-slate-500">
              Код защищён от повторного использования и само-рефералов.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">Ваша персональная ссылка:</div>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
              >
                {copied ? '✓' : 'Копировать'}
              </button>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={handleTelegramShare}
              className="flex-1 py-2.5 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>✈️</span> Telegram
            </button>
            <button
              onClick={handleWhatsappShare}
              className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>💬</span> WhatsApp
            </button>
          </div>
        </div>

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
