from flask_restx import  Namespace

class FavoriteDto:
    post_favorite_api = Namespace('post_favorite', description='API to post favorite restaurant to table ')
    get_favorite_api = Namespace('get_favorite', description= 'API to get favorite restaurant from table')
    remove_favorite_api = Namespace('remove_favorite', description='API to remove favorite restaurant from table')