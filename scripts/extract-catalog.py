"""Read public national lesson catalogue metadata; never publish textbook pages."""
from pathlib import Path
import json, collections, pymupdf

ROOT = Path(__file__).resolve().parents[1]
doc = pymupdf.open(ROOT / 'tmp/references/2024-national-lesson-catalog.pdf')
rows = []
for page_no, page in enumerate(doc):
    words = page.get_text('words')
    anchors = sorted(w[1] + (w[3]-w[1])/2 for w in words if w[4]=='高中' and w[0]<100)
    boundaries = [108] + [(a+b)/2 for a,b in zip(anchors,anchors[1:])] + [page.rect.height-40]
    for i, anchor in enumerate(anchors):
        cells = [[] for _ in range(6)]
        for w in words:
            cy = (w[1]+w[3])/2
            if not boundaries[i] <= cy < boundaries[i+1]:
                continue
            cx = (w[0]+w[2])/2
            col = next((j for j,(lo,hi) in enumerate(zip([50,100,150,218,309,589],[100,150,218,309,589,810])) if lo<=cx<hi),None)
            if col is not None: cells[col].append(w)
        text = [' '.join(w[4] for w in sorted(c,key=lambda x:(round(x[1],1),x[0]))) for c in cells]
        if text[1] in ['数学','物理','化学','生物学','地理']:
            rows.append(dict(zip(['stage','subject','edition','volume','path','leaf'],text),page=page_no+1))
out=ROOT/'tmp/references/national-catalog-rows.json'
out.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
selected=[r for r in rows if r['edition'] in ['人教A版','人教版']]
(out.parent/'pep-catalog-rows.json').write_text(json.dumps(selected,ensure_ascii=False,indent=2),encoding='utf-8')
for subject in ['数学','物理','化学','生物学','地理']:
    ss=[r for r in selected if r['subject']==subject]
    print(subject,len(ss),dict(collections.Counter(r['volume'] for r in ss)))
    for vol in dict.fromkeys(r['volume'] for r in ss):
        chapters=list(dict.fromkeys(r['path'].split('->')[0] for r in ss if r['volume']==vol))
        print(' ',vol,chapters)
print('EDITIONS',dict(collections.Counter(r['edition'] for r in rows)))
