# Use an official AWS Lambda Node.js runtime as a base image
#FROM public.ecr.aws/lambda/nodejs:18
# todo use this mcr.microsoft.com/playwright
#FROM node:18-alpine
FROM mcr.microsoft.com/playwright
# Copy application files into the container
#COPY app.js package.json ./

RUN echo ">> Starting Docker image build..."
#RUN npm install -g yarn

# copy folder to the container
COPY . ./app
RUN echo ">> App files folder copied."

WORKDIR /app
RUN pwd && ls -l

# Install any dependencies specified in package.json
RUN echo ">> Installing dependencies..."
RUN yarn install
RUN pwd
RUN ls -l
RUN echo ">> Dependencies installed."

RUN echo ">> Installing playwright..."
RUN npx playwright install chromium
WORKDIR /ms-playwright
RUN pwd
RUN ls -l
#RUN echo ls -l /ms-playwright/chromium-1140
#RUN echo ls -l /ms-playwright/chromium-1140/chrome-linux
#RUN echo ls -l /ms-playwright/chromium-1140/chrome-linux/chrome
RUN echo ">> Playwright installed"

RUN echo ">> Building..."
WORKDIR /app
RUN yarn build
RUN echo ">> Build done"

RUN pwd && ls -l

# Install Xvfb and dependencies
RUN apt-get update && apt-get install -y \
    xvfb \
    x11-utils \
    && rm -rf /var/lib/apt/lists/*

# Set up the virtual display (Xvfb)
CMD Xvfb :99 -screen 0 1280x1024x24 & sleep 10 && DISPLAY=:99 node build/src/index.js
