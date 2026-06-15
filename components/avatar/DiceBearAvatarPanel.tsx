"use client";
import { createAvatar } from '@dicebear/core';
import * as collection from '@dicebear/collection';
import { Avatar } from "../ui/avatar";
import { Input } from "../ui/input";
import Image from "next/image";
import type { Style } from "@dicebear/core";

const styleOptions = [
  { value: 'lorelei', label: '洛雷莱' },
  { value: 'croodles', label: '涂鸦' },
  { value: 'notionists', label: '概念' },
  { value: 'openPeeps', label: '开放' },
  { value: 'micah', label: '简约' },
  { value: 'miniavs', label: '迷你' },
  { value: 'personas', label: '人物' },
  { value: 'avataaars', label: '卡通' },
  { value: 'bottts', label: '机器人' },
  { value: 'pixelArt', label: '像素' },
  { value: 'identicon', label: '几何' },
  { value: 'initials', label: '字母' },
  { value: 'rings', label: '环形' },
  { value: 'shapes', label: '形状' },
  { value: 'thumbs', label: '拇指' },
  { value: 'funEmoji', label: '表情' },
  { value: 'bigEars', label: '大耳朵' },
  { value: 'bigSmile', label: '大笑' },
];

function getAvatarSvg(style: string, seed: string) {
  const styleModule = collection[style as keyof typeof collection] as Style<Record<string, unknown>>;
  if (!styleModule) return '';
  const avatar = createAvatar(styleModule, { seed });
  return avatar.toString();
}

function svgToDataUri(svg: string) {
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

function randomSeed() {
  return Math.random().toString(36).slice(2, 10);
}

interface DiceBearAvatarPanelProps {
  value: {
    avatarStyle: string;
    avatarSeed: string;
  };
  onChange: (data: { avatarStyle: string; avatarSeed: string }) => void;
}

const DiceBearAvatarPanel = ({ value, onChange }: DiceBearAvatarPanelProps) => {
  const { avatarStyle, avatarSeed } = value;

  // 切换风格
  const handleStyleChange = (style: string) => {
    onChange({ ...value, avatarStyle: style });
  };

  // 随机生成种子
  const handleRandomize = () => {
    onChange({ ...value, avatarSeed: randomSeed() });
  };


  return (
      <div className="flex flex-col items-center space-y-6 p-1">
        {/* 当前风格和种子输入 */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 mb-2 w-full">
          <span>当前风格: <span className="font-semibold text-blue-600">{avatarStyle}</span></span>
          <div className="flex items-center gap-1">
            <span>当前种子:</span>
            <Input
                className="w-32 h-7 px-2 py-1 text-xs"
                value={avatarSeed}
                maxLength={50}
                onChange={e => onChange({ ...value, avatarSeed: e.target.value })}
                placeholder="seed"
            />
            <button
                onClick={handleRandomize}
                type="button"
                className="ml-1 px-3 py-1 bg-black text-white rounded-md hover:bg-black-600 transition-colors text-xs flex items-center gap-1 shadow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              随机
            </button>
          </div>
        </div>
        {/* 风格选择网格 */}
        <div className="grid grid-cols-5 gap-3 max-h-32 overflow-y-auto mb-2">
          {styleOptions.map((opt) => {
            const smallSvg = getAvatarSvg(opt.value, avatarSeed);
            const smallDataUri = svgToDataUri(smallSvg);
            return (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleStyleChange(opt.value)}
                    className={`flex flex-col items-center focus:outline-none group ${avatarStyle === opt.value ? 'border-blue-500 border-2 bg-blue-50' : 'border-transparent border-2'}`}
                >
                  <Avatar className="w-15 h-15">
                    <Image src={smallDataUri} alt={opt.label} fill style={{objectFit:'cover'}} />
                  </Avatar>
                  <span className={`text-xs mt-1 ${avatarStyle === opt.value ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>{opt.label}</span>
                </button>
            );
          })}
        </div>
      </div>
  );
};

export default DiceBearAvatarPanel; 