import { createHashRouter, Navigate } from 'react-router';
import CVEditPage from '@/pages/cv-edit-page';
import CVPreviewPage from '@/pages/cv-preview-page';
import CVManagePage from '@/pages/cv-manage-page';
import PathEnum from '@/router/pathEnum';
import AppLayer from '@/components/layer';
import TemplateManagePage from '@/pages/template-manage-page';

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
    path: PathEnum.HOME,
    element: <AppLayer />,
    children: [
      {
        index: true,
        element: <Navigate to={`${PathEnum.HOME}${PathEnum.CV_MANAGE}`} />,
      },
      {
        path: `${PathEnum.HOME}${PathEnum.CV_MANAGE}`,
        element: <CVManagePage />,
      },
      {
        path: `${PathEnum.HOME}${PathEnum.TEMPLATE_MANAGE}`,
        element: <TemplateManagePage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={`${PathEnum.HOME}${PathEnum.CV_MANAGE}`} />,
  },
]);

export default router;
