from flask_restx import Namespace

class DishDto :
    post_dish_details = Namespace('post_dish_details', description ='API for posting new dish')
    get_dish_details = Namespace('get_dish_details', description='API to get dish details')
    remove_dish = Namespace('remove_dish' , description='API to remove a dish from list')
    list_dishes = Namespace('list_dishes' , description='API to list all dishes')
    update_dish = Namespace('update_dish' , description='API to update the dish details')
    dish_inventory = Namespace('dish_inventory' , description= 'API to maintain inventory of dishes')