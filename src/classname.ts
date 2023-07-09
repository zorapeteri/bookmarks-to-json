export function classname(...classnames: any[]) {
  return {
    className: classnames.filter(Boolean).join(' '),
  }
}
