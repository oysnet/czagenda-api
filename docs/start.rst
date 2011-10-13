############################################
Start with oauth and account registration
############################################

**********
curl-oauth
**********

curl-oauth is a curl like tool with oauth support. Sample below use it. You can download it at `github <https://github.com/oxys/curl-oauth>`_


************
Registration
************

To access api you must have an account and oauth tokens used to sign requests to api. So go to this `url <http://auth.czagenda.oxys.net/auth/register/>`_ and proceed with account registration.

Second step is to create a consumer that will be allowed to access the api, fill the form `here <http://auth.czagenda.oxys.net/oauth/register/>`_ and validate. You have now the token and the secret for your new consumer.

Third step is to get access token and access secret for this consumer. Achieve this by using curl-oauth:

	>>> export API="http://api-master.czagenda.oxys.net/api;
		curl-oauth --domain cz-api \
		  --request-token \
		  --consumer-secret <CONSUMER_SECRET> \
		  --consumer-key <CONSUMER_TOKEN>  \
		  --request-token-url $API/oauth-token/_request-token \
		  --request-token-callback http://www.oxys.net \
		  --request-token-authorize-url http://auth.czagenda.oxys.net/oauth/authorize/ 
		  --request-token-access-token-url $API/oauth-token/_access-token
		  
	Follow instructions, the pin asked is the oauth_verifier parameter provided in querystring of the callback url. 

	At the end of process you can request api using curl-oauth --domain cz-api.