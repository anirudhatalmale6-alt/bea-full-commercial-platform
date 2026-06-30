variable "project" { default = "lea" }
resource "aws_s3_bucket" "media" { bucket = "lea-production-media-assets" }
resource "aws_s3_bucket_public_access_block" "media" { bucket = aws_s3_bucket.media.id block_public_acls = true block_public_policy = true ignore_public_acls = true restrict_public_buckets = true }
# Add CloudFront Origin Access Control and signed URL policy in production.
