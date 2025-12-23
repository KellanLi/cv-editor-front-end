export const genClassNames = (
  classes: string[] | string | Record<string, boolean>,
): string => {
  if (Array.isArray(classes)) return classes.join(' ');
  if (typeof classes === 'object' && classes !== null) {
    return Object.entries(classes)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(' ');
  }
  return classes;
};
