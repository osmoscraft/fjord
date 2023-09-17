import { html, render } from "lit-html";

export class CommandBarElement extends HTMLElement {
  connectedCallback() {
    render(
      html`
        <menu>
          <button>Fetch</button>
          <button>Manage</button>
        </menu>
      `,
      this
    );
  }
}
