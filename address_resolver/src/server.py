from elasticapm.contrib.flask import ElasticAPM
from elasticsearch import Elasticsearch
from flask import Flask
from api import bp as api_bp
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    use_ssl = app.config['ELASTICSEARCH_URL'].startswith("https")
    verify_certs = app.config['ELASTICSEARCH_VALIDATE_CERTS'].lower() == "true"
    app.elasticsearch = Elasticsearch(hosts=[app.config['ELASTICSEARCH_URL']], http_auth=(app.config['ELASTICSEARCH_USER'], app.config['ELASTICSEARCH_PASSWORD']), timeout=60, use_ssl=use_ssl, verify_certs=verify_certs)
    app.register_blueprint(api_bp, url_prefix='/api')
    apm = ElasticAPM(app)
    return app


app = create_app()
if __name__ == '__main__':
    app.run()


