export function renderCommandBar() {
  return /*html*/ `<menu class="c-command-bar">
  <button data-action="fetch">Fetch</button>  
  <button data-action="mark-all-as-read">Mark all as read</button>
  <button data-action="options">Options</button>
  <span class="c-status" id="status">
</menu>`;
}
