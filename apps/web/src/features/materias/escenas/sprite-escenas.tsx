import { SPRITE_ESCENAS } from "./sprite";

/** Pinta las escenas y los avatares una vez; los cromos las usan con <use>. */
export function SpriteEscenas() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs dangerouslySetInnerHTML={{ __html: SPRITE_ESCENAS }} />
    </svg>
  );
}
