FROM node:18.7-slim as buildStage

RUN mkdir -p /react/app/
COPY public/ /react/app/public/
COPY src/ /react/app/src/
COPY package-lock.json package.json /react/app/
WORKDIR /react/app
RUN npm ci
ARG HDS_PORT=8085
ARG FRONTEND_PORT=3000
ARG HDS_URL="localhost:${HDS_PORT}"
ARG FRONTEND_URL="localhost:${FRONTEND_PORT}"
ENV REACT_APP_HDS_API_URL=${HDS_URL}
ENV REACT_APP_HOSTED_URL=${FRONTEND_URL}
RUN echo "API URL: ${REACT_APP_HDS_API_URL}"
RUN echo "HOSTED URL: ${REACT_APP_HOSTED_URL}}"
RUN npm run build

FROM node:18.7-slim
RUN mkdir -p /opt/app/
WORKDIR /opt/app/
COPY server.js /opt/app/
COPY entrypoint.sh /opt/app/entrypoint.sh
COPY --from=buildStage /react/app/build/ /opt/app/build/
RUN npm install express dotenv
EXPOSE 3000
CMD /opt/app/entrypoint.sh