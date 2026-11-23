#!/usr/bin/env python3
"""Build the soundtrack and timeline for the Hilal story animation.

Produces www/public/hikaye/story.m4a and www/public/hikaye/timeline.js.

The narration is English, spoken by Kokoro-82M (Apache-2.0, runs locally,
free). Captions are Turkish and English. The music is synthesized here, so
the whole track is free of third-party rights. Run it with uv so the TTS
dependencies stay out of the system Python:

  uv run --python 3.11 --with kokoro==0.9.4 --with soundfile --with 'misaki[en]' \\
      scripts/story/build-audio.py

If espeak-ng then fails with "phontab: No such file or directory", link the
files of espeakng_loader/espeak-ng-data/ one level up inside that package;
some espeakng-loader builds point espeak at the wrong folder.

To use a human recording instead, pass --vo-dir with one file per utterance
named u01.wav, u02.wav, ... in the order of SCRIPT below; word timings then
fall back to an even spread over each utterance.

Requires ffmpeg.
"""

import argparse
import json
import os
import re
import subprocess
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "www", "public", "hikaye")
SR = 44100
HILAL = "[Hilal](/hɪlˈɑːl/)"

# Lines of narration. Each line: (gap before it, [(English, Turkish, pause after), ...]).
# Every utterance is one caption.
SCRIPT = [
    (1.6, [
        ("Openness.", "Açıklık.", 0.75),
        ("Privacy.", "Gizlilik.", 0.75),
        ("Freedom.", "Özgürlük.", 0.75),
        ("Community.", "Topluluk.", 0),
    ]),
    (1.3, [
        ("Long ago, the web belonged to everyone.", "Çok eskiden internet herkesindi.", 0.4),
        ("Browsers of every kind lived side by side, in harmony.",
         "Her türden tarayıcı yan yana, uyum içinde yaşıyordu.", 0),
    ]),
    (0.8, [
        ("Then, everything changed, when the Ad Empire attacked.",
         "Sonra, Reklam İmparatorluğu saldırdığında her şey değişti.", 0),
    ]),
    (1.8, [
        ("Only the Fox, keeper of all four values, could stop it.",
         "Onu yalnızca dört değerin bekçisi Tilki durdurabilirdi.", 0),
    ]),
    (1.2, [
        ("But when the web needed it most, the Fox lost its way.",
         "Ama internet ona en çok ihtiyaç duyduğunda, Tilki yolunu kaybetti.", 0.45),
        ("It lived on its rival's money, and broke its promises, one by one.",
         "Rakibinin parasıyla yaşadı ve sözlerini birer birer çiğnedi.", 0),
    ]),
    (1.3, [
        ("Years passed.", "Yıllar geçti.", 0.3),
        ("The Empire grew.", "İmparatorluk büyüdü.", 0.35),
        ("The web became a marketplace, and its people became the product.",
         "İnternet bir pazar yerine, insanlar da ürüne dönüştü.", 0.45),
        ("It was neither free, nor safe.", "Artık ne özgürdü, ne de güvenli.", 0),
    ]),
    (2.0, [
        ("But the Empire forgot one thing.", "Ama İmparatorluk bir şeyi unuttu.", 0.7),
        ("Code never dies.", "Kod ölmez.", 0),
    ]),
    (1.4, [
        ("A handful of volunteers found the Fox's last ember, frozen in the old code.",
         "Bir avuç gönüllü, Tilki'nin son korunu eski kodun içinde donmuş buldu.", 0.5),
        ("From it, they built a new browser, and named it after the first light of the night sky.",
         "Ondan yeni bir tarayıcı yaptılar ve adını gece göğünün ilk ışığından aldılar.", 0.9),
        (f"{HILAL}.", "Hilal.", 0),
    ]),
    (1.6, [
        (f"{HILAL} still has a lot to learn.", "Hilal'in öğreneceği daha çok şey var.", 0.4),
        ("It's only a crescent, not yet a full moon.", "O henüz bir hilal, dolunay değil.", 0),
    ]),
    (1.3, [
        (f"But I believe {HILAL} can make the web belong to everyone again.",
         "Ama inanıyorum ki Hilal, interneti yeniden herkesin yapabilir.", 0),
    ]),
]
TAIL = 7.0
VOICE = "af_heart"
SPEED = 0.9


def plain(text):
    return re.sub(r"\[([^\]]+)\]\(/[^)]*/\)", r"\1", text)


def run(*cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def read_audio(path):
    """Decode any audio file to mono float32 at SR."""
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def write_wav(path, x, sr=SR):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def trim(x, thresh=0.01):
    """Cut silence at both ends. Returns (audio, seconds cut from the start)."""
    idx = np.where(np.abs(x) > thresh)[0]
    if not len(idx):
        return x, 0.0
    a = max(0, idx[0] - int(0.03 * SR))
    b = min(len(x), idx[-1] + int(0.08 * SR))
    return x[a:b], a / SR


def synthesize(texts, work):
    """Kokoro TTS. Returns [(audio at SR, [(word, start)])]."""
    from kokoro import KPipeline
    import soundfile as sf

    pipe = KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M")
    out = []
    for i, text in enumerate(texts, start=1):
        audio, words, offset = [], [], 0.0
        for r in pipe(text, voice=VOICE, speed=SPEED, split_pattern=None):
            a = r.audio.numpy() if hasattr(r.audio, "numpy") else np.asarray(r.audio)
            for tok in r.tokens or []:
                if tok.start_ts is not None and re.search(r"\w", tok.text):
                    words.append((tok.text, offset + tok.start_ts))
            audio.append(a)
            offset += len(a) / 24000
        path = os.path.join(work, f"u{i:02d}.wav")
        sf.write(path, np.concatenate(audio), 24000)
        x, cut = trim(read_audio(path))
        out.append((x, [(w, max(0.0, t - cut)) for w, t in words]))
    return out


def recordings(vo_dir, texts):
    out = []
    for i, text in enumerate(texts, start=1):
        src = next(os.path.join(vo_dir, f) for f in sorted(os.listdir(vo_dir))
                   if os.path.splitext(f)[0] == f"u{i:02d}")
        x, _ = trim(read_audio(src))
        ws = re.findall(r"[\w']+", plain(text))
        d = len(x) / SR
        out.append((x, [(w, d * k / len(ws)) for k, w in enumerate(ws)]))
    return out


# ---------- music ----------

def adsr(n, a, r):
    env = np.ones(n)
    a, r = min(n, int(a * SR)), min(n, int(r * SR))
    env[:a] = np.linspace(0, 1, a)
    if r:
        env[n - r:] *= np.linspace(1, 0, r)
    return env


def tone(freq, dur, partials=(1, 0.5, 0.25, 0.12)):
    t = np.arange(int(dur * SR)) / SR
    return sum(p * np.sin(2 * np.pi * freq * k * t) for k, p in enumerate(partials, start=1))


def bell(freq, dur=2.4, amp=1.0):
    t = np.arange(int(dur * SR)) / SR
    s = (np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2.76 * t)
         + 0.12 * np.sin(2 * np.pi * freq * 5.4 * t))
    return s * np.exp(-t * 2.2) * np.minimum(1, t * 400) * amp


def pluck(freq, dur=1.6, amp=1.0):
    """Karplus-Strong string, a little like a bağlama."""
    n = int(dur * SR)
    p = max(2, int(SR / freq))
    rng = np.random.default_rng(int(freq))
    buf = rng.uniform(-1, 1, p)
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out * amp


def pad(freqs, dur, amp, attack=2.0, release=2.0):
    s = sum(tone(f, dur) + 0.6 * tone(f * 1.003, dur) for f in freqs)
    lfo = 0.85 + 0.15 * np.sin(2 * np.pi * 0.18 * np.arange(len(s)) / SR)
    return s * lfo * adsr(len(s), attack, release) * amp / len(freqs)


def lowpass(x, a):
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc)
        y[i] = acc
    return y / (np.max(np.abs(y)) + 1e-9)


NOISE = lowpass(np.random.default_rng(3).standard_normal(SR * 4), 0.02)


def boom(dur=3.0, amp=1.0, f0=55):
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (1 + 1.5 * np.exp(-t * 6))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    s += 0.25 * NOISE[: len(t)] * np.exp(-t * 2.5)
    return s * amp


def drum(amp=1.0):
    return boom(0.9, amp, 70)


def whoosh(dur=1.5, amp=1.0):
    t = np.arange(int(dur * SR)) / SR
    return NOISE[: len(t)] * (t / dur) ** 2 * amp


def add(buf, sig, at):
    i = int(at * SR)
    if i < 0:
        sig, i = sig[-i:], 0
    j = min(len(buf), i + len(sig))
    if j > i:
        buf[i:j] += sig[: j - i]


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def compose(total, T):
    m = np.zeros(int(total * SR))
    D = 50  # D3; D hicaz: D Eb F# G A Bb C
    hicaz = [0, 1, 4, 5, 7, 8, 10, 12, 13, 16]

    # Four values: a drum and a note for each.
    for k, at in enumerate(T["values"]):
        add(m, drum(0.35), at - 0.05)
        add(m, pluck(hz(D + 12 + [0, 4, 7, 12][k]), 2.0, 0.5), at)
    add(m, pad([hz(D - 12), hz(D - 5), hz(D), hz(D + 4)], T["attack"] - 0.5, 0.2, 3.0, 1.0), 0.3)

    # Harmony: a slow hicaz melody.
    phrase = [0, 1, 4, 5, 7, 5, 4, 1, 0, 4, 7, 8, 7, 5, 4, 1, 0]
    t, i = T["harmony"] + 0.3, 0
    while t < T["attack"] - 0.4:
        n = hicaz[phrase[i % len(phrase)]]
        add(m, pluck(hz(D + 12 + n), 1.4, 0.32), t)
        add(m, bell(hz(D + 24 + n), 1.2, 0.04), t)
        t += 0.55 if i % 4 != 3 else 0.9
        i += 1

    # The attack: drums and low drones until the darkness.
    add(m, whoosh(1.2, 0.3), T["attack"] - 1.2)
    add(m, boom(4.0, 0.7, 46), T["empire"])
    add(m, pad([hz(D - 24), hz(D - 23), hz(D - 12)], T["dark"] - T["attack"], 0.3, 0.8, 2.5), T["attack"])
    t = T["empire"] + 0.6
    while t < T["fox"] - 0.3:
        add(m, drum(0.35), t)
        add(m, drum(0.22), t + 0.3)
        t += 0.9
    # The Fox's theme, rising.
    for k, step in enumerate([0, 4, 7, 12, 16]):
        add(m, bell(hz(D + 12 + step), 2.6, 0.14), T["fox"] + 0.3 + k * 0.35)
    add(m, pad([hz(D), hz(D + 4), hz(D + 7)], T["lost"] - T["fox"] + 1, 0.12, 1.0, 1.5), T["fox"])
    for k, at in enumerate(T["promises"]):
        add(m, bell(hz(D + 24 - k * 3), 1.6, 0.12), at)
    t = T["years"]
    while t < T["unsafe"]:
        add(m, drum(0.25), t)
        t += 0.75
    add(m, boom(3.0, 0.5, 40), T["unsafe"])

    # Ice and the ember.
    add(m, bell(hz(D + 24), 4.5, 0.26), T["code"])
    add(m, pad([hz(D), hz(D + 7), hz(D + 12)], T["hilal"] - T["code"] + 0.5, 0.12, 2.0, 0.5), T["code"])
    t, k = T["crack"], 0
    while t < T["hilal"] - 0.2:
        x = (t - T["crack"]) / max(0.1, T["hilal"] - T["crack"])
        add(m, pluck(hz(D + 12 + hicaz[k % len(hicaz)]), 1.2, 0.18 + 0.2 * x), t)
        t += 0.32
        k += 1
    add(m, whoosh(1.4, 0.35), T["beam"] - 1.2)
    add(m, boom(3.0, 0.45, 62), T["beam"])
    add(m, boom(3.0, 0.3, 62), T["hilal"])
    for k, step in enumerate([0, 4, 7, 12, 16, 19]):
        add(m, bell(hz(D + 12 + step), 3.5, 0.14), T["hilal"] + k * 0.11)
    add(m, pad([hz(D - 12), hz(D - 5), hz(D), hz(D + 4), hz(D + 7)], total - T["hilal"], 0.24, 1.0, 4.0), T["hilal"])

    # Learning: a playful plucked figure, with one wrong note.
    for step, dt in [(0, 0), (4, 0.3), (7, 0.6), (6, 0.9)]:
        add(m, pluck(hz(D + 24 + step), 0.9, 0.3), T["learn"] + 0.4 + dt)
    # Hope: the four value notes return and resolve.
    for k, at in enumerate(T["return"]):
        add(m, drum(0.3), at)
        add(m, pluck(hz(D + 12 + [0, 4, 7, 12][k]), 2.0, 0.45), at)
    add(m, bell(hz(D + 12), 6.0, 0.22), T["end"])
    add(m, bell(hz(D + 19), 6.0, 0.14), T["end"] + 0.05)
    return m


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", default=os.path.join(ROOT, "obj-story"))
    ap.add_argument("--vo-dir", help="directory with u01..uNN recordings")
    args = ap.parse_args()
    os.makedirs(args.work, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)

    texts = [u[0] for _, line in SCRIPT for u in line]
    clips = recordings(args.vo_dir, texts) if args.vo_dir else synthesize(texts, args.work)

    lines, k, t = [], 0, 0.0
    for gap, utts in SCRIPT:
        t += gap
        line = []
        for en, tr, pause in utts:
            x, words = clips[k]
            k += 1
            d = len(x) / SR
            line.append({"start": round(t, 3), "end": round(t + d, 3), "en": plain(en), "tr": tr,
                         "words": [[w, round(t + s, 3)] for w, s in words], "_audio": x})
            t += d + pause
        lines.append(line)
    total = t + TAIL

    def u(li, ui):
        return lines[li][ui]

    def word(li, ui, w, nth=0):
        hits = [s for x, s in u(li, ui)["words"] if x.lower().strip(".,'") == w]
        return hits[nth] if len(hits) > nth else u(li, ui)["start"]

    cues = {
        "values": [u(0, i)["start"] for i in range(4)],
        "harmony": u(1, 0)["start"],
        "side": u(1, 1)["start"],
        "attack": u(2, 0)["start"],
        "empire": word(2, 0, "empire"),
        "fox": u(3, 0)["start"],
        "keeper": word(3, 0, "keeper"),
        "lost": word(4, 0, "lost"),
        "money": u(4, 1)["start"],
        "promises": [word(4, 1, "broke"), word(4, 1, "promises"), word(4, 1, "one", 0), word(4, 1, "one", 1)],
        "years": u(5, 0)["start"],
        "grew": u(5, 1)["start"],
        "market": u(5, 2)["start"],
        "product": word(5, 2, "people"),
        "unsafe": u(5, 3)["start"],
        "dark": round(u(6, 0)["start"] - 1.2, 3),
        "forgot": u(6, 0)["start"],
        "code": u(6, 1)["start"],
        "found": u(7, 0)["start"],
        "frozen": word(7, 0, "frozen"),
        "crack": u(7, 1)["start"],
        "beam": word(7, 1, "named"),
        "sky": word(7, 1, "sky"),
        "hilal": u(7, 2)["start"],
        "learn": u(8, 0)["start"],
        "notyet": u(8, 1)["start"],
        "believe": u(9, 0)["start"],
        "return": [round(u(9, 0)["start"] + 0.5 * i, 3) for i in range(4)],
        "end": round(u(9, 0)["end"] + 0.6, 3),
    }
    cues = {k: (round(v, 3) if isinstance(v, float) else v) for k, v in cues.items()}

    voice = np.zeros(int(total * SR))
    for line in lines:
        for x in line:
            add(voice, x.pop("_audio"), x["start"])
    voice *= 0.9 / (np.max(np.abs(voice)) + 1e-9)
    music = compose(total, cues)
    k = int(SR * 0.25)
    env = np.convolve(np.abs(voice), np.ones(k) / k, mode="same")
    music *= 1.0 - 0.5 * np.clip(env * 8, 0, 1)
    music *= 0.42 / (np.max(np.abs(music)) + 1e-9)
    mix = voice + music
    mix *= 0.95 / np.max(np.abs(mix))

    wav = os.path.join(args.work, "story.wav")
    write_wav(wav, mix)
    run("ffmpeg", "-y", "-v", "error", "-i", wav, "-c:a", "aac", "-b:a", "160k", os.path.join(OUT, "story.m4a"))

    timeline = {"duration": round(total, 3), "lines": lines, "cues": cues}
    with open(os.path.join(OUT, "timeline.js"), "w") as f:
        f.write("// Generated by scripts/story/build-audio.py. Do not edit.\n")
        f.write("window.TIMELINE = " + json.dumps(timeline, ensure_ascii=False) + ";\n")
    print(f"duration {total:.2f}s")
    for name, v in cues.items():
        print(name, v)


if __name__ == "__main__":
    main()
