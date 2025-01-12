
# Use "--progress=plain --no-cache" to debug
docker build --platform linux/amd64 -t sneakerx-parser-image .
docker tag sneakerx-parser-image:latest 273135773297.dkr.ecr.us-east-2.amazonaws.com/sneakerx-repo:latest
docker push 273135773297.dkr.ecr.us-east-2.amazonaws.com/sneakerx-repo:latest
