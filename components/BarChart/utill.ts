export function trimStr(s: string, maxL: number) {
  if (s.length > maxL) {
    return s.substring(0, maxL) + "...";
  }
  return s;
}

export function isClient() {
  return typeof window != "undefined";
}

/**
 * Append the node to a given id of a container in the DOM
 */
export function appendChild(id: string, ref: SVGSVGElement) {
  if (isClient()) {
    const box = document.getElementById(id);
    if (box.childNodes.length == 0) {
      box.appendChild(ref);
    } else {
      box.replaceChild(ref, box.childNodes[0]);
    }
  }
}
