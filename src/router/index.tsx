import { createHashRouter } from 'react-router';
import CVEditPage from '@/pages/cv-edit-page';
import CVPreviewPage from '@/pages/cv-preview-page';
import CVManagePage from '@/pages/cv-manage-page';
import PathEnum from '@/router/pathEnum';

const router = createHashRouter([
  {
    path: PathEnum.CV_EDIT,
    element: <CVEditPage />,
  },
  {
    path: PathEnum.CV_PREVIEW,
    element: <CVPreviewPage />,
  },
  {
    path: PathEnum.CV_MANAGE,
    element: <CVManagePage />,
  },
]);

export default router;
