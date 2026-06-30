# Amazon Polly Production Guide for BEA/BEA Audio

## Recommended use
Use Amazon Polly for large low-cost audio batches, basic listening activities, fallback generation and simple pronunciation models.

## Input
`data/manifests/aws_polly_batch_manifest.csv` contains asset ID, type, level, voice, engine, fallback engine, language code, output format, SSML file path and target S3 key.

## Output
Generate MP3 audio files, transcript TXT files, reviewed VTT captions, LMS media asset rows and lesson/activity mappings.

## Engine strategy
Use `neural` as preferred where available. Use `standard` as fallback when neural is unavailable, too expensive or unsupported in the selected region.

## Voice strategy
| Level | Preferred voice | Fallback |
|---|---|---|
| A1 | Amy neural | Amy standard |
| A2 | Emma neural | Emma standard |
| B1 | Brian neural | Brian standard |
| B2 | Amy neural | Amy standard |
| C1 | Brian neural | Brian standard |
| C2 | Emma neural | Emma standard |

The developer must confirm voice availability in the selected AWS region before running the full batch.
