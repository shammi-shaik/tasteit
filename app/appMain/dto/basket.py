from flask_restx import Namespace

class BasketDto :
    post_dish_basket = Namespace('post_dish_basket', description='API to post dish details in Basket')
    remove_dish_basket = Namespace('remove_dish_basket' , description='API to remove a dish from Basket')
    get_dish_basket =Namespace('get_dish_basket' , description='API to get dish details in basket')