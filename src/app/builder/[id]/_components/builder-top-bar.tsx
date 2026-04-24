'use client';

import { Button, Tooltip } from '@heroui/react';
import {
  ArrowLeft,
  Check,
  Download,
  Loader2,
  PanelLeft,
  PanelRight,
  Save,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export type TSaveStatus = 'saving' | 'saved';

/** 简历名称区域：与 resume detail 拉取状态对应 */
export type TTitleState = 'loading' | 'error' | 'ready';

/** 小型装饰性竖线；不使用 `Separator`，避免 `align-self: stretch` 把高度撑满父容器 */
function InlineDivider() {
  return (
    <span
      aria-hidden
      className="bg-default-200 mx-1 h-5 w-px shrink-0 self-center"
    />
  );
}

interface IProps {
  title: string;
  /** 默认 `ready`；`loading` / `error` 时顶栏内自行展示占位与错误文案 */
  titleState?: TTitleState;
  status: TSaveStatus;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  onExport: () => void;
  onSave: () => void;
  isSaving?: boolean;
  /** 插在「导出」按钮左侧，例如本页调试用 */
  beforeExportExtra?: ReactNode;
}

function StatusBadge({ status }: { status: TSaveStatus }) {
  if (status === 'saving') {
    return (
      <span className="text-muted inline-flex items-center gap-1 text-xs">
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
        同步中
      </span>
    );
  }
  return (
    <span className="text-muted inline-flex items-center gap-1 text-xs">
      <Check className="size-3.5" aria-hidden />
      已保存
    </span>
  );
}

export default function BuilderTopBar(props: IProps) {
  const {
    title,
    titleState = 'ready',
    status,
    leftPanelOpen,
    rightPanelOpen,
    onToggleLeftPanel,
    onToggleRightPanel,
    onExport,
    onSave,
    isSaving,
    beforeExportExtra,
  } = props;
  const router = useRouter();

  return (
    <header className="bg-background flex h-14 shrink-0 items-center gap-2 px-3">
      <Tooltip delay={300}>
        <Button
          aria-label="返回简历列表"
          variant="ghost"
          size="sm"
          isIconOnly
          onPress={() => router.push('/dashboard/resumes')}
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Button>
        <Tooltip.Content>
          <p>返回简历列表</p>
        </Tooltip.Content>
      </Tooltip>

      <InlineDivider />

      {titleState === 'loading' ? (
        <span
          className="bg-default-200 h-4 w-[11rem] max-w-[22rem] shrink animate-pulse rounded"
          role="status"
          aria-label="正在加载简历名称"
        />
      ) : titleState === 'error' ? (
        <h1 className="text-default-400 max-w-[22rem] shrink truncate text-sm font-semibold">
          无法加载简历
        </h1>
      ) : (
        <h1 className="text-foreground max-w-[22rem] shrink truncate text-sm font-semibold">
          {title.trim() || '未命名简历'}
        </h1>
      )}

      {titleState === 'ready' ? <StatusBadge status={status} /> : null}

      <div className="ml-auto flex items-center gap-1">
        <Tooltip delay={300}>
          <Button
            aria-label={leftPanelOpen ? '收起左侧面板' : '展开左侧面板'}
            aria-pressed={leftPanelOpen}
            variant="ghost"
            size="sm"
            isIconOnly
            onPress={onToggleLeftPanel}
          >
            <PanelLeft
              className={[
                'size-4 transition-colors',
                leftPanelOpen ? 'text-foreground' : 'text-default-400',
              ].join(' ')}
              aria-hidden
            />
          </Button>
          <Tooltip.Content>
            <p>{leftPanelOpen ? '收起左侧面板' : '展开左侧面板'}</p>
          </Tooltip.Content>
        </Tooltip>

        <Tooltip delay={300}>
          <Button
            aria-label={rightPanelOpen ? '收起右侧面板' : '展开右侧面板'}
            aria-pressed={rightPanelOpen}
            variant="ghost"
            size="sm"
            isIconOnly
            onPress={onToggleRightPanel}
          >
            <PanelRight
              className={[
                'size-4 transition-colors',
                rightPanelOpen ? 'text-foreground' : 'text-default-400',
              ].join(' ')}
              aria-hidden
            />
          </Button>
          <Tooltip.Content>
            <p>{rightPanelOpen ? '收起右侧面板' : '展开右侧面板'}</p>
          </Tooltip.Content>
        </Tooltip>

        {beforeExportExtra ? (
          <>
            <InlineDivider />
            {beforeExportExtra}
          </>
        ) : null}

        <InlineDivider />

        <Button variant="secondary" size="sm" onPress={onExport}>
          <Download className="size-4" aria-hidden />
          导出
        </Button>

        <Button
          variant="primary"
          size="sm"
          onPress={onSave}
          isDisabled={isSaving}
        >
          <Save className="size-4" aria-hidden />
          保存
        </Button>
      </div>
    </header>
  );
}
