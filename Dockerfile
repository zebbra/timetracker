### BUILD IMAGE

FROM node:10.17.0-alpine3.10 as builder
WORKDIR /src

# install build dependencies
ADD ./frontend/package.json ./frontend/yarn.lock ./frontend/
ADD ./frontend/internals ./frontend/internals/
RUN cd ./frontend && yarn install

# build applications
ADD ./frontend ./frontend
RUN cd ./frontend && yarn build

### RUNTIME IMAGE

FROM node:10.17.0-alpine3.10
WORKDIR /app
ENV NODE_ENV=production

# install runtime dependencies
ADD ./backend/package.json ./backend/yarn.lock ./backend/
RUN cd ./backend && yarn install
ADD ./frontend/package.json ./frontend/yarn.lock ./frontend/
ADD ./frontend/internals ./frontend/internals/
RUN cd ./frontend && yarn install

# copy build artefacts from builder
ADD ./backend ./backend
Add ./frontend ./frontend
COPY --from=builder /src/frontend/build ./frontend/build

ADD ./deploy/docker-entrypoint.sh /usr/local/bin/

ENTRYPOINT [ "/usr/local/bin/docker-entrypoint.sh" ]
CMD ["/bin/bash"]
