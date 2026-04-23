'use client';

export default function CenterPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col items-center overflow-y-auto py-8">
      <div className="flex min-h-[1120px] w-full max-w-[820px] flex-col gap-4 rounded-lg bg-white p-10 shadow-sm">
        <div>
          <p className="text-default-400 text-xs">个人信息模块（占位）</p>
        </div>
        <div className="text-muted flex flex-1 items-center justify-center text-sm">
          简历编辑/预览区建设中
        </div>
      </div>
    </div>
  );
}
