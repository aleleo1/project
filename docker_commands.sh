#docker stop mysql-container && docker rm mysql-container && 
docker run -d --name mysql-container --network ingv-net -e MYSQL_ROOT_PASSWORD={MYSQL_ROOT_PASSWORD} -e MYSQL_DATABASE=ingv -e MYSQL_USER=ufpv_manager -e MYSQL_PASSWORD={DB_PASS} mysql:latest && docker cp {path to dump}/{dump_file_name}.sql mysql-container:/tmp/
#IN DOCKER conmsole: mysql -u ufpv_manager -p ingv < tmp/Dump20250313.sql
docker build -t ingv .
#docker stop ingv && docker rm ingv && 
docker run -d --name ingv --network ingv-net -p 0.0.0.0:4321:4321 ingv