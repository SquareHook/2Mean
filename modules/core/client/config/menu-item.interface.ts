export interface MenuItem {
  template: string,
  state: string,
  roles: Array<string>,
  position?: number,
  subitems?: Array<MenuItem>
}
