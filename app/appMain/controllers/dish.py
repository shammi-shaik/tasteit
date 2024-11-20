import os
from crypt import methods
from sys import exception

from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.dialects.oracle.dictionary import all_synonyms
from werkzeug.utils import secure_filename

from app.appMain import db
from flask import jsonify,request
from flask_restx import Resource
import uuid

from app.appMain.controllers import restaurant
from app.appMain.models.restaurant import Restaurant
from app.appMain.models.dish import Dish
from app.appMain.dto.dish import DishDto

post_dish_details_api_blueprint = DishDto.post_dish_details
get_dish_details_api_blueprint = DishDto.get_dish_details
remove_dish_api_blueprint = DishDto.remove_dish
list_dishes_api_blueprint = DishDto.list_dishes
dish_inventory_api_blueprint = DishDto.dish_inventory
update_dish_details_api_blueprint = DishDto.update_dish



UPLOAD_FOLDER = '/home/ytp/Taste_it/src/assets/dish_images'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg' ,'webp','avif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# post_dish_details
@post_dish_details_api_blueprint.route('', methods=['POST'])
class post_dish_details(Resource):
    @jwt_required()
    def post(self):
        data = request.form
        print(request.files)

        # Check if file is part of the request
        if 'file' not in request.files:
            return {'message': 'Image file required for restaurant registration'}, 400

        file = request.files['file']
        if file.filename == '':
            return {'message': 'No file selected'}, 400

        if not allowed_file(file.filename):
            return {'message': 'File type not allowed'}, 400

        # Secure and save the file
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        try:
            file.save(file_path)
        except Exception as e:
            return {'message': f'Error saving file: {str(e)}'}, 500

        ######################################
        user_id = get_jwt_identity()

        # Fetch the restaurant_name by its user_id
        restaurant = Restaurant.query.filter_by(user_id=user_id).first()

        if not restaurant:
            return {'message': 'Restaurant not found for this user'}, 404
        db.session.refresh(restaurant)
        # Check if the restaurant's status is "Approved"
        if restaurant.status.status_name != "Approved":
            return {'message': 'Restaurant is not approved by the admin; cannot add dish'}, 403

        # Use the restaurant_name dynamically fetched from the logged-in user's restaurant
        restaurant_name = restaurant.restaurant_name

        # Check if the form data's restaurant name matches the logged-in user's restaurant
        if 'restaurant_name' in data and data['restaurant_name'] != restaurant_name:
            return {'message': 'Restaurant name provided does not match the user\'s associated restaurant'}, 400

        # Check if the dish already exists for this restaurant
        dish = Dish.query.filter_by(dish_name=data['dish_name'], restaurant_id=restaurant.restaurant_id).first()

        if dish:
            return {'message': 'Dish already exists'}, 400

        try:
            # Create a new dish
            new_dish = Dish(
                dish_id= uuid.uuid4(),
                restaurant_id=restaurant.restaurant_id,
                dish_name=data['dish_name'],
                dish_description=data['dish_description'],
                dish_price=data['dish_price'],
                inventory=data['inventory'],
                available=bool(data['available']),
                dish_image_url=filename,
                dish_type=data.get('dish_type', 'veg')
            )

            db.session.add(new_dish)
            db.session.commit()

            return {
                "message": "Dish added successfully",
                "restaurant_id": str(restaurant.restaurant_id),
                "dish_id": str(new_dish.dish_id)
            }, 201

        except Exception as e:
            db.session.rollback()
            return {
                "message": "Failed to add dish",
                "error" : str(e)
            }, 400

# get_dish_details
@get_dish_details_api_blueprint.route('' , methods=['GET'])
class get_dish_details(Resource):
    def get(self):
        # data = request.get_json()

        try:

            dish_id = request.args.get('dish_id')
            print(1)

            if not dish_id:
                return {"message": "Missing dish id"}, 400

            dish = Dish.query.filter_by(dish_id = dish_id).first()
            print(2)
            if not dish:
                print(3)
                return  {"message" : "Dish not fount"}, 404
            # return dish details
            return {
                'dish_id' : str(dish.dish_id),
                'restaurant_id' : str(dish.restaurant_id),
                'dish_name' : dish.dish_name,
                'dish_description' : dish.dish_description,
                'dish_price' : str(dish.dish_price),
                'inventory' : dish.inventory,
                'available' : dish.available,
                'dish_image_url': dish.dish_image_url,
                'dish_type': dish.dish_type  # Add type field
            } , 200

        except Exception as e:
            return {
                "message" : "Failed to retrieve dish details",
                "error" : str(e)
            } , 500

# Delete dish
@remove_dish_api_blueprint.route('', methods=['DELETE'])
class RemoveDish(Resource):
    def delete(self):
        data = request.get_json()
        try:
            # Ensure dish_id is in the request body
            if not data or 'dish_id' not in data:
                return {"message": "Missing or invalid request payload. 'dish_id' is required."}, 400

            # Fetch the dish by its dish_id
            dish = Dish.query.filter_by(dish_id=data['dish_id']).first()

            if not dish:
                return {'message': 'Dish not found'}, 404

            # Delete the dish from the restaurant
            db.session.delete(dish)
            db.session.commit()

            return {
                'message': 'Dish removed successfully!',
                'dish_name': dish.dish_name,
                # 'restaurant_id': dish.restaurant.restaurant_id  # Assuming a relationship exists
            }, 200

        except Exception as e:
            # Rollback the session in case of an error
            db.session.rollback()
            return {
                'message': 'Failed to remove dish from restaurant',
                'error': str(e)
            }, 500

#list of Restaurants
@list_dishes_api_blueprint.route('/dishes', methods=['GET'])
class list_dishes(Resource):
    def get(self):
        try:
            restaurant_id = request.args.get('restaurant_id')
            if restaurant_id:
                restaurant = Restaurant.query.filter_by(restaurant_id=uuid.UUID(restaurant_id)).first()
                if not restaurant:
                    return {'message': 'Restaurant not found'}, 404

                dishes = Dish.query.filter_by(restaurant_id=uuid.UUID(restaurant_id)).all()
            else:
                # Fetch all dishes if no restaurant_id is provided
                dishes = Dish.query.all()

            if not dishes:
                return {'message': 'No dishes found'}, 404

            # Create a list of dish details
            dish_list = [{
                'dish_id': str(dish.dish_id),
                'restaurant_id': str(dish.restaurant_id),
                'dish_name': dish.dish_name,
                'dish_description': dish.dish_description,
                'dish_price': str(dish.dish_price),
                'inventory': str(dish.inventory),
                'is_empty': dish.inventory==0,
                'dish_image_url': dish.dish_image_url,
                'dish_type':dish.dish_type,
                'restaurant_name': restaurant.restaurant_name if restaurant_id else None
                # Add restaurant name if specific restaurant is queried

            } for dish in dishes]

            # Return the list of dishes
            return {'dishes': dish_list}, 200

        except Exception as e:
            return {'message': 'Failed to retrieve dishes',
                    "error": str(e)}, 500

# update_dish_details
@update_dish_details_api_blueprint.route('', methods=['PUT'])
class update_dish_details(Resource):
    @jwt_required()
    def put(self):
        user_id = get_jwt_identity()

        # Fetch the restaurant linked to the logged-in user
        restaurant = Restaurant.query.filter_by(user_id=user_id).first()

        if not restaurant:
            return {'message': 'Restaurant not found for this user'}, 404

        # Get the dish data from the request body
        data = request.get_json()
        dish_data= data.get('dishData')
        dish_id=data.get('dish_id')

        # Find the dish to update by its ID and ensure it belongs to this restaurant
        dish = Dish.query.filter_by(dish_id=dish_id, restaurant_id=restaurant.restaurant_id).first()

        if not dish:
            return {'message': 'Dish not found or does not belong to this restaurant'}, 404

        try:
            # Update the dish details if provided in the request
            dish.dish_name = dish_data.get('dish_name', dish.dish_name)
            dish.dish_description = dish_data.get('dish_description', dish.dish_description)
            dish.dish_price = dish_data.get('dish_price', dish.dish_price)
            dish.inventory = dish_data.get('inventory', dish.inventory)
            dish.available = dish_data.get('available', dish.available)
            dish.dish_image_url = dish_data.get('dish_image_url', dish.dish_image_url)
            dish.dish_type = dish_data.get('dish_type', dish.dish_type)

            db.session.commit()

            return {
                "message": "Dish updated successfully",
                "restaurant_id": str(restaurant.restaurant_id),
                "dish_id": str(dish.dish_id)
            }, 200

        except Exception as e:
            db.session.rollback()
            return {
                "message": "Failed to update dish",
                "error": str(e)
            }, 400


# inventory of dishes
@dish_inventory_api_blueprint.route('', methods=['PUT'])
class dish_inventory(Resource):
    def put(self):
        data = request.get_json()
        try:
            # Ensure 'dish_id' and 'inventory' are in the request payload
            if not data or 'dish_id' not in data or 'inventory' not in data:
                return {"message": "Missing or invalid request payload. 'dish_id' and 'inventory' are required."}, 400

            # Fetch the dish by its dish_id
            dish = Dish.query.filter_by(dish_id=data['dish_id']).first()

            if not dish:
                return {'message': 'Dish not found'}, 404

            # Ensure the inventory is not negative after update
            if data['inventory'] < 0:
                return {'message': 'Invalid quantity. Inventory cannot be negative.'}, 400

            if dish.inventory < data['inventory']:
                return {'message': 'Not enough inventory available.'}, 400

            # Update the inventory
            dish.inventory -= data['inventory']
            print(dish.inventory)
            db.session.commit()

            return {
                'message': 'Dish inventory updated successfully!',
                'dish_name': dish.dish_name,
                'dish_id': str(dish.dish_id),
                'inventory': dish.inventory,

            }, 200

        except Exception as e:
            db.session.rollback()
            return {
                'message': 'Failed to update dish inventory',
                'error': str(e)
            }, 500
