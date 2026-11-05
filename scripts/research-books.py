"""Cache public book references for private TOC checks. tmp/ is not published."""
from pathlib import Path
import requests, json, concurrent.futures, hashlib, pymupdf, re
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
ROOT=Path(__file__).resolve().parents[1]
BASE='https://sun.bdfz.net'
cache=ROOT/'tmp/references/books';cache.mkdir(parents=True,exist_ok=True)
subjects={'数学':'math','物理':'physics','化学':'chemistry','生物学':'biology','地理':'geography'}
selected=[]
def get(url, **kwargs):
    with requests.Session() as session:
        session.mount('https://',HTTPAdapter(max_retries=Retry(total=2,connect=2,read=2,backoff_factor=1,status_forcelist=[502,503,504])))
        return session.get(url,**kwargs)
for name,sid in subjects.items():
    listcache=cache/(sid+'-list.json')
    if listcache.exists(): data=json.loads(listcache.read_text(encoding='utf-8'))
    else:
        response=get(BASE+'/api/library/editions',params={'phase':'高中','subject':name,'limit':60,'region':'CN'},timeout=30)
        response.raise_for_status()
        data=response.json()
        listcache.write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
    choices=[x for x in data['editions'] if x['publisher']=='人民教育出版社' and (sid!='math' or x['edition_label']=='人教A版')]
    print(name,len(choices),[x['volume'] for x in choices],flush=True)
    for x in choices:x['subjectId']=sid
    selected.extend(choices)
assert len(selected)==26, f'Check volume selection: {len(selected)}'

def fetch(book):
    eid=book['edition_id'];detailcache=cache/(eid+'-detail.json')
    if detailcache.exists(): detail=json.loads(detailcache.read_text(encoding='utf-8'))
    else:
        detail=get(BASE+'/api/library/editions/'+eid,timeout=30).json()['edition']
        detailcache.write_text(json.dumps(detail,ensure_ascii=False),encoding='utf-8')
    f=cache/(eid+'.pdf')
    if not f.exists():
        r=get(BASE+detail['file']['url'],timeout=90);r.raise_for_status()
        assert r.content[:4]==b'%PDF', 'Not PDF'
        assert hashlib.sha256(r.content).hexdigest()==detail['pdf']['sha256'], 'Hash mismatch'
        f.write_bytes(r.content)
    with pymupdf.open(f) as doc:
        front='\n'.join(f'\n[PDF page {i+1}]\n'+doc[i].get_text() for i in range(min(13,len(doc))))
        (cache/(eid+'-front.txt')).write_text(front,encoding='utf-8')
    proof={**book,'referencePdf':str(f.relative_to(ROOT)).replace('\\','/'),'referencePageUrl':'https://basic.smartedu.cn/tchMaterial/detail?contentType=assets_document&contentId='+detail['source']['source_id'],'referenceMirror':BASE+detail['file']['url'],'referenceSha256':detail['pdf']['sha256'],'referencePages':detail['pdf']['pages'],'accessed':'2026-11-06'}
    (cache/(eid+'.json')).write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf-8')
    print('READ',book['subjectId'],book['volume'],detail['pdf']['pages'],flush=True)
    return proof
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
    output=list(ex.map(fetch,selected))
(cache/'inventory.json').write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding='utf-8')
print('Reference inventory saved; copyrighted PDF files remain in ignored tmp/.',flush=True)
