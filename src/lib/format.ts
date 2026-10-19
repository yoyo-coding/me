/**
 * 统一的日期/时间格式化。
 * 所有页面的日期显示都经过这里，保证全站一致（说明书 7.1）。
 */

/** Blog 列表 / 详情：YYYY-MM-DD */
export function formatDate(isoDate: string): string {
  return isoDate.slice(0, 10);
}

/** Note 时间线：MM-DD HH:mm（设计稿格式） */
export function formatNoteTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return isoDateTime;
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi}`;
}
