from pathlib import Path
import requests,subprocess,json,hashlib,concurrent.futures,datetime
root=Path(__file__).resolve().parents[1];base='https://yangwei251003.github.io/manyou-knowledge-comics/'
commit=subprocess.run(['git','rev-parse','HEAD'],cwd=root,capture_output=True,text=True,check=True).stdout.strip()
build=json.loads(subprocess.run(['gh','api','repos/yangwei251003/manyou-knowledge-comics/pages/builds/latest'],cwd=root,capture_output=True,text=True,encoding='utf-8',check=True).stdout)
assert build['status']=='built' and build['commit']==commit
media=json.loads((root/'docs/asset-hashes.json').read_text(encoding='utf-8'))['assets']
paths=['index.html','src/app.js','src/course-library.js','src/precision-models.js','content/books.json','content/courses.js','content/math.js','content/physics.js','content/chemistry.js','content/biology.js','content/geography.js','content/depth.js','content/legacy-links.js','production/video-manifest.json']
expected={x['file']:x['sha256'] for x in media}
for n in paths:expected[n]=hashlib.sha256((root/n).read_bytes()).hexdigest()
def check(item):
 file,sha=item;r=requests.get(base+file,timeout=60);r.raise_for_status();actual=hashlib.sha256(r.content).hexdigest();assert actual==sha,f'Stale/mismatched file: {file}';return {'file':file,'httpStatus':r.status_code,'sha256Match':True,'bytes':len(r.content),'contentType':r.headers.get('content-type')}
with concurrent.futures.ThreadPoolExecutor(4) as ex:assets=list(ex.map(check,expected.items()))
r=requests.get(base+'assets/video/conic-distance.mp4',headers={'Range':'bytes=0-63'},timeout=30)
assert r.status_code in [200,206]
assert r.content[:64]==(root/'assets/video/conic-distance.mp4').read_bytes()[:64]
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base':base,'testedReleaseCommit':commit,'pagesBuild':{'status':build['status'],'commit':build['commit'],'updatedAt':build.get('updated_at')},'files':assets,'videoRangeStatus':r.status_code,'teacherReview':'not-performed','realStudentValidation':'not-performed','fullVideoListeningReview':False}
(root/'docs/live-v02-results.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print(json.dumps({'pages':build['status'],'commit':commit,'verifiedFiles':len(assets),'sha256AllMatch':True,'videoRangeStatus':r.status_code},ensure_ascii=False))
