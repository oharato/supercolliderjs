import Server from "../../server/src/server";
import { SynthDef, SinOsc, Out, mulOp, Rate } from "../src";

async function run() {
  console.log("TypeScriptだけで音を鳴らすデモを開始します...");

  // 1. scsynth (サーバー) の起動
  const server = new Server({ scsynth: "/usr/bin/scsynth" });
  await server.boot();
  console.log("scsynth が起動しました。");

  // 2. SynthDef を TypeScript で作成
  const def = new SynthDef("ts_sine", (graph) => {
    const freq = graph.addControl("freq", 440, Rate.KR);
    const amp = graph.addControl("amp", 0.2, Rate.KR);
    const osc = SinOsc.ar(freq);
    const outSignal = mulOp(osc, amp);
    Out.ar(0, outSignal);
  });

  // 3. コンパイルしてバイナリを取得
  const buffer = def.compile();
  console.log(`SynthDef '${def.graph.name}' をコンパイルしました (${buffer.length} bytes)`);

  // 4. サーバーに SynthDef を送信
  server.send.msg(["/d_recv", buffer]);
  console.log("SynthDef をサーバーに送信しました。");

  // 5. 音を鳴らす (Synthの作成)
  const synthId = 1000;
  server.send.msg(["/s_new", "ts_sine", synthId, 1, 0, "freq", 660, "amp", 0.1]);
  console.log("Synth を作成しました (660Hz)。");

  // 2秒間鳴らす
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 6. 音を止める
  server.send.msg(["/n_free", synthId]);
  console.log("音を止めました。");

  // 7. サーバーを終了
  await server.quit();
  console.log("サーバーを終了しました。");
}

run().catch(console.error);
