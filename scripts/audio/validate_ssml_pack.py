from pathlib import Path
import xml.etree.ElementTree as ET
import csv, json
ROOT=Path(__file__).resolve().parents[1]
rows=list(csv.DictReader((ROOT/'data/manifests/aws_polly_batch_manifest.csv').open(encoding='utf-8')))
errors=[]
if len(rows)!=474: errors.append(f'Expected 474 batch rows; found {len(rows)}')
for r in rows:
    p=ROOT/r['ssml_file']
    if not p.exists(): errors.append(f'Missing {r["ssml_file"]}'); continue
    txt=p.read_text(encoding='utf-8')
    try: ET.fromstring(txt)
    except Exception as e: errors.append(f'Invalid XML {r["ssml_file"]}: {e}')
    if '<voice' in txt: errors.append(f'Embedded voice tag not allowed: {r["ssml_file"]}')
out={'ok':not errors,'rows':len(rows),'errors':errors[:100]}
(ROOT/'audit').mkdir(exist_ok=True)
(ROOT/'audit/ssml-validation-results.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
if errors:
    print('SSML VALIDATION FAILED')
    [print('-',e) for e in errors[:50]]
    raise SystemExit(1)
print('SSML validation passed.')
print(f'Batch rows: {len(rows)}')
