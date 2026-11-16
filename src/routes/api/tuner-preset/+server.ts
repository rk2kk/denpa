import { json } from "@sveltejs/kit";

import {
  activePresetFromHtml,
  tunerPresetOrigin,
} from "#lib/server/tuner-preset.js";

/**
 * チューナー (DT295 エージェント) の画質プリセットを読み書きする。
 *
 * ブラウザからエージェントを直接叩かないのは、認証と CORS を1か所に閉じ込めるため。
 * 選んだ内容はエージェント側のプロファイルを書き換えるだけで、
 * **次の選局から**効く (いま見ている絵は変わらない)。
 */
const PRESET = /^[a-z0-9]{1,16}$/;

export async function GET() {
  const origin = tunerPresetOrigin();
  if (origin === null) return json({ active: null });
  try {
    const res = await fetch(`${origin}/presets`, {
      redirect: "manual",
      signal: AbortSignal.timeout(1500),
    });
    return json({ active: activePresetFromHtml(await res.text()) });
  } catch {
    return json({ active: null });
  }
}

export async function POST({ request }: { request: Request }) {
  const body = (await request.json().catch(() => ({}))) as {
    preset?: unknown;
  };
  const preset = typeof body.preset === "string" ? body.preset : "";
  if (!PRESET.test(preset)) {
    return json({ message: "preset が不正です" }, { status: 400 });
  }
  const origin = tunerPresetOrigin();
  if (origin === null) {
    return json({ message: "チューナーに繋がりません" }, { status: 502 });
  }
  try {
    const res = await fetch(
      `${origin}/presets/select?name=${encodeURIComponent(preset)}`,
      {
        redirect: "manual",
        signal: AbortSignal.timeout(1500),
      },
    );
    if (res.status >= 400) {
      return json({ message: "切り替えに失敗しました" }, { status: 502 });
    }
    return json({ active: preset });
  } catch {
    return json({ message: "チューナーに繋がりません" }, { status: 502 });
  }
}
