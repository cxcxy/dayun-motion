import React, { useEffect, useMemo, useRef, useState } from "react";
import { Player, Thumbnail } from "@remotion/player";
import { CATEGORIES, COMPONENTS, Category, ComponentEntry } from "../registry";

const FPS = 30;
const W = 1920;
const H = 1080;
const REPO = "https://github.com/cxcxy/dayun-motion";

const useHash = () => {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash;
};

const catName = (c: Category) => CATEGORIES.find((x) => x.id === c)?.name ?? c;

/** 进入视口才渲染缩略图，避免一次性渲染 17 个组件 */
const LazyThumb: React.FC<{ c: ComponentEntry }> = ({ c }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="thumb">
      {show && (
        <Thumbnail
          component={c.component}
          inputProps={c.defaults}
          compositionWidth={W}
          compositionHeight={H}
          durationInFrames={c.dur}
          frameToDisplay={c.poster}
          fps={FPS}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
};

const Header: React.FC = () => (
  <header className="top">
    <a className="brand" href="#/">
      <span className="logo" aria-hidden>
        <i />
        <i />
      </span>
      <span>
        <b>dayun-motion</b>
        <small>视频动效组件库</small>
      </span>
    </a>
    <a className="gh" href={REPO} target="_blank" rel="noreferrer">
      GitHub ↗
    </a>
  </header>
);

const Home: React.FC = () => {
  const [cat, setCat] = useState<Category | "all">("all");
  const cats = cat === "all" ? CATEGORIES : CATEGORIES.filter((c) => c.id === cat);
  return (
    <main className="home">
      <section className="hero">
        <h1>
          做视频用的<em>动效积木</em>
        </h1>
        <p>
          {COMPONENTS.length} 个 Remotion 组件，分成开头、内容、卡片、文字、动效五类。点开任何一个都能在浏览器里实时播放、改文字参数，再复制命令渲染成 1080p 视频。
        </p>
        <div className="chips" role="tablist">
          <button className={cat === "all" ? "on" : ""} onClick={() => setCat("all")}>
            全部 <span>{COMPONENTS.length}</span>
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} className={cat === c.id ? "on" : ""} onClick={() => setCat(c.id)}>
              {c.name} <span>{COMPONENTS.filter((x) => x.category === c.id).length}</span>
            </button>
          ))}
        </div>
      </section>
      {cats.map((g) => {
        const items = COMPONENTS.filter((c) => c.category === g.id);
        return (
          <section key={g.id} className="group">
            <div className="group-head">
              <h2>{g.name}</h2>
              <p>{g.desc}</p>
            </div>
            {items.length === 0 ? (
              <div className="empty">还没有组件</div>
            ) : (
              <div className="grid">
                {items.map((c) => (
                  <a key={c.id} className="card" href={`#/c/${c.id}`}>
                    <LazyThumb c={c} />
                    <div className="meta">
                      <div className="row">
                        <b>{c.name}</b>
                        <code>{c.id}</code>
                      </div>
                      <p>{c.summary}</p>
                      <span className="dur">{(c.dur / FPS).toFixed(1)} 秒</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        );
      })}
      <footer className="foot">
        组件用 <a href="https://www.remotion.dev" target="_blank" rel="noreferrer">Remotion</a> 编写 · 音效为 CC0 或仓库内脚本原创合成 ·{" "}
        <a href={REPO} target="_blank" rel="noreferrer">
          源码
        </a>
      </footer>
    </main>
  );
};

const Detail: React.FC<{ c: ComponentEntry }> = ({ c }) => {
  const initial = useMemo(() => JSON.stringify(c.defaults, null, 2), [c]);
  const [text, setText] = useState(initial);
  const [props, setProps] = useState<Record<string, unknown>>(c.defaults);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setText(initial);
    setProps(c.defaults);
    setErr(null);
    window.scrollTo(0, 0);
  }, [c, initial]);

  const onEdit = (v: string) => {
    setText(v);
    try {
      const p = JSON.parse(v);
      setProps(p);
      setErr(null);
    } catch (e) {
      setErr((e as Error).message);
    }
  };
  const copy = async (label: string, v: string) => {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(label);
      setTimeout(() => setCopied(null), 1400);
    } catch {
      setCopied("复制失败");
    }
  };
  const idx = COMPONENTS.findIndex((x) => x.id === c.id);
  const prev = COMPONENTS[(idx - 1 + COMPONENTS.length) % COMPONENTS.length];
  const next = COMPONENTS[(idx + 1) % COMPONENTS.length];
  const cmd = `npm run render -- ${c.id} out/${c.id}.mp4 --props=props/${c.id}.json`;

  return (
    <main className="detail">
      <nav className="crumbs">
        <a href="#/">全部组件</a>
        <span>/</span>
        <span>{catName(c.category)}</span>
        <span>/</span>
        <b>{c.name}</b>
      </nav>
      <div className="stage">
        <Player
          key={c.id}
          component={c.component}
          inputProps={props}
          durationInFrames={c.dur}
          fps={FPS}
          compositionWidth={W}
          compositionHeight={H}
          controls
          loop
          autoPlay
          initiallyMuted
          clickToPlay
          acknowledgeRemotionLicense
          style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 14, overflow: "hidden", background: "#000" }}
        />
        <p className="hint">默认静音播放，点控制条上的喇叭可以听音效。</p>
      </div>
      <div className="info">
        <section className="about">
          <div className="tag">{catName(c.category)}</div>
          <h1>
            {c.name} <code>{c.id}</code>
          </h1>
          <p>{c.summary}</p>
          <dl>
            <dt>适合</dt>
            <dd>{c.useFor}</dd>
            <dt>规格</dt>
            <dd>
              1920×1080 · 30fps · {(c.dur / FPS).toFixed(1)} 秒（{c.dur} 帧）
            </dd>
          </dl>
          <div className="cmd">
            <div className="cmd-head">
              <span>渲染成视频</span>
              <button onClick={() => copy("cmd", cmd)}>{copied === "cmd" ? "已复制" : "复制"}</button>
            </div>
            <pre>{cmd}</pre>
            <p className="note">在仓库根目录运行。把右侧参数存成 props/{c.id}.json；去掉 --props 就用默认参数。</p>
          </div>
          <div className="pager">
            <a href={`#/c/${prev.id}`}>← {prev.name}</a>
            <a href={`#/c/${next.id}`}>{next.name} →</a>
          </div>
        </section>
        <section className="editor">
          <div className="cmd-head">
            <span>参数（JSON，改了立刻生效）</span>
            <span className="btns">
              <button onClick={() => onEdit(initial)}>重置</button>
              <button onClick={() => copy("json", text)}>{copied === "json" ? "已复制" : "复制"}</button>
            </span>
          </div>
          <textarea spellCheck={false} value={text} onChange={(e) => onEdit(e.target.value)} aria-label="组件参数 JSON" />
          {err ? <div className="err">JSON 有误，画面保持上一次的参数：{err}</div> : <div className="ok">参数有效</div>}
        </section>
      </div>
    </main>
  );
};

export const App: React.FC = () => {
  const hash = useHash();
  const m = hash.match(/^#\/c\/([a-z0-9-]+)/);
  const c = m ? COMPONENTS.find((x) => x.id === m[1]) : undefined;
  return (
    <>
      <Header />
      {c ? <Detail c={c} /> : <Home />}
    </>
  );
};
