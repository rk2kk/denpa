/**
 * チューナーエージェントの `/presets` を読むための小さな道具。
 *
 * 環境変数の文字列をそのまま URL にすると `#pair=` やカンマがパスに混ざるので、
 * 必ず `parseAgentUrls` を通してから使う (握手の証明書はここでは要らない)。
 */
import { parseAgentUrls } from "./agents";
import { config } from "./config";

/** `/presets` を叩くためのエージェントの土台。読めなければ null */
export function tunerPresetOrigin(): string | null {
  try {
    return parseAgentUrls(config.agentUrl)[0]?.origin ?? null;
  } catch {
    return null;
  }
}

/** `/presets` の HTML から「適用中」の値を読む。「(不明)」は未確定なので null */
export function activePresetFromHtml(html: string): string | null {
  const active = /適用中: <b>([^<]*)<\/b>/.exec(html)?.[1] ?? null;
  return active === null || active === "(不明)" ? null : active;
}

/** `/presets` の HTML から「チューナーが H.264 を作っているか」を読む (純粋関数) */
export function transcodingFromPresetsHtml(html: string): boolean {
  const active = activePresetFromHtml(html);
  return active !== null && active !== "passthrough";
}
