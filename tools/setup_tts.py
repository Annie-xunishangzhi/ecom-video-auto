"""语音合成环境检查与安装（VoxCPM2，本机运行）。
退出码：0 就绪；1 安装或下载失败；3 硬件不足；4 Python 版本不符。硬件不足时不安装，也不换别的引擎。"""
import importlib.util, os, subprocess, sys
from pathlib import Path

MODEL = "openbmb/VoxCPM2"
MIN_VRAM_GB = 8.0
MIRROR = "https://hf-mirror.com"

def _python_version(): return sys.version_info[:2]
def _gpu():
    try:
        r = subprocess.run(["nvidia-smi", "--query-gpu=name,memory.total", "--format=csv,noheader,nounits"],
                           capture_output=True, text=True, timeout=20)
        name, mem = r.stdout.strip().splitlines()[0].rsplit(",", 1)
        return name.strip(), round(float(mem) / 1024, 1)
    except Exception:
        return None
def _voxcpm_installed(): return importlib.util.find_spec("voxcpm") is not None
def _model_cached():
    hub = Path(os.environ.get("HF_HOME", Path.home() / ".cache" / "huggingface")) / "hub"
    return (hub / ("models--" + MODEL.replace("/", "--"))).is_dir()
def _install():
    return subprocess.run([sys.executable, "-m", "pip", "install", "voxcpm", "soundfile"]).returncode == 0
def _download_model():
    code = f"from huggingface_hub import snapshot_download; snapshot_download('{MODEL}')"
    if subprocess.run([sys.executable, "-c", code]).returncode == 0: return True
    print("默认下载源连不上，改用国内镜像重试……")
    return subprocess.run([sys.executable, "-c", code], env={**os.environ, "HF_ENDPOINT": MIRROR}).returncode == 0

def check() -> dict:
    gpu = _gpu()
    return {"python_ok": (3, 10) <= _python_version() <= (3, 12), "gpu_name": gpu[0] if gpu else None,
            "vram_gb": gpu[1] if gpu else None, "voxcpm_installed": _voxcpm_installed(), "model_cached": _model_cached()}

def main(argv=None) -> int:
    c = check()
    if not c["python_ok"]:
        v = _python_version(); print(f"Python 版本是 {v[0]}.{v[1]}，语音合成需要 3.10–3.12。"); return 4
    if c["voxcpm_installed"] and c["model_cached"]:
        print("语音合成已就绪。"); return 0
    if c["gpu_name"] is None:
        print("没有检测到 NVIDIA 显卡，无法在本机运行语音合成。"); return 3
    if c["vram_gb"] < MIN_VRAM_GB:
        print(f"显卡 {c['gpu_name']} 的显存是 {c['vram_gb']} GB，语音合成约需 {MIN_VRAM_GB:.0f} GB 显存。"); return 3
    if not c["voxcpm_installed"]:
        print("正在安装 voxcpm……")
        if not _install(): print("安装失败。"); return 1
    if not c["model_cached"]:
        print("正在下载模型（几个 GB，需要一些时间）……")
        if not _download_model(): print("模型下载失败。"); return 1
    print("语音合成已就绪。"); return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
