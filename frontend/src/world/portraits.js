import {
  DIRECTIONS,
  FRAMES_PER_DIRECTION,
  SPRITE_SOURCE_SIZE,
} from "./sprites";

export function characterAssetUrl(spriteKey) {
  return new URL(`./assets/char-${spriteKey}.png`, import.meta.url).href;
}

/** CSS for the down-facing idle frame of a character spritesheet. */
export function portraitBackgroundStyle(spriteKey, displaySize) {
  const sheetW = FRAMES_PER_DIRECTION * SPRITE_SOURCE_SIZE;
  const sheetH = DIRECTIONS.length * SPRITE_SOURCE_SIZE;
  const scale = displaySize / SPRITE_SOURCE_SIZE;
  return {
    backgroundImage: `url(${characterAssetUrl(spriteKey)})`,
    backgroundSize: `${sheetW * scale}px ${sheetH * scale}px`,
    backgroundPosition: "0 0",
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
  };
}
