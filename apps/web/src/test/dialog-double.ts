// jsdom has the `<dialog>` element and its `open` attribute but not
// `showModal()` or `close()`. This double gives the tests the part of them a
// component can observe: the attribute, and a `close` event that arrives later,
// as it does in a browser (the event is queued, never fired inside `close()`).
//
// It does not imitate the top layer, the inert page, the focus trap, the
// backdrop or the Escape key. Those are the browser's and are checked by hand
// (spec 003, T9). A test that wants Escape dispatches the cancelable `cancel`
// event the browser fires for it.
export function installDialogDouble(): void {
  // A test file that runs in the node environment has no DOM at all.
  if (typeof HTMLDialogElement === "undefined") return;
  const prototype = HTMLDialogElement.prototype;
  if (typeof prototype.showModal === "function") return;

  prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };

  prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    setTimeout(() => this.dispatchEvent(new Event("close")), 0);
  };
}
