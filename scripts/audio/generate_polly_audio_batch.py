"""Generate BEA Amazon Polly MP3 files from data/manifests/aws_polly_batch_manifest.csv.
Requirements: pip install boto3
Example: AWS_REGION=eu-west-2 python scripts/generate_polly_audio_batch.py --limit 5
"""
from pathlib import Path
import argparse,csv,os,time
import boto3
from botocore.exceptions import ClientError
ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'data/manifests/aws_polly_batch_manifest.csv'
def synthesize(polly,row,outdir):
    ssml=(ROOT/row['ssml_file']).read_text(encoding='utf-8')
    out=outdir/row['target_s3_key']; out.parent.mkdir(parents=True,exist_ok=True)
    req={'Text':ssml,'TextType':'ssml','OutputFormat':row['output_format'],'VoiceId':row['voice_id'],'Engine':row['engine'],'LanguageCode':row['language_code']}
    try: resp=polly.synthesize_speech(**req)
    except ClientError:
        req['VoiceId']=row.get('fallback_voice_id') or row['voice_id']; req['Engine']=row.get('fallback_engine') or 'standard'; resp=polly.synthesize_speech(**req)
    with resp['AudioStream'] as stream: out.write_bytes(stream.read())
    return out
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--all',action='store_true'); ap.add_argument('--limit',type=int,default=10); ap.add_argument('--sleep',type=float,default=.15); args=ap.parse_args()
    region=os.getenv('AWS_REGION','eu-west-2'); outdir=Path(os.getenv('BEA_POLLY_OUTPUT_DIR',str(ROOT/'generated_audio'))); polly=boto3.client('polly',region_name=region)
    rows=list(csv.DictReader(MANIFEST.open(encoding='utf-8'))); rows=rows if args.all else rows[:args.limit]
    print(f'Generating {len(rows)} audio files to {outdir}')
    for i,row in enumerate(rows,1):
        out=synthesize(polly,row,outdir); print(f'{i}/{len(rows)} {row["asset_id"]} -> {out}'); time.sleep(args.sleep)
if __name__=='__main__': main()
