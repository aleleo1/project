docker build -t my-nginx . && docker run -d --name my-nginx --network ingv-net -p 80:80 my-nginx