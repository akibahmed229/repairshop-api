# build the image
# docker build -t repair_shop .
# run the image
# docker run -p 8000:8000 repair_shop

FROM node:20

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3500

CMD [ "npm", "run", "dev" ]

