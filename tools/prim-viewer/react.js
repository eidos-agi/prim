import { createElement, forwardRef } from "react";
import "./showprim.js";

function chromeAttr(chrome) {
  if (chrome === false || chrome === "0") return "0";
  return undefined;
}

/** React wrapper for <showprim>. Same tag the HTML player uses. */
export const ShowPrim = forwardRef(function ShowPrim(props, ref) {
  const { src, filename, chrome = true, className, style, ...rest } = props;
  return createElement("showprim", {
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
