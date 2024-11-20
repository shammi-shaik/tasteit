from flask_restx import  Namespace

class RatingDto:
    post_rating_api = Namespace('post_rating', description='API to post rating to the restaurant ')
    get_rating_api = Namespace('get_rating', description= 'API to get rating of restaurant')
