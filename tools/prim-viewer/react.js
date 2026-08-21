import { createElement, forwardRef } from "react";
import "./showprim.js";

function chromeAttr(chrome) {
  if (chrome === false || chrome === "0") return "0";
  return undefined;
}

/** React wrapper for <show-prim>. Same tag the HTML player uses. */
export const ShowPrim = forwardRef(function ShowPrim(props, ref) {
  const { src, filename, chrome = true, className, style, ...rest } = props;
  return createElement("show-prim", {
    ...rest,
    ref,
    className,
    style,
    src: src || filename || undefined,
    filename: filename || undefined,
    chrome: chromeAttr(chrome),
  });
});

ShowPrim.displayName = "ShowPrim";

export default ShowPrim;
