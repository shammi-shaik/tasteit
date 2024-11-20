from flask_restx import Namespace

class UsersDto:
    signupapi = Namespace('usersignup',description='api for user signup')
    loginapi = Namespace('userlogin',description='api for user login')
    updatedetailsapi = Namespace('updatedetails',description='api to update user details')
    deleteapi = Namespace('deleteuser',description='api to delete user')
    getdetailsapi = Namespace('getdetails',description='api to show details of user')
    listusersapi = Namespace('listusers' , description='api to show list of users')
