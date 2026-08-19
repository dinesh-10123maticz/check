# total project on galfi :

promotional
nft marketplace
swap
lunchpad( comming soon)
admin panel
Backend

# backend :

check the package.json for profiles
env have separate env for each environment

check the scripts folder for per generate asset in db and check for /dev/ routes for development routes that are recripted for productuction because check all the things in staging and copy the dp to production

# production check list

1 . change the config collection address
2 . change the config CURRENT_NETWORK
3 . add network for production ( as of now it is polygon )
4 . change the admin address

# Smart contract :

total contract are 7 + 16

1 trade contract

5 collection contract( planet , astroid , crew , special_crew , ship )

1 reward contract

16 token contract ( GALFI , GFORCE , GFMNR , etc )

## things to know before and after deployement of contract

16 token contract names check on the sheet so a proper symbol .

5 collection contract also check the config file for proper symbol ( owner contract need to be trade contract check while deployment of contract )

whitelist the tokencontract and collection contract on trade contracts .

add the reward contract on trade check with deploy the trade add proper admin there because we are sign for deposite and withdraw the tokens from in game .

# S3

we have all the assets and images on s3 ( original , compress )
there is golang script for compress
we have separeate s3 for ipfs ( store the meta )
we have also have pinata ipfs for store only image (not meta)

# check the harddrive and check the script folder

i have lot of scripts there it will be use full for you

rename script to change the name 1 to till exist

generate like 25 to 2500 like that

compress script that script go through all the athe folder ad files and compress each one get the separate output folder

mostly /orginal /compress these are the name path i mention in s3 bucket most

label script : we only have vector images for base
here i have a label script that change the background ( rare , uncommon , common ) and label the image it is like canva that render on the vector base image
