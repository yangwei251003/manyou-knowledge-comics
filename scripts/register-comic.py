"""Register actual built-in ImageGen output, without modifying the raster image."""
from pathlib import Path
import argparse, hashlib, json, shutil
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser()
p.add_argument('--id',required=True)
p.add_argument('--source',required=True)
p.add_argument('--prompt',required=True)
p.add_argument('--version',type=int,default=1)
a=p.parse_args()
catalog=json.loads((ROOT/'content/curriculum.json').read_text(encoding='utf-8-sig'))
ids={x['id'] for s in catalog['subjects'] for c in s['chapters'] for x in c['points']}
if a.id not in ids:raise SystemExit('Unknown curriculum id')
source=Path(a.source).resolve(strict=True)
with Image.open(source) as im:
    fmt,size,frames=im.format,im.size,getattr(im,'n_frames',1)
    im.verify()
if fmt not in ('PNG','JPEG','WEBP') or frames!=1:raise SystemExit('Expected a verified static raster image')
folder=ROOT/'assets/comics';folder.mkdir(parents=True,exist_ok=True)
dest=folder/f'{a.id}-v{a.version}.{source.suffix.lstrip(".")}'
digest=hashlib.sha256(source.read_bytes()).hexdigest()
if dest.exists() and hashlib.sha256(dest.read_bytes()).hexdigest()!=digest:
    raise SystemExit('Existing asset differs; use a new version')
if not dest.exists():shutil.copy2(source,dest)
manifest=ROOT/'production/comic-manifest.json';manifest.parent.mkdir(parents=True,exist_ok=True)
data=json.loads(manifest.read_text(encoding='utf-8')) if manifest.exists() else {'schemaVersion':1,'updated':'2026-11-06','generator':'built-in image_gen','modelId':None,'assets':{}}
data['assets'][a.id]={'path':dest.relative_to(ROOT).as_posix(),'version':a.version,'sha256':digest,'bytes':dest.stat().st_size,'width':size[0],'height':size[1],'frames':frames,'prompt':a.prompt,'contentReview':'pending','teacherReview':'not-performed','panels':6}
temp=manifest.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(manifest)
print(json.dumps({'id':a.id,'file':dest.relative_to(ROOT).as_posix(),'size':size,'count':len(data['assets'])},ensure_ascii=False))
