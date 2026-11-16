import { describe, expect, test } from "bun:test";

import {
  activePresetFromHtml,
  transcodingFromPresetsHtml,
} from "./tuner-preset";

const page = (active: string) =>
  `<!doctype html><p>適用中: <b>${active}</b>　（切り替えは次の選局から反映）</p>`;

describe("エージェントの /presets の読み取り", () => {
  test("passthrough はコピーしない", () => {
    expect(transcodingFromPresetsHtml(page("passthrough"))).toBe(false);
  });

  test("H.264 プリセットはコピーする", () => {
    expect(transcodingFromPresetsHtml(page("720p8m"))).toBe(true);
  });

  test("(不明) はコピーしない", () => {
    expect(transcodingFromPresetsHtml(page("(不明)"))).toBe(false);
  });

  test("適用中が無い HTML はコピーしない", () => {
    expect(transcodingFromPresetsHtml("<html></html>")).toBe(false);
  });

  test("API に返す値は (不明) を null にする", () => {
    expect(activePresetFromHtml(page("(不明)"))).toBeNull();
    expect(activePresetFromHtml(page("720p8m"))).toBe("720p8m");
  });
});
