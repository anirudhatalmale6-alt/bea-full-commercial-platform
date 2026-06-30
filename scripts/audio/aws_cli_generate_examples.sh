#!/usr/bin/env bash
set -euo pipefail
AWS_REGION="${AWS_REGION:-eu-west-2}"
OUT_DIR="${BEA_POLLY_OUTPUT_DIR:-generated_audio}"
mkdir -p "$OUT_DIR"
aws polly put-lexicon --region "$AWS_REGION" --name bea-pronunciation-lexicon --content file://aws/lexicons/bea-pronunciation-lexicon.pls
aws polly synthesize-speech --region "$AWS_REGION" --engine neural --voice-id Amy --language-code en-GB --output-format mp3 --text-type ssml --text file://ssml/lessons/A1/bea-a1-m01-l01-personal-information-and-classroom-english-grammar-lesson-1.ssml "$OUT_DIR/sample-a1-lesson.mp3"
