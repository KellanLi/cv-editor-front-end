import ContentForm from './content-form';
import ThemeSelector from './theme-selector';

export const enum ComponentType {
  CONTENT_FORM = 'content_form',
  THEME_SELECTOR = 'theme_selector',
}

export const componentMap = {
  [ComponentType.CONTENT_FORM]: ContentForm,
  [ComponentType.THEME_SELECTOR]: ThemeSelector,
};
