# Downloadable Assets Specification

## Required downloadable items

For every level:

- learner workbook
- teacher pack
- answer key pack
- progress tracker
- parent/institution progress report
- course completion pack
- certificate PDF

For every lesson:

- PDF worksheet
- DOCX worksheet
- answer key
- teacher notes
- optional visual activity cards

## Current pack format

This pack includes worksheet and answer-key markdown for every lesson. The developer can generate DOCX/PDF assets using the asset generation script.

## Production storage

Upload generated assets to:

- DigitalOcean Spaces
- AWS S3
- Supabase Storage
- or equivalent protected file storage

Every asset must have:

- access level
- course ID
- lesson ID
- file format
- file size
- download permission rule
