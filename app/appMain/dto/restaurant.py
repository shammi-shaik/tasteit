from flask_restx import Namespace
from werkzeug.routing import NoMatch


class RestaurantDto:
    postrestaurantapi = Namespace('postrestaurant',description='create new restaurant ')
    updaterestaurantapi = Namespace('updaterestaurant',description='update restaurant details')
    getrestaurantapi = Namespace('getrestaurant',description='get restaurant details')
    deleterestaurantapi = Namespace('deleterestaurant',description='delete restaurant details')
    listrestaurantapi = Namespace('listrestaurant',description='list all the restaurant')   
