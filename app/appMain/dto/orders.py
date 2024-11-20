from flask_restx import Namespace

class OrderDto:
    post_order_details = Namespace('post_order_details' , description='API to post order details ')
    get_order_details = Namespace('get_order_details', description='API to get order details ')
    remove_order_details = Namespace('remove_order_details' , description='API to remove order details ')
    get_sellers_orders= Namespace('get_sellers_orders' ,description='API to get seller order details ')