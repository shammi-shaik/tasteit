from sqlalchemy.testing.pickleable import Order
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.appMain import db
from flask import jsonify, Request, request
from flask_restx import Resource
from app.appMain.dto.orders import OrderDto
from app.appMain.models.basket import Basket
from app.appMain.models.order_items import OrderItems
from app.appMain.models.restaurant import Restaurant
from app.appMain.models.users import Users
from app.appMain.models.dish import Dish
from app.appMain.models.orders import Orders


post_order_details_api_blueprint = OrderDto.post_order_details
get_order_details_api_blueprint = OrderDto.get_order_details
remove_order_details_api_blueprint = OrderDto.remove_order_details
get_orders_seller_api_blueprint = OrderDto.get_sellers_orders

# post order details to the table
@post_order_details_api_blueprint.route('', methods=['POST'])
class AddOrder(Resource):
    @jwt_required()
    def post(self):
        try:
            # Get the current user based on JWT token
            user_id = get_jwt_identity()

            user = Users.query.filter_by(user_id=user_id).first()
            if not user:
                return {"message": "User not found"}, 404

            # Fetch all items from the user's basket
            basket_items = Basket.query.filter_by(user_id=user.user_id).all()
            if not basket_items:
                return {"message": "No dishes found in the basket"}, 404
            quantity = 0
            price = 0
            for item in basket_items:
                quantity = quantity+item.quantity
                price = price + item.price

            new_order = Orders(
                user_id = user_id,
                quantity = quantity,
                total_price = price
            )

            db.session.add(new_order)
            db.session.commit()

            for item in basket_items:
                new_order_item = OrderItems(
                    order_id = new_order.order_id,
                    dish_id = item.dish_id,
                    quantity = item.quantity,
                    total_price = item.price
                )
                db.session.add(new_order_item)
                db.session.commit()

            for item in basket_items:
                db.session.delete(item)  # Safely remove the basket entries

            db.session.commit()

            return {
                'message': 'Order placed successfully',
                'orders': new_order.to_dict(),
                'total_price': float(new_order.total_price)
            }, 201




            # total_price = 0
            # orders_data = []
            #
            # for item in basket_items:
            #     # Fetch the dish associated with each basket item
            #     dish = Dish.query.filter_by(dish_id=item.dish_id).first()
            #     if not dish:
            #         return {"message": f"Dish with ID {item.dish_id} not found"}, 404
            #
            #     if not dish.available or dish.inventory < 1:
            #         return {"message": f"Dish '{dish.dish_name}' is out of stock"}, 400
            #
            #     # Default quantity to 1 if not present
            #     quantity = getattr(item, 'quantity', 1)
            #
            #     # Create a new order and associate the basket_id
            #     order = Orders(
            #         user_id=user.user_id,
            #         dish_id=dish.dish_id,
            #         quantity=quantity,  # Default quantity used here
            #         total_price=float(dish.dish_price) * quantity
            #     )
            #
            #     db.session.add(order)
            #     total_price += dish.dish_price * quantity
            #
            #
            #
            #     # Prepare data for the response
            #     orders_data.append({
            #         'order_id': str(order.order_id),
            #         'dish_id': str(order.dish_id),
            #         'quantity': order.quantity,
            #         'total_price': float(order.total_price)
            #     })
            #
            # # Commit the orders and dish inventory update first
            # db.session.commit()
            #
            # # Instead of deleting the basket, reset or clear basket items


        except Exception as e:
            db.session.rollback()
            return {
                "message": "Failed to place the order",
                "error": str(e)
            }, 500



#get order details
@get_order_details_api_blueprint.route('', methods=['GET'])
class GetOrders(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            orders=Orders.query.filter_by(user_id=user_id).all()
            if not orders:
                return {"message": "No orders found"}, 404
            response=[]
            for order in orders:
                order_data={'order_id':str(order.order_id),
                            'order_quantity':str(order.quantity),
                            'order_price':str(order.total_price),
                            'order_time':str(order.order_time),
                            'is_reviewed':len(order.review)>0,
                            }
                if len(order.review)>0:
                    review_data={
                        'review_description':order.review[0].review_description,
                        'like':order.review[0].likes,
                        'rating_value':order.rating[0].rating_value
                    }
                    order_data['review_data']=review_data
                else:
                    order_data['review_data']=None

                dishes=[]
                for order_item in order.order_items:
                    dishes_data={"dish_name":order_item.dish.dish_name,"dish_quantity":order_item.quantity}
                    order_data['restaurant_id'] = str(order_item.dish.restaurant.restaurant_id)
                    order_data['restaurant_name']=order_item.dish.restaurant.restaurant_name
                    order_data['restaurant_address']=order_item.dish.restaurant.restaurant_address
                    order_data['restaurant_image_url']=order_item.dish.restaurant.restaurant_image_url
                    dishes.append(dishes_data)
                order_data['order_dishes']=dishes
                response.append(order_data)
                print(response)
            return {
                'message': 'Orders fetched successfully',
                'orders': response
            }, 200
        except Exception as e:
            return {
                "message": "Failed to fetch orders",
                "error": str(e)
            }, 500



#cancle order
@remove_order_details_api_blueprint.route('', methods=['DELETE'])
class DeleteOrder(Resource):
    @jwt_required()  # Protect this route with JWT
    def delete(self):
        try:
            # Get the user_id from the JWT token
            user_id = get_jwt_identity()

            # Fetch the user by user_id
            user = Users.query.filter_by(user_id=user_id).first()
            if not user:
                return {"message": "User not found"}, 404

            # Fetch all items in the user's basket
            basket_items = Basket.query.filter_by(user_id=user.user_id).all()
            if not basket_items:
                return {"message": "No items found in the basket"}, 404

            # Delete associated orders for each basket item
            for basket_item in basket_items:
                Orders.query.filter_by(basket_id=basket_item.basket_id).delete()
                db.session.commit()

            # Now delete the basket items themselves
            Basket.query.filter_by(user_id=user.user_id).delete()
            db.session.commit()

            return {
                "message": "order cancelled successfully"
            }, 200

        except Exception as e:
            db.session.rollback()
            return {
                "message": "Failed to delete basket items",
                "error": str(e)
            }, 500



@get_orders_seller_api_blueprint.route('', methods=['GET'])
class GetSellerRestaurantOrders(Resource):
    @jwt_required()  # Protect this route with JWT
    def get(self):
        try:
            # Step 1: Get the user_id from the JWT token
            user_id = get_jwt_identity()

            # Step 2: Verify the user is a seller with an associated restaurant
            restaurant = Restaurant.query.filter_by(user_id=user_id).first()
            if not restaurant:
                return {"message": "User is not a seller or does not own a restaurant"}, 403

            # Step 3: Fetch orders for the seller's restaurant
            orders = OrderItems.query.join(Dish, OrderItems.dish_id == Dish.dish_id) \
                .join(Restaurant, Restaurant.restaurant_id == Dish.restaurant_id) \
                .filter(Restaurant.user_id == user_id) \
                .all()

            if not orders:
                return {"message": "No orders found for this restaurant"}, 404

            # Step 4: Prepare the response
            order_data = [order.to_dict() for order in orders]

            return {
                "message": "Orders for the restaurant fetched successfully",
                "orders": order_data
            }, 200

        except Exception as e:
            return {
                "message": "Failed to fetch orders for the restaurant",
                "error": str(e)
            }, 500
