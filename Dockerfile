FROM node:14-slim
ENV NODE_ENV=production
WORKDIR /app
COPY . /app
RUN npm install --production
EXPOSE 3000
CMD [ "node","index.js" ]

##build
#$ docker build . -t basic_docker   ; -t ย่อมาจาก tag และการที่ไม่ใส่ :Version จึงเป็น lastest
#run docker run -d --rm -p 3000:3000 --name <nick_name> <imageID,iamgeName> ex. docker run -d --rm -p 3000:3000 --name basic_docker basic_docker

#ลบ container ที่กำลัง run
#docker rm basic_docker -f  หรือ docker stop basic_docker and docker rm basic_docker