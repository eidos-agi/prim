import type { CSSProperties, HTMLAttributes, ReactElement, Ref } from "react";

export type ShowPrimProps = {
  /** URL of a .prim / .prim.zip, or a pack directory. */
  src?: string;
  /** Alias for src. Also the name shown in the chrome. */
  filename?: string;
  /** Hide the filename bar. Default true. */
  chrome?: boolean;
  className?: string;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, "color">;

export const ShowPrim: {
  (props: ShowPrimProps & { ref?: Ref<HTMLElement> }): ReactElement;
  displayName: string;
};

export default ShowPrim;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "show-prim": HTMLAttributes<HTMLElement> & {
        src?: string;
        filename?: string;
        chrome?: string;
      };
    }
  }
}
