'use client';

import { updateProfile } from '@/apis/resume';
import { upload } from '@/apis/storage';
import type { TResumeUpdateProfileReq } from '@/types/api/resume/update-profile';
import type { TResumeProfile } from '@/types/business/resume-profile';
import {
  Button,
  Calendar,
  DateField,
  DatePicker,
  FieldError,
  Input,
  InputGroup,
  Label,
  Modal,
  Spinner,
  TextField,
  useOverlayState,
} from '@heroui/react';
import { parseDate, type CalendarDate } from '@internationalized/date';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  Camera,
  Mail,
  Phone,
  Plus,
  Target,
  UserRound,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type SyntheticEvent,
} from 'react';

const dateInView = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

type TModuleStatus = 'view' | 'edit';

type TProfileDraft = {
  photoUrl: string;
  fullName: string;
  birthDate: string;
  gender: string;
  targetPosition: string;
  email: string;
  phone: string;
  tags: string[];
};

function isoToDateInput(value: string | undefined): string {
  if (!value?.trim()) return '';
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return '';
  const d = new Date(t);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseCalendarDateSafe(v: string): CalendarDate | null {
  if (!v?.trim()) return null;
  try {
    return parseDate(v);
  } catch {
    return null;
  }
}

function dateInputToIso(yyyyMmDd: string | undefined): string | undefined {
  if (!yyyyMmDd?.trim()) return undefined;
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)).toISOString();
}

function toDraft(p?: TResumeProfile): TProfileDraft {
  const extra = p?.profileExtra;
  return {
    photoUrl: p?.photoUrl?.trim() ?? '',
    fullName: p?.fullName?.trim() ?? '',
    birthDate: isoToDateInput(p?.birthDate),
    gender: p?.gender?.trim() ?? '',
    targetPosition: p?.targetPosition?.trim() ?? '',
    email: p?.email?.trim() ?? '',
    phone: p?.phone?.trim() ?? '',
    tags: Array.isArray(extra)
      ? extra.map((t) => t.trim()).filter(Boolean)
      : [],
  };
}

/** 空字符串 / 空数组 → `null`；否则原样返回。供给后端显式「清空」语义。 */
function emptyToNull<T extends string | string[]>(v: T): T | null {
  if (typeof v === 'string') return (v.trim() ? v : null) as T | null;
  return (v.length ? v : null) as T | null;
}

function toUpdatePayload(
  resumeId: number,
  d: TProfileDraft,
): TResumeUpdateProfileReq {
  const birthIso = d.birthDate ? dateInputToIso(d.birthDate) : null;
  return {
    id: resumeId,
    photoUrl: emptyToNull(d.photoUrl),
    fullName: emptyToNull(d.fullName),
    birthDate: birthIso ?? null,
    gender: emptyToNull(d.gender),
    targetPosition: emptyToNull(d.targetPosition),
    email: emptyToNull(d.email),
    phone: emptyToNull(d.phone),
    profileExtra: emptyToNull(d.tags),
  };
}

function formatBirthForView(yyyyMmDd: string, iso?: string) {
  if (yyyyMmDd) {
    const [y, m, day] = yyyyMmDd.split('-').map(Number);
    if (y && m && day) {
      return dateInView.format(new Date(y, m - 1, day));
    }
  }
  if (iso) {
    try {
      return dateInView.format(new Date(iso));
    } catch {
      return null;
    }
  }
  return null;
}

interface IProfileModuleProps {
  resumeId: number;
  /** 来自 `resume/profile` 详情；可缺省（尚未建 Profile 行时） */
  profile?: TResumeProfile;
}

interface IClearableTextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
  validate?: (v: string | undefined) => string | null;
}

/** 受控文本输入：内置右侧「清空」按钮，值非空才出现 */
function ClearableTextField(props: IClearableTextFieldProps) {
  const { label, name, value, onChange, placeholder, type, validate } = props;
  return (
    <TextField
      className="sm:col-span-1"
      name={name}
      value={value}
      onChange={onChange}
      validate={validate}
    >
      <Label className="text-default-600 text-xs">{label}</Label>
      <InputGroup variant="secondary" className="h-9 min-h-0">
        <InputGroup.Input
          type={type ?? 'text'}
          placeholder={placeholder}
          className="text-sm"
        />
        {value ? (
          <InputGroup.Suffix className="pr-1">
            <Button
              type="button"
              isIconOnly
              variant="ghost"
              size="sm"
              aria-label={`清空${label}`}
              className="h-6 min-w-0 px-1"
              onPress={() => onChange('')}
            >
              <X className="text-default-500 size-3.5" />
            </Button>
          </InputGroup.Suffix>
        ) : null}
      </InputGroup>
      <FieldError />
    </TextField>
  );
}

export default function ProfileModule(props: IProfileModuleProps) {
  const { resumeId, profile } = props;
  const queryClient = useQueryClient();
  const [moduleStatus, setModuleStatus] = useState<TModuleStatus>('view');
  const [draft, setDraft] = useState<TProfileDraft>(() => toDraft(profile));
  const [tagInput, setTagInput] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const photoDialog = useOverlayState();
  const [pickError, setPickError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const completeEditRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const queryKey = useMemo(() => ['resume', resumeId] as const, [resumeId]);

  useEffect(() => {
    if (moduleStatus === 'view') {
      setDraft(toDraft(profile));
    }
  }, [moduleStatus, profile]);

  const updateMutation = useMutation({
    mutationFn: (body: TResumeUpdateProfileReq) => updateProfile(body),
    onSuccess: (res) => {
      if (res.code !== 0) {
        setSaveError(res.message || '保存失败');
        return;
      }
      setSaveError(null);
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (e) => {
      setSaveError(e instanceof Error ? e.message : '保存失败');
    },
  });

  const enterEdit = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation();
      setSaveError(null);
      setDraft(toDraft(profile));
      setModuleStatus('edit');
    },
    [profile],
  );

  const closePhotoDialog = useCallback(() => {
    setPickError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    photoDialog.close();
  }, [photoDialog, previewUrl]);

  const handleFileSelected = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setPickError('请上传图片文件');
      return;
    }
    setPickError(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const handleApplyPhoto = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!previewUrl) return;
      setIsUploading(true);
      setPickError(null);
      try {
        const input = document.getElementById(
          `photo-pick-${fileId}`,
        ) as HTMLInputElement | null;
        const file = input?.files?.[0];
        if (!file) {
          setPickError('请选择图片');
          return;
        }
        const res = await upload(file);
        if (res.code !== 0 || !res.data?.url) {
          setPickError(res.message || '上传失败');
          return;
        }
        const url = res.data.url;
        setDraft((d) => ({ ...d, photoUrl: url }));
        updateMutation.mutate({ id: resumeId, photoUrl: url });
        closePhotoDialog();
      } catch (err) {
        setPickError(err instanceof Error ? err.message : '上传失败');
      } finally {
        setIsUploading(false);
      }
    },
    [closePhotoDialog, fileId, previewUrl, resumeId, updateMutation],
  );

  const addTag = useCallback(() => {
    const t = tagInput.trim();
    if (!t) return;
    if (draft.tags.includes(t)) {
      setTagInput('');
      return;
    }
    setDraft((d) => ({ ...d, tags: [...d.tags, t] }));
    setTagInput('');
  }, [draft.tags, tagInput]);

  const removeTag = useCallback((i: number) => {
    setDraft((d) => ({
      ...d,
      tags: d.tags.filter((_, j) => j !== i),
    }));
  }, []);

  const completeEdit = useCallback(async () => {
    setSaveError(null);
    try {
      const res = await updateMutation.mutateAsync(
        toUpdatePayload(resumeId, draft),
      );
      if (res.code !== 0) {
        setSaveError(res.message || '保存失败');
        return;
      }
      setModuleStatus('view');
    } catch {
      /* onError 已设 saveError */
    }
  }, [draft, resumeId, updateMutation]);

  completeEditRef.current = completeEdit;

  useEffect(() => {
    if (moduleStatus !== 'edit') return;
    /** 若点击发生在浮层（日期选择、Modal 等）内则不退出编辑 */
    const isInsideOverlay = (n: Element | null) =>
      !!n?.closest('[role="dialog"], [data-slot="popover"]');
    const onDown = (e: MouseEvent) => {
      if (photoDialog.isOpen) return;
      const n = e.target;
      if (!(n instanceof Element)) return;
      if (rootRef.current?.contains(n)) return;
      if (isInsideOverlay(n)) return;
      void completeEditRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (photoDialog.isOpen) return;
      const active = document.activeElement;
      if (active instanceof Element && isInsideOverlay(active)) return;
      e.preventDefault();
      void completeEditRef.current();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, { capture: true });
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, { capture: true });
    };
  }, [moduleStatus, photoDialog.isOpen]);

  const view = useMemo(() => toDraft(profile), [profile]);

  const hasAnyInView = useMemo(() => {
    return (
      Boolean(view.photoUrl) ||
      Boolean(view.fullName) ||
      Boolean(view.birthDate) ||
      Boolean(view.gender) ||
      Boolean(view.targetPosition) ||
      Boolean(view.email) ||
      Boolean(view.phone) ||
      view.tags.length > 0
    );
  }, [view]);

  const isBusy = updateMutation.isPending;

  const birthLabel = formatBirthForView(view.birthDate, profile?.birthDate);

  return (
    <>
      <div ref={rootRef} className="w-full max-w-3xl">
        {moduleStatus === 'view' ? (
          <div
            role="button"
            tabIndex={0}
            onClick={enterEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                enterEdit(e);
              }
            }}
            className="cursor-pointer rounded-xl border-2 border-dashed border-transparent p-3 transition-colors outline-none hover:border-sky-400/75 hover:bg-sky-50/95 focus-visible:border-sky-400/75 focus-visible:bg-sky-50/95 sm:p-4"
          >
            {hasAnyInView ? (
              <div className="flex flex-row items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {view.fullName ? (
                    <h2 className="text-foreground text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
                      {view.fullName}
                    </h2>
                  ) : null}

                  {view.birthDate ||
                  profile?.birthDate ||
                  view.gender ||
                  view.targetPosition ||
                  view.email ||
                  view.phone ? (
                    <div className="bg-default-100/60 mt-3 max-w-xl rounded-lg p-3">
                      <div className="text-foreground/90 flex flex-wrap gap-x-4 gap-y-2.5 text-sm">
                        {(view.birthDate || profile?.birthDate) &&
                        birthLabel ? (
                          <span className="inline-flex max-w-full min-w-0 items-center gap-1.5">
                            <CalendarIcon
                              className="text-default-400 size-4 shrink-0"
                              strokeWidth={2}
                              aria-hidden
                            />
                            <span className="min-w-0 break-words">
                              {birthLabel}
                            </span>
                          </span>
                        ) : null}
                        {view.gender ? (
                          <span className="inline-flex max-w-full min-w-0 items-center gap-1.5">
                            <UserRound
                              className="text-default-400 size-4 shrink-0"
                              strokeWidth={2}
                              aria-hidden
                            />
                            <span className="min-w-0 break-words">
                              {view.gender}
                            </span>
                          </span>
                        ) : null}
                        {view.targetPosition ? (
                          <span className="inline-flex max-w-full min-w-0 items-center gap-1.5">
                            <Target
                              className="text-default-400 size-4 shrink-0"
                              strokeWidth={2}
                              aria-hidden
                            />
                            <span className="min-w-0 break-words">
                              {view.targetPosition}
                            </span>
                          </span>
                        ) : null}
                        {view.email ? (
                          <span className="inline-flex max-w-full min-w-0 items-center gap-1.5 break-all">
                            <Mail
                              className="text-default-400 size-4 shrink-0"
                              strokeWidth={2}
                              aria-hidden
                            />
                            <span className="min-w-0">{view.email}</span>
                          </span>
                        ) : null}
                        {view.phone ? (
                          <span className="inline-flex max-w-full min-w-0 items-center gap-1.5 break-all">
                            <Phone
                              className="text-default-400 size-4 shrink-0"
                              strokeWidth={2}
                              aria-hidden
                            />
                            <span className="min-w-0">{view.phone}</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {view.tags.length > 0 ? (
                    <div
                      className="bg-default-100/50 mt-4 max-w-xl rounded-lg p-3"
                      aria-label="自定义标签"
                    >
                      <ul className="mt-0 flex flex-wrap gap-1.5">
                        {view.tags.map((t) => (
                          <li
                            key={t}
                            className="text-foreground/90 bg-default-200/50 rounded-full px-2.5 py-0.5 text-xs"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>

                {view.photoUrl ? (
                  <div className="ml-2 shrink-0 self-start">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={view.photoUrl}
                      alt="证件照"
                      className="border-default-200/80 h-32 w-24 rounded-lg border object-cover shadow-sm"
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-default-500 py-2 text-sm">
                暂无已填写内容，点击此处进入编辑
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-sky-400/75 bg-sky-50/95 p-3 sm:p-4">
            {saveError ? (
              <p className="text-danger mb-2 text-xs" role="alert">
                {saveError}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-2">
                  <ClearableTextField
                    label="姓名"
                    name="fullName"
                    value={draft.fullName}
                    onChange={(v) => setDraft((d) => ({ ...d, fullName: v }))}
                    placeholder="姓名"
                    validate={(v) => (v && v.length > 200 ? '长度过长' : null)}
                  />

                  <ClearableTextField
                    label="性别"
                    name="gender"
                    value={draft.gender}
                    onChange={(v) => setDraft((d) => ({ ...d, gender: v }))}
                    placeholder="如：女"
                    validate={(v) => (v && v.length > 50 ? '长度过长' : null)}
                  />

                  <DatePicker
                    name="birthDate"
                    className="w-full"
                    value={parseCalendarDateSafe(draft.birthDate)}
                    onChange={(value) =>
                      setDraft((d) => ({
                        ...d,
                        birthDate: value?.toString() ?? '',
                      }))
                    }
                  >
                    <Label className="text-default-600 text-xs">出生日期</Label>
                    <DateField.Group fullWidth variant="secondary">
                      <DateField.Input>
                        {(segment) => <DateField.Segment segment={segment} />}
                      </DateField.Input>
                      <DateField.Suffix>
                        {draft.birthDate ? (
                          <Button
                            type="button"
                            isIconOnly
                            variant="ghost"
                            size="sm"
                            aria-label="清空出生日期"
                            className="h-6 min-w-0 px-1"
                            onPress={() =>
                              setDraft((d) => ({ ...d, birthDate: '' }))
                            }
                          >
                            <X className="text-default-500 size-3.5" />
                          </Button>
                        ) : null}
                        <DatePicker.Trigger>
                          <DatePicker.TriggerIndicator />
                        </DatePicker.Trigger>
                      </DateField.Suffix>
                    </DateField.Group>
                    <DatePicker.Popover>
                      <Calendar aria-label="选择出生日期">
                        <Calendar.Header>
                          <Calendar.YearPickerTrigger>
                            <Calendar.YearPickerTriggerHeading />
                            <Calendar.YearPickerTriggerIndicator />
                          </Calendar.YearPickerTrigger>
                          <Calendar.NavButton slot="previous" />
                          <Calendar.NavButton slot="next" />
                        </Calendar.Header>
                        <Calendar.Grid>
                          <Calendar.GridHeader>
                            {(day) => (
                              <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                            )}
                          </Calendar.GridHeader>
                          <Calendar.GridBody>
                            {(date) => <Calendar.Cell date={date} />}
                          </Calendar.GridBody>
                        </Calendar.Grid>
                        <Calendar.YearPickerGrid>
                          <Calendar.YearPickerGridBody>
                            {({ year }) => (
                              <Calendar.YearPickerCell year={year} />
                            )}
                          </Calendar.YearPickerGridBody>
                        </Calendar.YearPickerGrid>
                      </Calendar>
                    </DatePicker.Popover>
                  </DatePicker>

                  <ClearableTextField
                    label="目标岗位"
                    name="targetPosition"
                    value={draft.targetPosition}
                    onChange={(v) =>
                      setDraft((d) => ({ ...d, targetPosition: v }))
                    }
                    placeholder="目标岗位"
                    validate={(v) => (v && v.length > 200 ? '长度过长' : null)}
                  />

                  <ClearableTextField
                    label="联系邮箱"
                    name="email"
                    type="email"
                    value={draft.email}
                    onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
                    placeholder="email@…"
                    validate={(v) => {
                      if (!v?.trim()) return null;
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
                        return '邮箱格式不正确';
                      return null;
                    }}
                  />

                  <ClearableTextField
                    label="联系电话"
                    name="phone"
                    type="tel"
                    value={draft.phone}
                    onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
                    placeholder="手机或座机"
                    validate={(v) => (v && v.length > 30 ? '长度过长' : null)}
                  />
                </div>

                <div className="mt-3 border-t border-sky-200/60 pt-3">
                  <Label className="text-default-600 text-xs">自定义标签</Label>
                  <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-end">
                    <TextField
                      className="sm:min-w-0 sm:flex-1"
                      name="newTag"
                      value={tagInput}
                      onChange={setTagInput}
                    >
                      <Input
                        variant="secondary"
                        placeholder="回车或点击添加"
                        className="h-9 min-h-0 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <FieldError />
                    </TextField>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      isDisabled={!tagInput.trim() || isBusy}
                      onPress={addTag}
                      className="h-9 shrink-0 gap-1"
                    >
                      <Plus className="size-4" />
                      添加
                    </Button>
                  </div>
                  {draft.tags.length > 0 ? (
                    <ul
                      className="mt-2 flex flex-wrap gap-1.5"
                      aria-label="已添加标签"
                    >
                      {draft.tags.map((t, i) => (
                        <li
                          key={`${t}-${i}`}
                          className="text-foreground/90 flex items-center gap-0.5 rounded-full bg-sky-100/90 py-0.5 pr-0.5 pl-2 text-xs"
                        >
                          <span className="max-w-[10rem] truncate" title={t}>
                            {t}
                          </span>
                          <button
                            type="button"
                            className="text-default-600 hover:text-foreground rounded p-0.5"
                            aria-label={`删除标签：${t}`}
                            onClick={() => removeTag(i)}
                          >
                            <X className="size-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 flex-col self-end sm:self-start">
                <input
                  id={`photo-pick-${fileId}`}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(ev) => {
                    const f = ev.currentTarget.files?.[0];
                    if (f) handleFileSelected(f);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  isDisabled={isUploading || isBusy}
                  onPress={() => {
                    setPickError(null);
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }
                    photoDialog.open();
                  }}
                  className="text-default-600 h-32 w-24 flex-col justify-center gap-1 rounded-lg border-sky-300/90 p-1 hover:bg-sky-100/80"
                  aria-label="选择证件照"
                >
                  {draft.photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={draft.photoUrl}
                      alt="证件照预览"
                      className="size-full max-h-28 max-w-20 rounded-md object-cover"
                    />
                  ) : (
                    <>
                      <Camera className="size-6 text-sky-500/90" />
                      <span className="text-default-600 text-center text-xs leading-tight">
                        证件照
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal state={photoDialog}>
        <Modal.Backdrop isDismissable={!isUploading}>
          <Modal.Container size="md" placement="center">
            <Modal.Dialog>
              <Modal.CloseTrigger
                isDisabled={isUploading}
                onPress={closePhotoDialog}
              />
              <Modal.Header>
                <Modal.Heading>上传证件照</Modal.Heading>
              </Modal.Header>
              <form
                onSubmit={handleApplyPhoto}
                className="flex flex-col gap-4 p-0"
              >
                <Modal.Body>
                  {pickError ? (
                    <p className="text-danger text-sm">{pickError}</p>
                  ) : null}
                  <p className="text-default-600 text-sm">
                    支持常见图片格式，将上传至个人资料。
                  </p>
                  <div className="flex flex-col items-center gap-3 sm:flex-row">
                    {previewUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={previewUrl}
                        alt="本地预览"
                        className="h-40 w-[7.5rem] rounded-md border object-cover"
                      />
                    ) : null}
                    <div className="flex flex-1 flex-col items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        isDisabled={isUploading}
                        onPress={() =>
                          document
                            .getElementById(`photo-pick-${fileId}`)
                            ?.click()
                        }
                      >
                        从本机选择
                      </Button>
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer className="gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    isDisabled={isUploading}
                    onPress={closePhotoDialog}
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isDisabled={!previewUrl || isUploading}
                  >
                    {isUploading ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Spinner className="size-3" />
                        上传中
                      </span>
                    ) : (
                      '确认上传'
                    )}
                  </Button>
                </Modal.Footer>
              </form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
