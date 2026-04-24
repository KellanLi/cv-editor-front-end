'use client';

import { captureResumeCoverToPng } from '@/lib/capture-resume-cover';
import { logResumeCoverError } from '@/lib/resume-cover-error-log';
import { useResumeSnapshotOptional } from '@/lib/resume-snapshot-context';
import { Button, Modal, Tooltip, useOverlayState } from '@heroui/react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

const CAPTURE_SCALE = 1.25;

type IProps = {
  captureRootRef: RefObject<HTMLDivElement | null>;
  ready: boolean;
};

/**
 * 手动触发与列表封面同参数的简历截图，并在弹窗中预览。仅用于本页调试，不参与上传。
 */
export default function ResumeCoverPreviewDebug(props: IProps) {
  const { captureRootRef, ready } = props;
  const snapshot = useResumeSnapshotOptional();
  const modal = useOverlayState();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  const revokeAndClear = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setImageUrl(null);
  }, []);

  useEffect(
    () => () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    },
    [],
  );

  const handlePreview = useCallback(async () => {
    setError(null);
    revokeAndClear();
    setIsRunning(true);
    modal.setOpen(true);

    if (!ready || !snapshot) {
      setError('页面未就绪（请等待简历与模块加载完成）。');
      setIsRunning(false);
      return;
    }
    const el = captureRootRef.current;
    if (!el) {
      setError('未找到简历主容器。');
      setIsRunning(false);
      return;
    }
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      setError('请先将本标签页切到前台再截图。');
      setIsRunning(false);
      return;
    }
    try {
      await snapshot.exitAllToView();
      await new Promise<void>((r) => {
        setTimeout(r, 0);
      });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
      const el2 = captureRootRef.current;
      if (!el2) {
        throw new Error('简历主容器在截图前被卸载。');
      }
      const blob = await captureResumeCoverToPng(el2, {
        scale: CAPTURE_SCALE,
      });
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setImageUrl(url);
    } catch (e) {
      logResumeCoverError('调试图（顶栏「封面调试」）', e);
      setError(
        e instanceof Error ? e.message : typeof e === 'string' ? e : '截图失败',
      );
    } finally {
      setIsRunning(false);
    }
  }, [captureRootRef, modal, ready, revokeAndClear, snapshot]);

  return (
    <>
      <Tooltip delay={300}>
        <Button
          aria-label="简历转图片（调试）"
          variant="ghost"
          size="sm"
          isDisabled={!ready || isRunning}
          onPress={() => {
            void handlePreview();
          }}
        >
          {isRunning ? (
            <Loader2
              className="text-default-500 size-4 animate-spin"
              aria-hidden
            />
          ) : (
            <ImageIcon className="text-default-600 size-4" aria-hidden />
          )}
          封面调试
        </Button>
        <Tooltip.Content>
          <p>与列表封面同参数，生成 PNG 并在此预览；不上传。</p>
        </Tooltip.Content>
      </Tooltip>

      <Modal>
        <Modal.Backdrop
          isOpen={modal.isOpen}
          onOpenChange={(open) => {
            modal.setOpen(open);
            if (!open) {
              revokeAndClear();
              setError(null);
            }
          }}
        >
          <Modal.Container size="lg" placement="center">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>简历封面图 · 调试图</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                {isRunning ? (
                  <p className="text-muted flex items-center gap-2 text-sm">
                    <Loader2
                      className="text-default-500 size-4 shrink-0 animate-spin"
                      aria-hidden
                    />
                    正在生成（与自动封面同逻辑：先切到只读再 html2canvas）…
                  </p>
                ) : null}
                {error ? (
                  <p className="text-danger text-sm" role="alert">
                    {error}
                  </p>
                ) : null}
                {imageUrl && !isRunning ? (
                  <div className="bg-default-100/80 flex max-h-[min(70vh,560px)] w-full items-start justify-center overflow-auto rounded-md p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob 本地预览 */}
                    <img
                      src={imageUrl}
                      alt="与列表封面相同：A4 竖版比例（高宽比 297:210）PNG 预览"
                      className="h-auto w-full max-w-full object-top"
                    />
                  </div>
                ) : null}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onPress={() => {
                    modal.setOpen(false);
                  }}
                >
                  关闭
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
