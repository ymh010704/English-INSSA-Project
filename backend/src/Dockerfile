# 1. 노드 20 버전 사용
FROM node:20

# 2. 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# 3. 패키지 설치를 위해 package.json 복사
COPY package*.json ./
RUN npm install

# 4. 나머지 소스 코드 전부 복사
COPY . .

# 5. 🔴 여기가 핵심! 우리가 고친 app.js를 실행하도록 강제함
CMD ["node", "src/app.js"]