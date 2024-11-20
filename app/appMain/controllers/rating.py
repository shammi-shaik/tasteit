from flask_restx import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.appMain import db
from app.appMain.dto.rating import RatingDto
from app.appMain.models.orders import Orders
from app.appMain.models.restaurant import Restaurant
from app.appMain.models.review import Review
from app.appMain.models.users import Users
from app.appMain.models.rating import Rating
import uuid

post_rating_api_blueprint = RatingDto.post_rating_api
get_rating_api_blueprint = RatingDto.get_rating_api


#post rating to the restaurant
@post_rating_api_blueprint.route('', methods=['POST'])
class PostRating(Resource):
    @jwt_required()  # Protect this route with JWT
    def post(self):
        try:
            # Get the user_id from the JWT token
            user_id = get_jwt_identity()

            # Fetch the user by user_id
            user = Users.query.filter_by(user_id=user_id).first()
            if not user:
                return {"message": "User not found"}, 404

            # Extract data from the request body
            data = request.get_json()
            order_id = data.get('order_id')
            rating_value = data.get('rating_value')
            restaurant_id = data.get('restaurant_id')
            print(restaurant_id)
            # Validate input data
            if not order_id or not rating_value:
                return {"message": " order_Id name and rating are required."}, 400

            # Fetch the restaurant by name
            order = Orders.query.filter_by(order_id=order_id).first()
            if not order:
                return {"message": f"order  not found"}, 404

            # Check if the user has already rated this restaurant
            existing_rating = Rating.query.filter_by(user_id=user_id, order_id=order.order_id).first()
            if existing_rating:
                return {"message": "You have already rated this restaurant"}, 400

            # Create a new rating entry
            new_rating = Rating(
                rating_id=str(uuid.uuid4()) ,
                rating_value=rating_value,
                user_id=user.user_id,
                order_id=order.order_id,
                restaurant_id=restaurant_id
            )

            # Add the rating to the database
            db.session.add(new_rating)
            db.session.commit()

            return "Rating posted successfully",201

        except Exception as e:
            db.session.rollback()
            print(f"Error while posting the rating: {str(e)}")
            return {
                "message": "Failed to post the rating",
                "error": str(e)
            }, 500


#GET RATING FOR RESTAURANT OF USER
@get_rating_api_blueprint.route('', methods=['GET'])
class GetRestaurantRating(Resource):
    @jwt_required()  # Protect this route with JWT
    def get(self):
        try:
            # Get the user_id from the JWT token
            user_id = get_jwt_identity()

            # Fetch ratings for the user
            seller = Restaurant.query.filter_by(user_id=user_id).first()

            if not seller:
                return {"message": "User is not a seller or does not own a restaurant"}, 404

            # Assuming that the User table or Seller table has a restaurant_id field
            restaurant_id = seller.restaurant_id

            if not restaurant_id:
                return {"message": "No restaurant associated with this seller"}, 404

            # Step 3: Fetch all reviews for the seller's restaurant
            ratings = Rating.query.filter_by(restaurant_id=restaurant_id).all()

            if not ratings:
                return {"message": "No reviews found for this restaurant"}, 404

            # Calculate the average rating
            total_ratings = len(ratings)
            average_rating = sum(rating.rating_value for rating in ratings) / total_ratings if total_ratings > 0 else 0

            # Prepare the response with rating data
            rating_data = [{
                'rating_id': str(rating.rating_id),
                'rating_value': rating.rating_value
            } for rating in ratings]

            return {
                "message": "Ratings fetched successfully",
                "ratings": rating_data,
                "average_rating": round(average_rating, 2),
                "total_ratings": total_ratings,
            }, 200

        except Exception as e:
            return {
                "message": "Failed to fetch ratings",
                "error": str(e)
            }, 500

