docker run -d   --name mysql-container   --network ingv-net   -e MYSQL_ROOT_PASSWORD={MYSQL_ROOT_PASSWORD}   -e MYSQL_DATABASE=ingv   -e MYSQL_USER=ufpv_manager   -e MYSQL_PASSWORD={DB_PASS}   -p 3306:3306   mysql:latest
docker cp Dump20250313.sql mysql-container:/tmp/
docker build -t ingv .
docker run -d   --name ingv   --network ingv-net   -p 4321:4321   ingv