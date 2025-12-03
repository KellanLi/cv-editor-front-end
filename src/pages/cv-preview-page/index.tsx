import { type FC } from 'react';
import CVPreview from '@/components/cv-preview';
import { CVPreviewProps } from '@/components/cv-preview/types';
import profilePicture from '@/assets/profile-picture.jpg';

const mockData: CVPreviewProps = {
  cvData: {
    fullName: 'John Doe',
    profilePicture,
    targetPosition: 'Software Engineer',
  },
};

const CVPreviewPage: FC = () => {
  return (
    <div>
      <CVPreview {...mockData} />
    </div>
  );
};

export default CVPreviewPage;
