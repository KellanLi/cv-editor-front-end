'use client';

import { Sparkles } from 'lucide-react';

export default function LeftPanel() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-11 shrink-0 items-center px-4">
        <h2 className="text-foreground text-sm font-semibold">AI 对话</h2>
      </header>
      <div className="text-muted flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <Sparkles className="text-default-300 size-8" aria-hidden />
        <p className="text-sm">AI 对话区建设中</p>
      </div>
    </div>
  );
}
