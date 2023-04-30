import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';

/**
 * This function exists to avoid using index as key, per React's
 * guidelines
 */
export const generateId = (ctx: RenderFieldExtensionCtx) => {
  const random = Math.round(Math.random() * 1000000);
  const id = `${ctx.field.id}-timeslot-${random.toString()}`;

  return id;
};
