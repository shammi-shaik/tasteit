import os
from calendar import firstweekday
from crypt import methods
from pyexpat.errors import messages

from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restx import Resource
from flask import request , jsonify
from flask_restx.inputs import email
from sqlalchemy.testing.suite.test_reflection import users
from werkzeug.utils import secure_filename

from app.appMain import db
from app.appMain.models import status
from app.appMain.models.restaurant import Restaurant

from app.appMain.models.status import Status
import uuid
from app.appMain.dto.restaurant import RestaurantDto
from app.appMain.models.users import Users

postrestaurantapi_blueprint = RestaurantDto.postrestaurantapi
updaterestaurantapi_blueprint = RestaurantDto.updaterestaurantapi
getrestaurantapi_blueprint = RestaurantDto.getrestaurantapi
deleterestaurantapi_blueprint = RestaurantDto.deleterestaurantapi
listrestaurantapi_blueprint = RestaurantDto.listrestaurantapi



UPLOAD_FOLDER = '/home/ytp/Taste_it/src/assets/restaurant_images'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg' ,'webp','avif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# postrestaurant_details
@postrestaurantapi_blueprint.route('',methods=['POST'])
class Postrestaurant(Resource):
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
        ############################################
        restaurant = Restaurant.query.filter_by(restaurant_name = data['restaurant_name']).first()

        if restaurant:
            return {'message': 'Restaurant already exist'},400

        status = Status.query.filter_by(status_name='Pending').first()

        if not status:
            return {"message": "invalid status else than 'Pending' provided"},400
        email=data['email']
        user = Users.query.filter_by(email= email).first()
        if not user:
            return {"message": "user not found"},400
        try:
            new_restaurant = Restaurant(
                restaurant_id=str(uuid.uuid4()),
                restaurant_name=data['restaurant_name'],
                restaurant_address=data['restaurant_address'],
                status_id = status.status_id,
                restaurant_image_url=filename, # Accept image URL
                user_id =user.user_id
            )

            db.session.add(new_restaurant)
            db.session.commit()

            return {
                "message": "Restaurant added successfully",
                "restaurant_id": str(new_restaurant.restaurant_id)
            },201
        except Exception as e:
            db.session.rollback()
            return {
                'message': 'Failed to add Restaurant ',
                'error':str(e)
            }, 400


# update restaurant details
@updaterestaurantapi_blueprint.route('', methods=['PUT'])
class updaterestaurant(Resource):

    def put(self):
        data = request.get_json()

        try:
            # Fetch the restaurant by its restaurant_name
            restaurant = Restaurant.query.filter_by(restaurant_id = data['restaurant_id']).first()

            if not restaurant:
                return {'message': 'Restaurant not found'}, 404

            status = Status.query.filter_by(status_name=data['status_name']).first()
            # print(status)
            exist_status = Restaurant.query.filter_by(status_id=status.status_id).first()
            if restaurant.status_id == status.status_id:
                return {'message':'already same status'}
            # Update the restaurant's details
            if 'restaurant_name' in data:
                restaurant.restaurant_name = data['restaurant_name']
            if 'restaurant_address' in data:
                restaurant.restaurant_address = data['restaurant_address']
            if 'status_name' in data:
                restaurant.status_id = status.status_id
            if 'restaurant_image_url' in data:
                restaurant.restaurant_image_url = data['restaurant_image_url']  # Update image URL

            # Commit the changes to the database
            db.session.commit()

            return {
                'message': 'Restaurant updated successfully!',
                'restaurant_id': str(restaurant.restaurant_id)
            }, 200

        except Exception as e:
            # Rollback the session in case of an error
            db.session.rollback()
            return jsonify({
                'message': 'Failed to update restaurant'

            }), 400

# Get restaurant details
@getrestaurantapi_blueprint.route('', methods=['GET'])
class getrestaurant(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id=get_jwt_identity()
            # Fetch the restaurant by its user_id
            restaurant = Restaurant.query.filter_by(user_id = user_id).first()

            if not restaurant:
                return { 'message': 'Restaurant not found'  }, 404
            dishes = [{
                'dish_id': str(dish.dish_id),
                'restaurant_id': str(dish.restaurant_id),
                'dish_name': dish.dish_name,
                'dish_type':dish.dish_type,
                'dish_description': dish.dish_description,
                'dish_price': str(dish.dish_price),
                'inventory': str(dish.inventory),
                'is_empty': dish.inventory <= 10,
                'available': dish.available,
                'dish_image_url': dish.dish_image_url,
                'restaurant_name': restaurant.restaurant_name,
                'restaurant_address': restaurant.restaurant_address,
                'status_id': str(restaurant.status_id),
                'restaurant_image_url': restaurant.restaurant_image_url,
            } for dish in restaurant.dishes]

            # Return the restaurant details
            return {
                'dishes':dishes
            } , 200

        except Exception as e:
            # Handle any unexpected errors
            return {
                'message': 'Failed to retrieve restaurant details' }, 500

# Delete restaurant
@deleterestaurantapi_blueprint.route('', methods=['DELETE'])
class deleterestaurant(Resource):
    @jwt_required()
    def delete(self):
        user_id = get_jwt_identity()  # Get the current user ID from JWT
        user = Users.query.filter_by(user_id=user_id).first()

        # Check if user is an admin
        if not user :
            return {'message': 'Unauthorized. Admin privileges required.'}, 403
        data = request.get_json()
        try:
            # Fetch the restaurant by its restaurant_name
            restaurant = Restaurant.query.filter_by(restaurant_id = data['restaurant_id']).first()

            if not restaurant:
                return {'message': 'Restaurant not found'}, 404

            # Delete the restaurant from the database
            db.session.delete(restaurant)
            db.session.commit()

            return {
                'message': 'Restaurant deleted successfully!',
                'restaurant_name': restaurant.restaurant_name
            }, 200

        except Exception as e:
            # Rollback the session in case of an error
            db.session.rollback()
            print(f"Error deleting restaurant: {e}")

            return ({
                'message': 'Failed to delete restaurant'
            }), 500

# list of Restaurants
@listrestaurantapi_blueprint.route('', methods=['GET'])
class listrestaurants(Resource):
    def get(self):
        try:
            # Fetch all restaurants from the database
            restaurants = Restaurant.query.all()
            if not restaurants:
                return { 'message': 'No restaurants found' }, 404
            # Create a list of restaurant details
            restaurant_list = [{
                'restaurant_id': str(restaurant.restaurant_id),
                'restaurant_name': restaurant.restaurant_name,
                'restaurant_address': restaurant.restaurant_address,
                'status_id': str(restaurant.status_id),
                'restaurant_image_url': restaurant.restaurant_image_url, # Include image URL
                'status_name':restaurant.status.status_name
            } for restaurant in restaurants]

            # Return the list of restaurants
            return { 'restaurants': restaurant_list }, 200

        except Exception as e:
            # Handle any unexpected errors
            return { 'message': 'Failed to retrieve restaurants'}, 500


