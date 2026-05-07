export type TResumeUpdateTrigger =
  | 'resume.update-title'
  | 'resume.update-profile'
  | 'resume.update-list-cover'
  | 'section.create'
  | 'section.delete'
  | 'section.update'
  | 'section.reorder'
  | 'section.update-content';

export type TResumeUpdatedEvent = {
  phase: 'resume.updated';
  resumeId: number;
  payload: {
    trigger: TResumeUpdateTrigger;
    sectionId: number | null;
    updatedAt: string;
  };
};
