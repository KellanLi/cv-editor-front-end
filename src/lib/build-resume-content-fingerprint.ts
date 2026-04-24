import type { TResume } from '@/types/business/resume';
import type { TSection } from '@/types/business/section';

/**
 * 用于封面截图去重与防抖：仅当简历**正文**变化时变化；
 * 不包含 `listCoverImageUrl` / `updatedAt` 等，避免仅更新封面后触发生成环。
 */
export function buildResumeContentFingerprint(
  resume: TResume | undefined,
  sections: TSection[],
): string {
  if (!resume) return '';
  const p = resume.profile;
  const profilePart = [
    p?.photoUrl ?? '',
    p?.fullName ?? '',
    p?.birthDate ?? '',
    p?.gender ?? '',
    p?.targetPosition ?? '',
    p?.email ?? '',
    p?.phone ?? '',
    Array.isArray(p?.profileExtra) ? p.profileExtra.join('\u0001') : '',
  ].join('\u0002');

  const sectionPart = [...sections]
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const cSig = s.contents
        .map((c) => {
          const o = c.order;
          const iSig = c.infos
            .map(
              (i) =>
                `${i.order}\u0003${i.type}\u0004${i.values.join('\u0005')}`,
            )
            .join('\u0006');
          return `${o}\u0007${iSig}`;
        })
        .join('\u0008');
      return `${s.id}\u0009${s.contentTemplateId}\n${cSig}`;
    })
    .join('\n\n');

  return `${resume.id}|${profilePart}|\n${sectionPart}`;
}
