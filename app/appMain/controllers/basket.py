from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request

import app
from app.appMain import db
from app.appMain.models.users import Users
from app.appMain.models.dish import Dish
from app.appMain.models.basket import Basket
from flask import Flask
from flask_cors import CORS
from flask_restx import Resource
from flask import request, jsonify
from app.appMain.dto.basket import BasketDto


post_dish_basket_api_blueprint = BasketDto.post_dish_basket
get_basket_api_blueprint = BasketDto.get_dish_basket
remove_dish_basket_api_blueprint = BasketDto.remove_dish_basket

#post dish details into the basket
@post_dish_basket_api_blueprint.route('', methods=['POST'])
class GetDetails(Resource):
    @jwt_required()  # Protect this route with JWTk
    def post(self):
        try:

            data = request.get_json()
            # Check if 'dish_id' is provided
            if not data or 'dish_id' not in data:
                return {"message": "Missing or invalid request payload. 'dish_id' is required."}, 400

            dish_id = data.get('dish_id')

            # Fetch the dish by id
            dish = Dish.query.filter_by(dish_id=dish_id).first()
            if not dish:
                return {"message": "Dish not found"}, 404

            # Check if the dish is available
            if not dish.available or dish.inventory <= 0:
                return {"message": "Dish is out of stock and cannot be added to the basket"}, 400

            # print(verify_jwt_in_request())
            user_id = get_jwt_identity()
            user = Users.query.filter_by(user_id=user_id).first()
            if not user:
                return {"message": "User not found"}, 404

            # Check existing basket for the user
            existing_basket = Basket.query.filter_by(user_id=user_id).first()

            if existing_basket:
                # Check restaurant ID
                existing_dish = Dish.query.filter_by(dish_id=existing_basket.dish_id).first()
                if existing_dish.restaurant_id != dish.restaurant_id:
                    return {
                        "message": "Dishes from different restaurants cannot be added to the basket"
                    }, 400
            basket_items = Basket.query.filter_by(user_id=user_id, dish_id=dish_id).first()
            if basket_items:
                basket_items.quantity = basket_items.quantity+1
                basket_items.price = basket_items.price+float(dish.dish_price)
                db.session.commit()
                return {
                    'message': 'Dish added to basket successfully',
                    'basket_id': str(basket_items.basket_id),
                    'dish_id': str(dish.dish_id),
                    'user_id': str(user.user_id)
                }, 200

            # Add the dish to the basket
            basket = Basket(dish_id=dish.dish_id, user_id=user_id,price=float(dish.dish_price))  # Make sure to link to the user
            db.session.add(basket)
            db.session.commit()

            return {
                'message': 'Dish added to basket successfully',
                'basket_id': str(basket.basket_id),
                'dish_id': str(dish.dish_id),
                'user_id': str(user.user_id)
            }, 200

        except Exception as e:
            print(f"Error: {e}")
            return {
                "message": "Failed to add dish details to Basket",
                "error": str(e)
            }, 500


# Decrement dish quantity in the basket
@post_dish_basket_api_blueprint.route('/decrement', methods=['POST'])
class DecrementDishQuantity(Resource):
    @jwt_required()  # Protect this route with JWT
    def post(self):
        try:
            data = request.get_json()
            # Check if 'dish_id' is provided
            if not data or 'dish_id' not in data:
                return {"message": "Missing or invalid request payload. 'dish_id' is required."}, 400

            dish_id = data.get('dish_id')

            # Verify user identity and fetch the user
            user_id = get_jwt_identity()
            user = Users.query.filter_by(user_id=user_id).first()
            if not user:
                return {"message": "User not found"}, 404

            # Check for existing basket item for the dish
            basket_item = Basket.query.filter_by(user_id=user_id, dish_id=dish_id).first()
            if not basket_item:
                return {"message": "Dish not found in basket"}, 404

            # Decrement quantity or remove item if quantity becomes zero
            if basket_item.quantity > 1:
                basket_item.quantity -= 1
                basket_item.price -= float(basket_item.dish.dish_price)  # Decrement price based on dish price
                db.session.commit()
                return {
                    'message': 'Dish quantity decremented successfully',
                    'basket_id': str(basket_item.basket_id),
                    'dish_id': str(basket_item.dish_id),
                    'user_id': str(user.user_id),
                    'quantity': basket_item.quantity
                }, 200
            else:
                # Remove the item from the basket if quantity reaches zero
                db.session.delete(basket_item)
                db.session.commit()
                return {
                    'message': 'Dish removed from basket',
                    'dish_id': str(basket_item.dish_id),
                    'user_id': str(user.user_id)
                }, 200

        except Exception as e:
            print(f"Error: {e}")
            return {
                "message": "Failed to decrement dish quantity in basket",
                "error": str(e)
            }, 500


#To get details of the current basket items
@get_basket_api_blueprint.route('', methods=['GET'])
class GetDishesFromBasket(Resource):
    @jwt_required()  # Protect this route with JWT
    def get(self):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({'message': 'Missing Authorization Header'}), 401
            user_id = get_jwt_identity()


            # Fetch the user's basket entries
            basket_entries = Basket.query.filter_by(user_id=user_id).all()

            if not basket_entries:
                return {'message': 'No dishes found in the basket'}, 404

            # Prepare the response with dish details
            dishes_in_basket = []
            for entry in basket_entries:
                dish = Dish.query.filter_by(dish_id=entry.dish_id).first()
                if dish:
                    dishes_in_basket.append({
                        'basket_id': str(entry.basket_id),
                        'dish_id': str(dish.dish_id),
                        'dish_name': dish.dish_name,
                        'quantity': entry.quantity,
                        'dish_image_url': dish.dish_image_url
                    })

            return {
                'message': 'Dishes retrieved successfully',
                'dishes': dishes_in_basket
            }, 200

        except Exception as e:
            print(f"Error: {e}")
            return {
                "message": "Failed to retrieve dishes from the basket",
                "error": str(e)
            }, 500

#Remove dish from Basket
@remove_dish_basket_api_blueprint.route('', methods=['DELETE'])
class RemoveDishFromBasket(Resource):
    def delete(self):
        data = request.get_json()
        try:
            # Fetch the dish_id by its dish_name from the Dish table
            dish = Dish.query.filter_by(dish_id=data['dish_id']).first()

            if not dish:
                return {'message': 'Dish not found'}, 404

            # Fetch all basket entries matching the dish_id
            basket_entries = Basket.query.filter_by(dish_id=dish.dish_id)

            if not basket_entries:
                return {'message': 'Dish not found in any baskets'}, 404

            # Remove all basket entries matching the dish_id
            for entry in basket_entries:
                db.session.delete(entry)

            db.session.commit()

            return {
                'message': 'Dish removed from  basket successfully!',
                'dish_id': data['dish_id']
            }, 200

        except Exception as e:
            # Rollback the session in case of an error
            db.session.rollback()
            return {
                'message': 'Failed to remove dish from baskets',
                'error': str(e)
            }, 500
