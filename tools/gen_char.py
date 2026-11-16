"""角色生图工具（OpenAI gpt-image 系列）。

Key 读取顺序：环境变量 OPENAI_API_KEY → 脚本同目录或当前目录的 .env（OPENAI_API_KEY=...）。不要把 Key 写进脚本。

用法：
  python gen_char.py base  "<角色+画风描述>" --n 3            # 文生图出候选 base1..N.png
  python gen_char.py edit  ref.png "<只改哪里>" out.png        # 以一张图为基准做局部修改
  python gen_char.py poses ref.png poses.json                    # 以基准图批量出姿势 p_<名>.png
poses.json 形如 {"point": "一只翅膀指向观众左侧……", "cheer": "……"}

经验：
- 模型不支持透明底：统一要求 "one completely flat uniform pure magenta (#FF00FF) background"，再用 key.py 抠图。
- 出姿势用 edits + "Edit this image. Keep this exact same single character…Change only the pose"；
  不要写 "model sheet / character sheet"，否则会出多视角设定图。
- 想借鉴别人作品的感觉时，用文字描述风格，不要把原图当输入，避免生成仿作。
"""
import base64, json, os, subprocess, sys, concurrent.futures as cf

MAGENTA = " Background: one completely flat uniform pure magenta (#FF00FF), no gradient, no ground shadow, no text."
EDIT_BASE = ("Edit this image. Keep this exact same single character: identical shape, face, colors, outline and art style. "
             "Change only what is described. Exactly one character, one front-facing view (not a turnaround, not multiple views), "
             "centered, full body with generous margin." + MAGENTA + " ")

def key():
    k = os.environ.get("OPENAI_API_KEY")
    if k: return k.strip()
    for d in (os.path.dirname(os.path.abspath(__file__)), os.getcwd()):
        p = os.path.join(d, ".env")
        if os.path.exists(p):
            for line in open(p, encoding="utf-8"):
                if line.startswith("OPENAI_API_KEY="): return line.split("=", 1)[1].strip()
    sys.exit("缺少 OPENAI_API_KEY")

MODEL = os.environ.get("IMAGE_MODEL", "gpt-image-2")
SIZE = os.environ.get("IMAGE_SIZE", "1024x1024")

def call(args, out):
    cmd = ["curl", "-sS", "-m", "300"] + args
    for _ in range(3):  # 网络或服务端偶发错误时重试
        try:
            d = json.loads(subprocess.run(cmd, capture_output=True, text=True).stdout)
        except Exception:
            continue
        if "error" in d:
            if "server" in str(d["error"]).lower(): continue
            return f"ERR {d['error']}"
        open(out, "wb").write(base64.b64decode(d["data"][0]["b64_json"]))
        return "ok"
    return "ERR retries exhausted"

def gen(prompt, out):
    body = json.dumps({"model": MODEL, "prompt": prompt + MAGENTA, "size": SIZE, "quality": "high", "output_format": "png"})
    return call(["https://api.openai.com/v1/images/generations", "-H", f"Authorization: Bearer {key()}",
                 "-H", "Content-Type: application/json", "-d", body], out)

def edit(ref, prompt, out, prefix=EDIT_BASE):
    return call(["https://api.openai.com/v1/images/edits", "-H", f"Authorization: Bearer {key()}", "-F", f"model={MODEL}",
                 "-F", f"image[]=@{ref}", "-F", f"prompt={prefix + prompt}", "-F", f"size={SIZE}",
                 "-F", "quality=high", "-F", "output_format=png"], out)

if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "base":
        n = int(sys.argv[sys.argv.index("--n") + 1]) if "--n" in sys.argv else 2
        with cf.ThreadPoolExecutor(n) as ex:
            for i, r in enumerate(ex.map(lambda i: gen(sys.argv[2], f"base{i}.png"), range(1, n + 1)), 1): print(f"base{i}", r)
    elif mode == "edit":
        print(edit(sys.argv[2], sys.argv[3], sys.argv[4]))
    elif mode == "poses":
        poses = json.load(open(sys.argv[3], encoding="utf-8"))
        with cf.ThreadPoolExecutor(8) as ex:
            for name, r in zip(poses, ex.map(lambda kv: edit(sys.argv[2], kv[1], f"p_{kv[0]}.png"), poses.items())): print(name, r)
