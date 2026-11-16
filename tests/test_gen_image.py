import io, json, pytest
from PIL import Image
import gen_image, openai_images
class FakeAPI:
    def __init__(self): self.last_prompt = None; self.calls = 0
    def __call__(self, prompt, size="1024x1536", **kw):
        self.last_prompt = prompt; self.calls += 1
        b = io.BytesIO(); Image.new("RGB", (1024, 1536), (200, 120, 40)).save(b, "PNG"); return b.getvalue()
@pytest.fixture
def fake_api(monkeypatch):
    f = FakeAPI(); monkeypatch.setattr(openai_images, "generate", f)
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test-secret-value"); return f
def test_generated_image_is_indexed(tmp_path, fake_api):
    e = gen_image.generate("深夜的电商办公室", "office-night", images_dir=tmp_path)
    assert Image.open(tmp_path/"office-night.jpg").size == (1080, 1920)
    idx = json.loads((tmp_path/"index.json").read_text(encoding="utf-8"))
    assert idx == [e] and e["source"] == "generated" and e["license"] and e["file"] == "office-night.jpg" and e["prompt"] == "深夜的电商办公室"
def test_prompt_gets_safety_suffix(tmp_path, fake_api):
    gen_image.generate("仓库", "w", images_dir=tmp_path)
    assert "真实人物" in fake_api.last_prompt and "品牌" in fake_api.last_prompt and fake_api.last_prompt.startswith("仓库")
def test_duplicate_id_rejected(tmp_path, fake_api):
    gen_image.generate("a", "x", images_dir=tmp_path)
    with pytest.raises(ValueError): gen_image.generate("b", "x", images_dir=tmp_path)
    assert fake_api.calls == 1
def test_register_requires_source_and_license(tmp_path):
    src = tmp_path/"p.jpg"; Image.new("RGB", (800, 600)).save(src)
    with pytest.raises(ValueError): gen_image.register(src, "stock1", source="", license="CC0", images_dir=tmp_path/"i")
    with pytest.raises(ValueError): gen_image.register(src, "stock1", source="https://x", license=" ", images_dir=tmp_path/"i")
    assert not (tmp_path/"i"/"index.json").exists()
def test_register_external_image(tmp_path):
    src = tmp_path/"p.jpg"; Image.new("RGB", (800, 600)).save(src)
    e = gen_image.register(src, "stock1", source="https://example.com/p", license="CC0", images_dir=tmp_path/"i")
    assert Image.open(tmp_path/"i"/"stock1.jpg").size == (1080, 1920) and e["source"] == "https://example.com/p" and e["license"] == "CC0"
def test_key_never_printed(tmp_path, fake_api, capsys):
    gen_image.main(["仓库", "--id", "k", "--images-dir", str(tmp_path)])
    out = capsys.readouterr(); assert "sk-" not in out.out + out.err
def test_key_read_from_env_file(tmp_path, monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    (tmp_path/"my key.env").write_text("OPENAI_API_KEY=sk-from-file\n", encoding="utf-8")
    assert openai_images.api_key(search_dirs=[tmp_path]) == "sk-from-file"
def test_missing_key_message_has_no_secret(tmp_path, monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    with pytest.raises(RuntimeError) as e: openai_images.api_key(search_dirs=[tmp_path])
    assert "OPENAI_API_KEY" in str(e.value)
