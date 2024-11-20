from pydoc import importfile

from flask import Blueprint
from flask_restx import Api
from app.appMain.controllers.users import (updatedetailsapi_blueprint, loginapi_blueprint, deleteapi_blueprint, signup_blueprint, getdetailsapi_blueprint,listusersapi_blueprint)
from app.appMain.controllers.roles import (getroleapi_blueprint)
from app.appMain.controllers.status import (getstatusapi_blueprint)
from app.appMain.controllers.restaurant import(postrestaurantapi_blueprint ,updaterestaurantapi_blueprint,getrestaurantapi_blueprint,deleterestaurantapi_blueprint ,listrestaurantapi_blueprint)
from app.appMain.controllers.dish import(post_dish_details_api_blueprint , get_dish_details_api_blueprint , remove_dish_api_blueprint ,list_dishes_api_blueprint ,update_dish_details_api_blueprint,dish_inventory_api_blueprint)
from app.appMain.controllers.basket import (post_dish_basket_api_blueprint ,remove_dish_basket_api_blueprint,get_basket_api_blueprint)
from app.appMain.controllers.orders import (post_order_details_api_blueprint , remove_order_details_api_blueprint,get_order_details_api_blueprint ,get_orders_seller_api_blueprint )
from app.appMain.controllers.review import (post_review_api_blueprint, get_review_api_blueprint,get_review_customer_blueprint)
from app.appMain.controllers.rating import (post_rating_api_blueprint , get_rating_api_blueprint)
from app.appMain.controllers.favorite import (post_favorite_api_blueprint, get_favorite_api_blueprint ,remove_favorite_api_blueprint)
from app.appMain.controllers.otp import (sendotp_blueprint, veirfyotp_blueprint ,reset_password_blueprint)




blueprint = Blueprint('api',__name__)
api = Api(blueprint, title='shammi')

api.add_namespace(updatedetailsapi_blueprint)
api.add_namespace(loginapi_blueprint)
api.add_namespace(deleteapi_blueprint)
api.add_namespace(signup_blueprint)
api.add_namespace(getdetailsapi_blueprint)
api.add_namespace(listusersapi_blueprint)

api.add_namespace(getroleapi_blueprint)

api.add_namespace(getstatusapi_blueprint)

api.add_namespace(postrestaurantapi_blueprint)
api.add_namespace(updaterestaurantapi_blueprint)
api.add_namespace(getrestaurantapi_blueprint)
api.add_namespace(deleterestaurantapi_blueprint)
api.add_namespace(listrestaurantapi_blueprint)

api.add_namespace(post_dish_details_api_blueprint)
api.add_namespace(get_dish_details_api_blueprint)
api.add_namespace(remove_dish_api_blueprint)
api.add_namespace(list_dishes_api_blueprint)
api.add_namespace(update_dish_details_api_blueprint)
api.add_namespace(dish_inventory_api_blueprint)

api.add_namespace(post_dish_basket_api_blueprint)
api.add_namespace(remove_dish_basket_api_blueprint)
api.add_namespace(get_basket_api_blueprint)

api.add_namespace(post_order_details_api_blueprint)
api.add_namespace(get_order_details_api_blueprint)
api.add_namespace(remove_order_details_api_blueprint)
api.add_namespace(get_orders_seller_api_blueprint)

api.add_namespace(post_review_api_blueprint)
api.add_namespace(get_review_api_blueprint)
api.add_namespace(get_review_customer_blueprint)


api.add_namespace(post_rating_api_blueprint)
api.add_namespace(get_rating_api_blueprint)


api.add_namespace(post_favorite_api_blueprint)
api.add_namespace(get_favorite_api_blueprint)
api.add_namespace(remove_favorite_api_blueprint)


api.add_namespace(sendotp_blueprint)
api.add_namespace(veirfyotp_blueprint)
api.add_namespace(reset_password_blueprint)


#######################
# api.add_namespace(signupApi_blueprint)