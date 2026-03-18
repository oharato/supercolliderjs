import { SynthDef, SinOsc, Out, mulOp, Rate } from "../src";
import * as fs from "fs";
import * as path from "path";

/**
 * 1. TypeScriptのみでSynthDefを定義する
 * sclangのコード:
 * SynthDef("sine_ts", { |freq=440, amp=0.2|
 *   Out.ar(0, SinOsc.ar(freq) * amp);
 * })
 */
const def = new SynthDef("sine_ts", (graph) => {
  // コントロール引数（引数名, デフォルト値, レート）の追加
  const freq = graph.addControl("freq", 440, Rate.KR);
  const amp = graph.addControl("amp", 0.2, Rate.KR);
  
  // UGenグラフの構築
  const osc = SinOsc.ar(freq);
  const outSignal = mulOp(osc, amp);
  
  // バス0番へ出力
  Out.ar(0, outSignal);
});

// 2. バイナリ (.scsyndef) にコンパイルする
console.log(`Compiling SynthDef: ${def.graph.name}...`);
const buffer = def.compile();

// 3. 結果の表示
console.log(`Compiled size: ${buffer.length} bytes`);
console.log(`Hex: ${buffer.slice(0, 16).toString("hex")}...`);

// 4. ファイルとして保存 (scsynth がロード可能な形式)
const outputPath = path.join(__dirname, "sine_ts.scsyndef");
fs.writeFileSync(outputPath, buffer);
console.log(`Saved to: ${outputPath}`);

console.log("\nDefinition details:");
console.log(`- Constants: ${def.graph.constants.map(c => c.value).join(", ")}`);
console.log(`- Controls: ${def.graph.controls.map(c => `${c.name} (${c.defaultValue})`).join(", ")}`);
console.log(`- UGens: ${def.graph.ugens.map(u => u.name).join(" -> ")}`);
