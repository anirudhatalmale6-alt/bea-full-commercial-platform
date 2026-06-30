from pathlib import Path
import csv, os, boto3
ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'data/manifests/aws_polly_batch_manifest.csv'
def main():
    bucket=os.environ['BEA_AUDIO_BUCKET']; region=os.getenv('AWS_REGION','eu-west-2'); outdir=Path(os.getenv('BEA_POLLY_OUTPUT_DIR',str(ROOT/'generated_audio'))); s3=boto3.client('s3',region_name=region)
    uploaded=0
    for row in csv.DictReader(MANIFEST.open(encoding='utf-8')):
        local=outdir/row['target_s3_key']
        if not local.exists(): print(f'Missing {local}'); continue
        s3.upload_file(str(local),bucket,row['target_s3_key'],ExtraArgs={'ContentType':'audio/mpeg'}); uploaded+=1; print(f'Uploaded s3://{bucket}/{row["target_s3_key"]}')
    print(f'Uploaded {uploaded} files.')
if __name__=='__main__': main()
