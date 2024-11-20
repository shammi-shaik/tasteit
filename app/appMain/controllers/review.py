from traceback import print_exc

from pycparser.ply.yacc import restart
from sqlalchemy.testing.pickleable import Order

from app.appMain import db
from flask import jsonify,request
from flask_restx import Resource
import uuid
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.appMain.dto.review import ReviewDto
from app.appMain.models.orders import Orders
from app.appMain.models.rating import Rating
from app.appMain.models.restaurant import Restaurant
from app.appMain.models.review import Review
from app.appMain.models.users import Users

post_review_api_blueprint = ReviewDto.post_review_api
get_review_api_blueprint = ReviewDto.get_review_api
get_review_customer_blueprint = ReviewDto.get_review_customer_api

#post review to restaurant
@post_review_api_blueprint.route('', methods=['POST'])
class PostReview(Resource):
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
            restaurant_id=data.get('restaurant_id')
            review_description = data.get('review_description')
            likes = data.get('likes', False)  # Treat likes as a boolean, default to False

            # Validate inputs
            if not order_id or not review_description:
                missing_fields = []
                if not order_id:
                    missing_fields.append('order_id')
                if not review_description:
                    missing_fields.append('order_id')
                return {"message": "Missing required fields", "fields": missing_fields}, 400

            # Fetch the restaurant details by name
            order = Orders.query.filter_by(order_id=order_id).first()
            if not order:
                return {"message": f"order not found"}, 404

            # Check if the user already reviewed this restaurant
            existing_review = Review.query.filter_by(user_id=user_id, order_id=order.order_id).first()
            if existing_review:
                return {"message": "You have already reviewed this restaurant"}, 400

            # Handle the likes logic: If likes is True, increment by 1, else 0
            like_count = 1 if likes else 0

            # Create a new review entry
            new_review = Review(
                # review_id=uuid.uuid4(),
                review_description=review_description,
                user_id=user.user_id,
                order_id=order.order_id,
                likes=like_count,
                restaurant_id=restaurant_id
            )

            # Add the review to the database
            db.session.add(new_review)
            db.session.commit()

            return {
                "message":"successfully  review added ",
                 "review_description": data['review_description'],
                "order_id":str(order.order_id),

            },201

        except Exception as e:
            db.session.rollback()
            print(f"Error: {str(e)}")  # Add more detailed logging
            return {
                "message": "Failed to post the review",
                "error": str(e)
            }, 500


# GET ALL REVIEWS FOR THE SELLER'S RESTAURANT
@get_review_api_blueprint.route('', methods=['GET'])
class GetSellerRestaurantReviews(Resource):
    @jwt_required()  # Protect this route with JWT
    def get(self):
        try:
            # Step 1: Get the user_id from the JWT token
            user_id = get_jwt_identity()

            # Step 2: Verify if the user is a seller and fetch their restaurant_id
            seller = Restaurant.query.filter_by(user_id=user_id).first()
            if not seller:
                return {"message": "User is not a seller or does not own a restaurant"}, 403

            # Assuming that the User table or Seller table has a restaurant_id field
            restaurant_id = seller.restaurant_id

            if not restaurant_id:
                return {"message": "No restaurant associated with this seller"}, 404

            # Step 3: Fetch all reviews for the seller's restaurant
            reviews = Review.query.filter_by(restaurant_id=restaurant_id).all()

            if not reviews:
                return {"message": "No reviews found for this restaurant"}, 404

            # Step 4: Fetch ratings for the restaurant (you can use Rating.query or similar)
            ratings = Rating.query.filter_by(restaurant_id=restaurant_id).all()

            # Create a dictionary for fast lookup of ratings by user_id
            # rating_dict = {rating.user_id: rating.rating_value for rating in ratings}

            total_likes = sum(review.likes for review in reviews)
            # print(Rating.query.filter_by(oder_id=reviews[0].order_id).first())
           # Step 4: Prepare the response with review data
            total_reviews_count = len(reviews)
            review_data = [{
                'review_id': str(review.review_id),
                'review_description': review.review_description,
                'user_id': str(review.user_id),
                'order_id': str(review.order_id),
                'likes': review.likes,
                'restaurant_id': str(review.restaurant_id),
                'user_name': review.user.user_name,
                'rating_value': (Rating.query.filter_by(order_id=review.order_id).first()).rating_value,
                "total_likes": total_likes
            } for review in reviews]

            return {
                "message": "Reviews for the restaurant fetched successfully",
                "total_reviews_count": total_reviews_count,
                "reviews": review_data,
                "total_likes": total_likes
            }, 200

        except Exception as e:
            return {
                "message": "Failed to fetch reviews for the restaurant",
                "error": str(e)
            }, 500


#GET REVIEW FOR RESTAURANT OF USER
@get_review_customer_blueprint.route('', methods=['GET'])
class GetRestaurantReviews(Resource):
    @jwt_required()  # Protect this route with JWT
    def get(self):
        try:
            # Get user_id from the JWT token
            user_id = get_jwt_identity()
            # Fetch reviews based on user_id
            reviews = Review.query.filter_by(user_id=user_id).all()

            if not reviews:
                return {"message": "No reviews found for this user"}, 404

            # Calculate the total number of reviews
            total_reviews_count = len(reviews)

            # Prepare the response with review data
            review_data = [{
                'review_id': str(review.review_id),
                'review_description': review.review_description,
                'user_id': str(review.user_id),
                'order_id': str(review.order_id),
                'likes': review.likes,
                'restaurant_id':str(review.restaurant_id)
                # 'restaurant_name': review.order,# Get restaurant name
                # 'restaurant_image_url': Restaurant.query.get(review.restaurant_id).restaurant_image_url  # Get restaurant image
            } for review in reviews]

            return {
                "message": "Reviews fetched successfully",
                "total_reviews_count": total_reviews_count,
                "reviews": review_data
            }, 200

        except Exception as e:
            return {
                "message": "Failed to fetch reviews",
                "error": str(e)
            }, 500