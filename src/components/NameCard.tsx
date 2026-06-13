import React, { useMemo, useState } from 'react';
import type { GeneratedName } from '../utils/namer';
import { Copy, Download, Heart, Share2, X } from 'lucide-react';

interface NameCardProps {
  data: GeneratedName;
  familyName: string;
  onFavorite?: () => Promise<void>;
  isFavorited?: boolean;
}

const PROJECT_URL = 'https://holynova.github.io/gushi_namer/';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const splitText = (text: string, maxLength: number) => {
  const lines: string[] = [];
  for (let i = 0; i < text.length; i += maxLength) {
    lines.push(text.slice(i, i + maxLength));
  }
  return lines;
};

export const NameCard: React.FC<NameCardProps> = ({
  data,
  familyName,
  onFavorite,
  isFavorited = false,
}) => {
  const { name, sentence, book, title, author, dynasty } = data;
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const fullName = `${familyName}${name}`;
  const source = `${dynasty ? `${dynasty} · ` : ''}${author || '佚名'} · ${title}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(PROJECT_URL)}`;

  const shareText = useMemo(
    () => `我在「古诗文起名」遇到了名字：${fullName}\n\n「${sentence}」\n${source}\n\n${PROJECT_URL}`,
    [fullName, sentence, source]
  );

  const handleFavoriteClick = async () => {
    if (!onFavorite) return;

    setLoading(true);
    try {
      await onFavorite();
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    } catch (error) {
      console.error('收藏操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShare = async () => {
    await navigator.clipboard.writeText(shareText);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1800);
  };

  const buildShareSvg = () => {
    const sentenceLines = splitText(sentence, 16);
    const sourceLines = splitText(source, 18);
    const nameChars = name.split('');
    const sentenceTspans = sentenceLines
      .map((line, index) => {
        const chars = line
          .split('')
          .map((char) =>
            nameChars.includes(char)
              ? `<tspan font-weight="700" fill="#1F5F4A">${escapeXml(char)}</tspan>`
              : escapeXml(char)
          )
          .join('');
        return `<tspan x="96" dy="${index === 0 ? 0 : 34}">${chars}</tspan>`;
      })
      .join('');
    const sourceTspans = sourceLines
      .map((line, index) => `<tspan x="96" dy="${index === 0 ? 0 : 24}">${escapeXml(line)}</tspan>`)
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFDF8"/>
      <stop offset="1" stop-color="#F4E7D2"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#8D7B68" flood-opacity="0.22"/>
    </filter>
  </defs>
  <rect width="900" height="1200" fill="#F7F0E4"/>
  <rect x="60" y="60" width="780" height="1080" rx="34" fill="url(#paper)" stroke="#D7C7AF" stroke-width="3" filter="url(#shadow)"/>
  <text x="96" y="140" fill="#8D5A4F" font-family="Arial, sans-serif" font-size="24" letter-spacing="6">GUSHI NAMER</text>
  <text x="96" y="272" fill="#28231D" font-family="KaiTi, STKaiti, serif" font-size="94" font-weight="700">${escapeXml(fullName)}</text>
  <line x1="96" y1="326" x2="804" y2="326" stroke="#D7C7AF" stroke-width="3"/>
  <text x="96" y="430" fill="#2F765C" font-family="KaiTi, STKaiti, serif" font-size="42">${sentenceTspans}</text>
  <text x="96" y="612" fill="#6D6257" font-family="Arial, sans-serif" font-size="28">${sourceTspans}</text>
  <rect x="96" y="740" width="708" height="250" rx="24" fill="#F7F0E4" stroke="#E2D5C2"/>
  <text x="130" y="808" fill="#28231D" font-family="KaiTi, STKaiti, serif" font-size="34">翻阅经典，与一个好名字不期而遇</text>
  <text x="130" y="862" fill="#6D6257" font-family="Arial, sans-serif" font-size="24">${escapeXml(PROJECT_URL)}</text>
  <image href="${qrUrl}" x="630" y="790" width="132" height="132"/>
  <text x="130" y="940" fill="#2F765C" font-family="Arial, sans-serif" font-size="22">扫码打开古诗文起名</text>
</svg>`;
  };

  const handleDownloadCard = () => {
    const svg = buildShareSvg();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `gushi-namer-${fullName}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const highlightSentence = () => {
    const chars = name.split('');

    return (
      <span>
        {sentence.split('').map((char, i) => {
          const isNameChar = chars.includes(char);
          return (
            <span
              key={i}
              className={isNameChar ? 'text-matsu-primary font-bold' : ''}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  const renderShareSentence = () => {
    const chars = name.split('');

    return (
      <>
        「
        {sentence.split('').map((char, index) => {
          const isNameChar = chars.includes(char);
          return (
            <span
              key={index}
              className={isNameChar ? 'font-bold text-[#1F5F4A]' : ''}
            >
              {char}
            </span>
          );
        })}
        」
      </>
    );
  };

  return (
    <>
      <div
        className={`group relative flex h-full flex-col justify-between rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-5 shadow-sm shadow-[#B59B7A]/10 transition hover:-translate-y-0.5 hover:border-[#2F765C]/50 hover:shadow-md ${
          isAnimating ? 'animate-pulse-scale' : ''
        }`}
      >
        <div className="absolute right-4 top-4 flex gap-2">
          <button
            onClick={() => setShareOpen(true)}
            className="rounded-full border border-[#D7C7AF] p-2 text-[#8D7B68] transition hover:border-[#2F765C] hover:text-[#2F765C]"
            aria-label="分享"
          >
            <Share2 className="h-5 w-5" />
          </button>
          {onFavorite && (
            <button
              onClick={handleFavoriteClick}
              disabled={loading}
              className={`rounded-full border p-2 transition disabled:opacity-50 ${
                isFavorited
                  ? 'border-[#B85B4D] bg-[#B85B4D] text-white'
                  : 'border-[#D7C7AF] text-[#8D7B68] hover:border-[#B85B4D] hover:text-[#B85B4D]'
              }`}
              aria-label={isFavorited ? '取消收藏' : '收藏'}
            >
              <Heart
                className={`h-5 w-5 transition-all duration-300 ${isFavorited ? 'fill-current scale-110' : ''}`}
              />
            </button>
          )}
        </div>

        <div className="mb-4 pr-24">
          <h3 className="mb-2 font-serif text-[2.5rem] font-bold leading-tight text-[#28231D] transition-colors md:text-4xl">
            {fullName}
          </h3>
          <p className="font-sans text-sm text-[#6D6257]">
            {source}
          </p>
        </div>

        <div className="space-y-4">
          <blockquote className="border-l-2 border-[#2F765C] pl-4 font-serif text-base leading-8 text-[#3C352E] md:text-lg">
            {highlightSentence()}
          </blockquote>

          <div className="flex flex-wrap gap-2 border-t border-[#E2D5C2] pt-4">
            <span className="rounded-full bg-[#F7F0E4] px-3 py-1 font-sans text-xs font-medium text-[#5D5145]">
              《{title}》
            </span>
            <span className="rounded-full bg-[#F7F0E4] px-3 py-1 font-sans text-xs font-medium text-[#5D5145]">
              {book}
            </span>
          </div>
        </div>
      </div>

      {shareOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#28231D]/55 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-full w-full max-w-[420px] overflow-y-auto rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-4 shadow-2xl shadow-[#28231D]/30">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#8D5A4F]">
                  Share Card
                </p>
                <h2 className="font-serif text-xl font-bold text-[#28231D]">分享这个名字</h2>
              </div>
              <button
                onClick={() => setShareOpen(false)}
                className="rounded-full border border-[#D7C7AF] p-2 text-[#8D7B68] transition hover:border-[#B85B4D] hover:text-[#B85B4D]"
                aria-label="关闭分享卡片"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#D7C7AF] bg-[#F7F0E4] p-5">
              <div className="rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-6 text-center shadow-sm shadow-[#B59B7A]/10">
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8D5A4F]">
                  Gushi Namer
                </p>
                <h3 className="mt-5 font-serif text-5xl font-bold leading-tight text-[#28231D]">
                  {fullName}
                </h3>
                <blockquote className="mx-auto mt-5 max-w-[280px] border-y border-[#D7C7AF] py-4 font-serif text-xl leading-9 text-[#2F765C]">
                  {renderShareSentence()}
                </blockquote>
                <p className="mt-4 font-sans text-sm leading-6 text-[#6D6257]">
                  {source}
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 rounded-lg bg-[#F7F0E4] p-4">
                  <img
                    src={qrUrl}
                    alt="古诗文起名项目二维码"
                    className="h-20 w-20 rounded-md bg-white p-1"
                  />
                  <div className="text-left font-sans">
                    <p className="text-sm font-semibold text-[#28231D]">扫码试试你的名字</p>
                    <p className="mt-1 break-all text-xs leading-5 text-[#6D6257]">{PROJECT_URL}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyShare}
                className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#D7C7AF] bg-white px-3 font-sans text-sm text-[#2F765C] transition hover:border-[#2F765C]"
              >
                <Copy className="h-4 w-4" />
                {shareCopied ? '已复制' : '复制文案'}
              </button>
              <button
                onClick={handleDownloadCard}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2F765C] px-3 font-sans text-sm text-white transition hover:bg-[#275F4B]"
              >
                <Download className="h-4 w-4" />
                下载卡片
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
