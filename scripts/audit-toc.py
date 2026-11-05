"""Compare authored section titles to privately cached book front matter."""
from pathlib import Path
import json,re,unicodedata,subprocess,hashlib
ROOT=Path(__file__).resolve().parents[1]
data=json.loads(subprocess.run(['node','--input-type=module','-e',"import{chapters}from './content/courses.js';console.log(JSON.stringify(chapters));"],cwd=ROOT,capture_output=True,text=True,encoding='utf-8',check=True).stdout)
books=json.loads((ROOT/'content/books.json').read_text(encoding='utf-8'))['books']
inventory=json.loads((ROOT/'tmp/references/books/inventory.json').read_text(encoding='utf-8'))
def norm(s):
    s=unicodedata.normalize('NFKC',s).replace('（拓展）','').replace('(拓展)','')
    s=s.translate(str.maketrans({'狔':'y','犃':'A','狓':'x'}))
    return re.sub(r'[^\u4e00-\u9fffA-Za-z0-9]', '',s)
results=[];unmatched=[]
for b in books:
    if b.get('supplement'):continue
    ref=next(x for x in inventory if x['subjectId']==b['subject'] and x['volume']==b['title'])
    f=ROOT/'tmp/references/books'/(ref['edition_id']+'-front.txt')
    text=norm(f.read_text(encoding='utf-8'))
    cs=[c for c in data if c['book']==b['id']]
    ss=[s for c in cs for s in c['sections']]
    matches=[s for s in ss if norm(s['title']) in text]
    missing=[{'id':s['id'],'title':s['title']} for s in ss if norm(s['title']) not in text]
    results.append({'book':b['id'],'title':b['title'],'chapters':len(cs),'sections':len(ss),'sourcePdfSha256':b['referenceSha256'],'frontMatterTextSha256':hashlib.sha256(f.read_bytes()).hexdigest(),'exactNormalisedTitleMatches':len(matches),'manualComparisonNeeded':missing})
    unmatched.extend(missing)
out={'date':'2026-11-06','method':'NFKC normalization and punctuation/whitespace removal, matching section titles against cached public textbook front matter. This checks catalogue mapping, not scientific correctness or all knowledge coverage.','books':results,'exactTitleMatches':sum(x['exactNormalisedTitleMatches'] for x in results),'sectionCount':sum(x['sections'] for x in results),'manualComparisonNeeded':unmatched}
(ROOT/'docs/toc-audit.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'exactTitleMatches':out['exactTitleMatches'],'sectionCount':out['sectionCount'],'manualComparisonNeeded':unmatched},ensure_ascii=False,indent=2))
