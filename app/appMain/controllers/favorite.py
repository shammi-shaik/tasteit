from crypt import methods

from flask import request, jsonify
from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.appMain import db
from app.appMain.dto.favorite import FavoriteDto
from app.appMain.models.favorite import Favorite
from app.appMain.models.restaurant import Restaurant
import uuid
from flask_cors import cross_origin
from app.appMain.models.users import Users

post_favorite_api_blueprint = FavoriteDto.post_favorite_api
get_favorite_api_blueprint = FavoriteDto.get_favorite_api
remove_favorite_api_blueprint = FavoriteDto.remove_favorite_api

#to post favorite restaurant to table
@post_favorite_api_blueprint.route('', methods= ['POST'])
class PostFavorite(Resource):
    @jwt_required()  # Protect this route with JWT
    def post(self):
        try:
            # Get the user_id from the JWT token
            user_id = get_jwt_identity()

            # Extract data from the request body
            data = request.get_json()
            restaurant_id = data.get('restaurant_id')

            # Validate input data
            if not restaurant_id:
                return {"message": "Invalid data. Restaurant id is required."}, 400

            # Fetch the restaurant by name
            restaurant = Restaurant.query.filter_by(restaurant_id=restaurant_id).first()
            if not restaurant:
                return {"message": f"Restaurant '{restaurant_id}' not found"}, 404

            # Check if the user has already added this restaurant to their favorites
            existing_favorite = Favorite.query.filter_by(user_id=user_id, restaurant_id=restaurant.restaurant_id).first()
            if existing_favorite:
                return {"message": "This restaurant is already in your favorites"}, 409

            # Create a new favorite entry
            new_favorite = Favorite(
                favorite_id=uuid.uuid4(),
                user_id=user_id,
                restaurant_id=restaurant.restaurant_id
            )

            # Add the favorite to the database
            db.session.add(new_favorite)
            db.session.commit()

            return {
                "message": "Favorite restaurant added successfully",
                "favorite": {
                    "favorite_id": str(new_favorite.favorite_id),
                    "user_id": str(new_favorite.user_id),
                    "restaurant_id": str(new_favorite.restaurant_id),
                    "restaurant_name": restaurant.restaurant_name
                }
            }, 201

        except Exception as e:
            db.session.rollback()
            return {
                "message": "Failed to add favorite restaurant",
                "error": str(e)
            }, 500


#to get favorite restaurant from table
@get_favorite_api_blueprint.route('',methods= ['GET'])
class GetFavorite(Resource):
    @jwt_required()  # Protect this route with JWT
    def get(self):
        try:
            # Get the user_id from the JWT token
            user_id = get_jwt_identity()

            # Fetch all favorite restaurants for the user
            favorites = Favorite.query.filter_by(user_id=user_id).all()

            if not favorites:
                return {"message": "No favorite restaurants found for this user"}, 404

            # Prepare the list of favorite restaurants
            result = [
                {
                    "favorite_id": str(favorite.favorite_id),
                    "user_id": str(favorite.user_id),
                    "restaurant_id": str(favorite.restaurant_id),
                    "restaurant_name": Restaurant.query.get(favorite.restaurant_id).restaurant_name,
                    "restaurant_image_url": Restaurant.query.get(favorite.restaurant_id).restaurant_image_url
                }
                for favorite in favorites
            ]

            return result

        except Exception as e:
            return {
                "message": "Failed to retrieve favorite restaurants",
                "error": str(e)
            }, 500


# Delete favorite restaurant
@remove_favorite_api_blueprint.route('', methods=['DELETE'])
class DeleteFavRestaurant(Resource):
    @jwt_required()
    def delete(self):
        data = request.args
        try:
            # Get the user_id from the JWT token
            user_id = get_jwt_identity()

            user = Users.query.filter_by(user_id=user_id).first()
            if not user:
                return {"message": "User not found"}, 404

            # Check for the favorite entry with the specified restaurant_id and user_id
            favorite = Favorite.query.filter_by(user_id=user_id, restaurant_id=data['restaurant_id']).first()

            if not favorite:
                return {'message': 'Favorite restaurant not found'}, 404

            # Fetch the restaurant by its restaurant_name
            restaurant = Restaurant.query.filter_by(restaurant_id = data['restaurant_id']).first()
            if not restaurant:
                return {'message': 'Restaurant not found'}, 404

            # Delete the restaurant from the database
            db.session.delete(favorite)
            db.session.commit()

            return {
                'message': 'Restaurant deleted successfully!',
                'restaurant_name': restaurant.restaurant_name
            }, 200

        except Exception as e:
            # Rollback the session in case of an error
            db.session.rollback()
            return {
                'message': 'Failed to delete restaurant',
                'error': str(e)
            }, 500
