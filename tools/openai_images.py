"""OpenAI 图像接口的薄封装。Key 只从环境变量或 .env 文件读取，不打印、不写进脚本。"""
import base64, json, os, time, urllib.error, urllib.request, uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
MODEL = os.environ.get("IMAGE_MODEL", "gpt-image-2")
API = "https://api.openai.com/v1/images/"

def api_key(search_dirs=None) -> str:
    k = os.environ.get("OPENAI_API_KEY")
    if k: return k.strip()
    for d in (search_dirs or [HERE, HERE.parent / ".secrets", Path.cwd()]):
        d = Path(d)
        if not d.is_dir(): continue
        for f in sorted(d.glob("*.env")) + ([d / ".env"] if (d / ".env").is_file() else []):
            for line in f.read_text(encoding="utf-8", errors="replace").splitlines():
                if line.strip().startswith("OPENAI_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"')
    raise RuntimeError("缺少 OPENAI_API_KEY：请设置环境变量，或在 tools/ 下放一个写有 OPENAI_API_KEY=… 的 .env 文件")

def _send(req) -> bytes:
    last = ""
    for attempt in range(3):               # 网络或服务端偶发错误时重试
        try:
            with urllib.request.urlopen(req, timeout=400) as r:
                d = json.loads(r.read())
            return base64.b64decode(d["data"][0]["b64_json"])
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", "replace")
            try: last = json.loads(body)["error"]["message"]
            except Exception: last = body[:300]
            if e.code < 500 and e.code != 429: break
        except Exception as e:
            last = type(e).__name__ + ": " + str(e)[:200]
        time.sleep(3 * (attempt + 1))
    raise RuntimeError("生图失败：" + last)

def generate(prompt: str, size: str = "1024x1536", quality: str = None, model: str = None) -> bytes:
    quality = quality or os.environ.get("IMAGE_QUALITY", "high")   # 代理会掐断三分多钟的长连接时，用 IMAGE_QUALITY=medium
    body = json.dumps({"model": model or MODEL, "prompt": prompt, "size": size, "quality": quality, "output_format": "png"}).encode()
    return _send(urllib.request.Request(API + "generations", data=body,
                 headers={"Authorization": "Bearer " + api_key(), "Content-Type": "application/json"}))

def edit(images: list, prompt: str, size: str = "1024x1024", quality: str = "high", model: str = None) -> bytes:
    b = uuid.uuid4().hex; parts = []
    def field(name, value): parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())
    for k, v in (("model", model or MODEL), ("prompt", prompt), ("size", size), ("quality", quality), ("output_format", "png")): field(k, v)
    for i, p in enumerate(images):
        parts.append(f'--{b}\r\nContent-Disposition: form-data; name="image[]"; filename="img{i}.png"\r\nContent-Type: image/png\r\n\r\n'.encode() + Path(p).read_bytes() + b"\r\n")
    parts.append(f"--{b}--\r\n".encode())
    return _send(urllib.request.Request(API + "edits", data=b"".join(parts),
                 headers={"Authorization": "Bearer " + api_key(), "Content-Type": f"multipart/form-data; boundary={b}"}))
