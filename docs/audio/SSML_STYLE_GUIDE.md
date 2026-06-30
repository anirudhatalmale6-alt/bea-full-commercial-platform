# BEA Amazon Polly SSML Style Guide
Every SSML file uses a Polly-safe `<speak>` root with `<p>`, `<break>` and `<prosody rate="...">` tags.

## Level pacing
| Level | Rate | Pause |
|---|---|---|
| A1 | 86% | longer pauses |
| A2 | 88% | longer pauses |
| B1 | 92% | medium pauses |
| B2 | 96% | natural pauses |
| C1 | 98% | natural/advanced pace |
| C2 | 100% | natural pace |

Avoid unsupported SSML tags, unescaped ampersands, embedded voice tags and overly long basic prompts.
