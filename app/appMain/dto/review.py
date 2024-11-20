from flask_restx import  Namespace

class ReviewDto:
    post_review_api = Namespace('post_review', description='API to post review to the restaurant ')
    get_review_api = Namespace('get_review', description= 'API to get review of restaurant')
    get_review_customer_api  = Namespace('get_review_customer', description= 'API to get review of restaurant')