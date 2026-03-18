# @supercollider/synthdef

TypeScript だけで SuperCollider の SynthDef を定義、コンパイルするための実験的パッケージです。

## 特徴

- **sclang 不要**: SuperCollider 言語 (`sclang`) を起動することなく、TypeScript だけのコードから `.scsyndef` バイナリを生成できます。
- **高速**: 重い `sclang` プロセスの起動やクラスライブラリのロードを待つ必要がありません。
- **型安全**: TypeScript の型定義により、UGen の構成を安全に記述できます。

## インストール

現在、このパッケージは開発中の PoC (Proof of Concept) です。

### 依存関係 (scsynth)

このパッケージで音を鳴らすには、SuperCollider サーバー (`scsynth`) が必要です。

**WSL2 (Ubuntu) の場合:**
```bash
sudo apt update
sudo apt install supercollider-server
```

**macOS (Homebrew) の場合:**
```bash
brew install supercollider
```

### パッケージのビルド

```bash
# プロジェクトルートで
pnpm install
pnpm run build
```

## 基本的な使い方

### 1. SynthDef の定義

```typescript
import { SynthDef, SinOsc, Out, mulOp, Rate } from "@supercollider/synthdef";

const def = new SynthDef("my_sine", (graph) => {
  // 引数（Control）の定義
  const freq = graph.addControl("freq", 440, Rate.KR);
  const amp = graph.addControl("amp", 0.2, Rate.KR);
  
  // UGen グラフの構築
  const osc = SinOsc.ar(freq);
  const outSignal = mulOp(osc, amp);
  
  // 出力
  Out.ar(0, outSignal);
});
```

### 2. バイナリへのコンパイル

```typescript
const buffer = def.compile();
// buffer は Node.js の Buffer オブジェクト（.scsyndef 形式）
```

### 3. scsynth で音を鳴らす

`@supercollider/server` と組み合わせて、コンパイルしたバイナリを直接送信できます。

```typescript
import Server from "@supercollider/server";

const server = new Server();
await server.boot();

// バイナリを直接送信 (/d_recv)
server.send.msg(["/d_recv", def.compile()]);

// シンセを作成 (/s_new)
server.send.msg(["/s_new", "my_sine", 1000, 1, 0, "freq", 660]);
```

## サンプルの実行方法

パッケージ内に用意されているデモスクリプトを実行して、実際に音が鳴ることを確認できます。

### コンパイルデモ (バイナリ生成)
```bash
cd packages/synthdef
npx ts-node examples/sine_osc.ts
```

### 演奏デモ (scsynth での再生)
※ `scsynth` がパスに通っている必要があります。
```bash
cd packages/synthdef
npx ts-node -O '{"module": "commonjs", "esModuleInterop": true, "skipLibCheck": true, "baseUrl": ".", "paths": { "@supercollider/logger": ["../logger/src/index.ts"], "@supercollider/osc": ["../osc/src/index.ts"], "@supercollider/server": ["../server/src/index.ts"] }}' examples/play_sine.ts
```
