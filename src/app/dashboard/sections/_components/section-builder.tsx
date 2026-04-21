'use client';

import { create, update } from '@/apis/content-template';
import type { TContentTemplate } from '@/types/business/content-template';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Separator,
  TextField,
  useOverlayState,
  Surface,
  Modal,
} from '@heroui/react';
import { Ref, useImperativeHandle, useState } from 'react';
import InfoLayerModal from './info-layer-modal';
import InfoLayerFieldList, {
  createInfoLayerRow,
  InfoLayerRow,
  normalizeOrders,
} from './info-layer-field-list';
import SectionRender from '@/components/section-render';
import { INFO_LAYER, INFO_LAYER_MAP } from '@/components/info-layer/const';

export type SectionBuilderHandle = {
  open: (next: TContentTemplate | null) => void;
};

interface IProps {
  ref: Ref<SectionBuilderHandle | null>;
  className?: string;
}

export default function SectionBuilder(props: IProps) {
  const { ref, className } = props;
  const queryClient = useQueryClient();
  const overlayState = useOverlayState();
  const [item, setItem] = useState<TContentTemplate | null>(null);
  const [sectionName, setSectionName] = useState('');
  const [infoLayers, setInfoLayers] = useState<InfoLayerRow[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetAfterSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: ['section-list'] });
    setSubmitError(null);
    setItem(null);
    setSectionName('');
    setInfoLayers([]);
    overlayState.close();
  };

  const createMutation = useMutation({
    mutationFn: create,
    onSuccess: (res) => {
      if (res.code !== 0) {
        setSubmitError(res.message || '创建失败');
        return;
      }
      resetAfterSuccess();
    },
    onError: (err) => {
      setSubmitError(err instanceof Error ? err.message : '创建失败');
    },
  });

  const updateMutation = useMutation({
    mutationFn: update,
    onSuccess: (res) => {
      if (res.code !== 0) {
        setSubmitError(res.message || '保存失败');
        return;
      }
      resetAfterSuccess();
    },
    onError: (err) => {
      setSubmitError(err instanceof Error ? err.message : '保存失败');
    },
  });

  useImperativeHandle(ref, () => {
    return {
      open: (next: TContentTemplate | null) => {
        setSubmitError(null);
        setItem(next);
        setSectionName(next?.name || '');
        setInfoLayers(
          next?.infoTemplates.map((t, i) => ({
            ...t,
            keyId: crypto.randomUUID(),
            order: i,
          })) || [],
        );
        overlayState.open();
      },
    };
  }, [overlayState]);

  return (
    <Modal>
      <Button
        className={className}
        onPress={() => {
          setSubmitError(null);
          setItem(null);
          setSectionName('');
          setInfoLayers([]);
          overlayState.open();
        }}
      >
        创建
      </Button>
      <Modal.Backdrop
        isOpen={overlayState.isOpen}
        onOpenChange={overlayState.setOpen}
      >
        <Modal.Container size="cover">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="px-2">
                {item ? '编辑模块' : '创建模块'}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <Form
                id="section-builder-form"
                className="contents"
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = sectionName.trim();
                  if (infoLayers.length === 0) {
                    return;
                  }
                  const ordered = normalizeOrders(infoLayers);
                  const infoTemplates = ordered.map(
                    ({ type, names, order }) => ({
                      type,
                      names,
                      order,
                    }),
                  );
                  if (item) {
                    updateMutation.mutate({
                      id: item.id,
                      name,
                      infoTemplates,
                    });
                    return;
                  }
                  createMutation.mutate({
                    name,
                    infoTemplates,
                  });
                }}
              >
                <div className="flex h-full px-2">
                  <section className="flex flex-1 flex-col gap-4">
                    <TextField
                      isRequired
                      value={sectionName}
                      onChange={(next) => {
                        setSubmitError(null);
                        setSectionName(next);
                      }}
                      validate={(value) => {
                        if (!value?.trim()) {
                          return '请填写模块名称';
                        }
                        return null;
                      }}
                    >
                      <Label>模块名称</Label>
                      <Input variant="secondary" />
                      <FieldError />
                    </TextField>
                    <TextField
                      className="relative"
                      value={infoLayers.length > 0 ? 'ok' : ''}
                      onChange={() => {}}
                      validate={(value) =>
                        !value ? '请至少添加一个信息层' : null
                      }
                    >
                      <Input
                        aria-hidden
                        tabIndex={-1}
                        className="pointer-events-none absolute h-px w-px overflow-hidden border-0 p-0 opacity-0"
                      />
                      <section>
                        <div className="flex justify-between">
                          <Label>信息层</Label>
                          <InfoLayerModal
                            onOk={(type) => {
                              setSubmitError(null);
                              setInfoLayers((prev) =>
                                normalizeOrders([
                                  ...prev,
                                  createInfoLayerRow(type),
                                ]),
                              );
                            }}
                          />
                        </div>
                        <Surface
                          variant="secondary"
                          className="mt-2 rounded-2xl p-4"
                        >
                          <InfoLayerFieldList
                            layers={infoLayers}
                            onLayersChange={(next) => {
                              setSubmitError(null);
                              setInfoLayers(next);
                            }}
                          />
                        </Surface>
                        <FieldError className="mt-2" />
                      </section>
                    </TextField>
                  </section>
                <Separator className="mx-2" orientation="vertical" />
                  <section className="flex-1">
                    <Label>预览</Label>

                    <Surface
                      variant="secondary"
                      className="flex min-h-0 flex-col rounded-2xl p-4"
                    >
                      <div className="rounded-xl bg-white p-6">
                        <SectionRender
                          contentTemplate={{
                            name: sectionName,
                            infoTemplates: infoLayers,
                          }}
                          status="view"
                          contents={[
                            {
                              infos: infoLayers.map((t) => ({
                                type: t.type,
                                values:
                                  INFO_LAYER_MAP[t.type as INFO_LAYER]
                                    .defaultProps.values,
                              })),
                            },
                          ]}
                          onContentsChange={() => {}}
                        />
                      </div>
                    </Surface>
                  </section>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer className="flex flex-col items-stretch gap-2">
              {submitError ? (
                <p className="text-danger text-sm">{submitError}</p>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button slot="close" variant="secondary">
                  取消
                </Button>
                <Button
                  type="submit"
                  form="section-builder-form"
                  variant="primary"
                  isDisabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {item ? '保存' : '创建'}
                </Button>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
