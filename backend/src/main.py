from os import getenv, path
from sys import argv

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sentry_sdk import init

from .routers import sensors, system

load_dotenv()


class SpaStaticFiles(StaticFiles):
    # pylint: disable=redefined-outer-name
    def lookup_path(self, path: str):
        full_path, stat_result = super().lookup_path(path)
        if stat_result is None:
            full_path, stat_result = super().lookup_path('index.html')
        return full_path, stat_result


init(dsn=getenv('SENTRY_DSN'), send_default_pii=True)

app = FastAPI(title='BentoPi API', version='v1')
app.include_router(sensors.router)
app.include_router(system.router)
app.add_middleware(CORSMiddleware, allow_headers=['*'], allow_methods=['*'], allow_origins=['*'])

if argv[1] != 'dev':
    app.mount('/web', SpaStaticFiles(directory=path.join(path.dirname(__file__), '..', 'web'), html=True), name='web')
