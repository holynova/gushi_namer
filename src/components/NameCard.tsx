import React, { useMemo, useRef, useState } from 'react';
import type { GeneratedName } from '../utils/namer';
import { Copy, Download, Heart, Share2, X } from 'lucide-react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';

interface NameCardProps {
  data: GeneratedName;
  familyName: string;
  onFavorite?: () => Promise<void>;
  isFavorited?: boolean;
}

const PROJECT_URL = 'https://holynova.github.io/gushi_namer/';

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
  const [downloadingCard, setDownloadingCard] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const fullName = `${familyName}${name}`;
  const source = `${dynasty ? `${dynasty} · ` : ''}${author || '佚名'} · ${title}`;

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

  const handleDownloadCard = async () => {
    if (!shareCardRef.current) return;

    setDownloadingCard(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#FFFDF8',
      });
      const anchor = document.createElement('a');
      anchor.href = dataUrl;
      anchor.download = `gushi-namer-${fullName}.png`;
      anchor.click();
    } catch (error) {
      console.error('生成分享卡片失败:', error);
    } finally {
      setDownloadingCard(false);
    }
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
              <div
                ref={shareCardRef}
                className="rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-6 text-center shadow-sm shadow-[#B59B7A]/10"
              >
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
                  <div className="rounded-md bg-white p-1" aria-label="古诗文起名项目二维码">
                    <QRCodeSVG
                      value={PROJECT_URL}
                      size={80}
                      bgColor="#FFFFFF"
                      fgColor="#28231D"
                      marginSize={1}
                    />
                  </div>
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
                disabled={downloadingCard}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2F765C] px-3 font-sans text-sm text-white transition hover:bg-[#275F4B] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Download className="h-4 w-4" />
                {downloadingCard ? '生成中...' : '下载 PNG'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
