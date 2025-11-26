import type { ReactNode } from 'react';

export interface BasicItem {
  label: string;
  value: string;
  icon: ReactNode;
}

export interface FieldItem<ValueType = string> {
  label: string;
  value: ValueType;
}

export interface DetailedBlockItem {
  title: string;
  items: BasicItem[];
}

export interface DetailedItem {
  title: string;
  items: DetailedBlockItem[];
}

export interface CVPreviewProps {
  width?: number;
  cvData?: {
    profilePicture?: string;
    name?: string;
    targetPosition?: string;
    basicInfo?: BasicItem[];
    detailedInfo?: DetailedItem[];
  };
}
