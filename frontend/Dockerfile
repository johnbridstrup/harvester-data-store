FROM node:16.16.0-slim as buildStage

# Copy and package installation
RUN mkdir -p /react/app/
COPY public/ /react/app/public/
COPY src/ /react/app/src/
COPY package-lock.json package.json /react/app/
WORKDIR /react/app
RUN npm ci --omit=dev --ignore-scripts

# Args and build
ARG HDS_PORT=8085
ARG FRONTEND_PORT=3000
ARG HDS_URL="http://localhost:${HDS_PORT}"
ARG FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
ARG NODE_ENV="development"
ENV REACT_APP_HDS_API_URL=${HDS_URL}
ENV REACT_APP_HOSTED_URL=${FRONTEND_URL}
ENV REACT_APP_NODE_ENV=${NODE_ENV}
RUN echo "API URL: ${REACT_APP_HDS_API_URL}"
RUN echo "HOSTED URL: ${REACT_APP_HOSTED_URL}"
RUN echo "NODE ENV: ${REACT_APP_NODE_ENV}"
RUN npm run build

FROM node:16.16.0-slim
RUN mkdir -p /opt/app/
WORKDIR /opt/app/
COPY server.js /opt/app/
COPY entrypoint.sh /opt/app/entrypoint.sh
COPY --from=buildStage /react/app/build/ /opt/app/build/
RUN npm install express dotenv
EXPOSE 3000
CMD ["/opt/app/entrypoint.sh"]