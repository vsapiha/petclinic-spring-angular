import json
from flask import current_app
import pystache

class StateSearch():
    query_renderer = pystache.Renderer()

    def __init__(self, zip_code=None):
        self.zip_code = zip_code


    def zip_code(self):
        return self.zip_code

    def query(self):
        query = json.loads(self.query_renderer.render(self))
        results = current_app.elasticsearch.search(index=current_app.config['ADDRESS_INDEX'], body=query)
        states = [result["key"] for result in results["aggregations"]["state"]["buckets"]]
        states = list(set(state.lower() for state in states))
        if len(states) == 0:
            query = json.loads(self.query_renderer.render_path('all_states.mustache'))
            results = current_app.elasticsearch.search(index=current_app.config['ADDRESS_INDEX'],
                                                       body=query)
            states = [result["key"] for result in results["aggregations"]["state"]["buckets"]]
            states = list(set(state.lower() for state in states))
        return {
            "states": states
        }


class CitySearch():
    query_renderer = pystache.Renderer()

    def __init__(self, zip_code, state):
        self.zip_code = zip_code
        self.state = state

    def state(self):
        return self.state

    def zip_code(self):
        return self.zip_code

    def query(self):
        query = json.loads(self.query_renderer.render(self))
        results = current_app.elasticsearch.search(index=current_app.config['ADDRESS_INDEX'], body=query)
        cities = [result["key"] for result in results["aggregations"]["city"]["buckets"]]
        if len(cities) == 0:
            query = json.loads(self.query_renderer.render_path('cities_for_state.mustache',self))
            results = current_app.elasticsearch.search(index=current_app.config['ADDRESS_INDEX'],
                                                       body=query)
            cities = [result["key"] for result in results["aggregations"]["city"]["buckets"]]
        return {
            "cities": list(set(city.lower() for city in cities))
        }

class AddressSearch():
    query_renderer = pystache.Renderer()

    def __init__(self, zip_code, state, city, address):
        self.zip_code = zip_code
        self.state = state
        self.city = city
        self.address = address

    def address(self):
        return self.address

    def city(self):
        return self.city

    def state(self):
        return self.state

    def zip_code(self):
        return self.zip_code

    def query(self):
        query = json.loads(self.query_renderer.render(self))
        results = current_app.elasticsearch.search(index=current_app.config['ADDRESS_INDEX'], body=query)
        addresses = [result["_source"]["address"] for result in results["hits"]["hits"]]
        return {
            "addresses": list(set(address.lower() for address in addresses))[:10]
        }
