FROM node:20-alpine
RUN apk add --no-cache bash git
RUN git config --global user.name "Autodeploy Bot"
RUN git config --global user.email "ci@deploy-bot.com"
RUN echo $GITHUB_TOKEN

# copy project
COPY ./app ./app
# set work directory
WORKDIR /app
