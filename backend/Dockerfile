FROM node:22-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY ../frontend .
RUN pnpm i
RUN pnpm build

FROM python:3.13-slim-trixie
RUN apt update && apt --no-install-recommends install -y libsdl2-2.0-0 libsdl2-mixer-2.0-0 && apt clean autoclean && apt autoremove -y && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -e .
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt
COPY --from=build /app/dist ./web
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host=0.0.0.0"]
