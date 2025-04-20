docker build -t my-nginx .
#IF PORT FORWARDING TO PORT 65535
#Stop and remove existing if running
#docker stop my-nginx && docker rm my-nginx
#docker run -d --name my-nginx --network my-app-network -p 65535:80 my-nginx
#ELSE
docker run -d --name my-nginx --network ingv-net -p 80:80 my-nginx