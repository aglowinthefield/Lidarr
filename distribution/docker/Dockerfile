# Overlays this fork's build onto the linuxserver.io Lidarr image.
#
# We keep LSIO's scaffolding (s6 init, PUID/PGID, /config handling) and swap out
# only /app/lidarr/bin, which is exactly what their service runs:
#   /app/lidarr/bin/Lidarr -nobrowser -data=/config
# That makes the result a drop-in replacement for lscr.io/linuxserver/lidarr in
# an existing compose stack — same volumes, same env, same behaviour.
#
# The build is SelfContained, so the .NET runtime ships in _artifacts and the
# base image only has to provide musl, libstdc++ and icu — all already there.

ARG BASE_IMAGE=lscr.io/linuxserver/lidarr:nightly
FROM ${BASE_IMAGE}

ARG LIDARR_VERSION=unknown
ARG SOURCE_BRANCH=mochi

RUN rm -rf /app/lidarr/bin
COPY _artifacts/linux-musl-x64/net8.0/Lidarr /app/lidarr/bin

RUN chmod +x /app/lidarr/bin/Lidarr && \
    if [ -f /app/lidarr/bin/Lidarr.Update/Lidarr.Update ]; then \
        chmod +x /app/lidarr/bin/Lidarr.Update/Lidarr.Update; \
    fi

# UpdateMethod=docker stops Lidarr from trying to update itself over our build.
RUN printf 'UpdateMethod=docker\nBranch=%s\nPackageVersion=%s\nPackageAuthor=aglowinthefield\n' \
        "${SOURCE_BRANCH}" "${LIDARR_VERSION}" \
        > /app/lidarr/package_info
