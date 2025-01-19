
# Use "--progress=plain --no-cache" to debug
aws ecr get-login-password --region us-east-2 --profile airon+1@tark.pro | docker login --username AWS --password-stdin 273135773297.dkr.ecr.us-east-2.amazonaws.com
docker build --platform linux/amd64 -t sneakerx-parser-image .
docker tag sneakerx-parser-image:latest 273135773297.dkr.ecr.us-east-2.amazonaws.com/sneakerx-repo:latest
docker push 273135773297.dkr.ecr.us-east-2.amazonaws.com/sneakerx-repo:latest
