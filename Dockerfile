### BUILD IMAGE

FROM node:10.17.0-alpine3.10 as builder
WORKDIR /src
ENV SENTRY_PUBLIC_DSN=aHR0cHM6Ly9hZDZkYTAwMjQ0MzA0OGI3YTc5ZGFkNWM4YjJiODY3Y0BzZW50cnkuemViYnJhLmNoLzEw
ENV TIMETRACKER_BACKEND_URL=https://timetracker.media.zebbra.ch

# install build dependencies
ADD ./frontend/package.json ./frontend/yarn.lock ./frontend/.npmrc ./frontend/
ADD ./frontend/internals ./frontend/internals/
RUN cd ./frontend && yarn install

# build applications
ADD ./frontend ./frontend
RUN cd ./frontend && yarn build

### RUNTIME IMAGE

FROM node:10.17.0-alpine3.10
WORKDIR /app
ENV NODE_ENV=production

# install system packages
RUN apk add --no-cache bash

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/edge/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/edge/community' >> /etc/apk/repositories
RUN apk update
RUN apk add --no-cache mongodb-tools

# install runtime dependencies
ADD ./backend/package.json ./backend/yarn.lock ./backend/
RUN cd ./backend && yarn install

ADD ./frontend/package.json ./frontend/yarn.lock ./frontend/.npmrc ./frontend/
ADD ./frontend/internals ./frontend/internals/
RUN cd ./frontend && yarn install

# copy build artefacts from builder
ADD ./backend ./backend
ADD ./frontend ./frontend
COPY --from=builder /src/frontend/build ./frontend/build

ADD ./deploy/docker-entrypoint.sh /usr/local/bin/

ENTRYPOINT [ "/usr/local/bin/docker-entrypoint.sh" ]
CMD ["/bin/bash"]
