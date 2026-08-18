# karen_project — חנות שוקולד/עוגות/עוגיות

מיקרו-שירותים: `security` (users-service, אימות + הזמנות + מועדפים), `items-service` (קטלוג
מוצרים), `frontend` (React, מוגש דרך nginx). מתואמים יחד עם `docker-compose.yml`.

## הרצה מקומית

```bash
cp .env.example .env   # למלא ערכים אמיתיים
docker compose up --build -d
docker compose ps      # לוודא ש-4 הקונטיינרים healthy
```
פרונטאנד: http://localhost:3000 · items-service: http://localhost:8080 · users-service: http://localhost:8081

## Production

- **דומיין:** http://kerendiamonds.duckdns.org (מצביע על Elastic IP קבוע, AWS `eu-central-1`)
- **שרת:** EC2 `t3.micro`, Ubuntu 22.04, Docker + Docker Compose
- **CI/CD:** כל push ל-`main` מפעיל את `.github/workflows/deploy.yml` — בונה ודוחף images ל-GHCR
  (לא בונה על ה-EC2 עצמו, ה-RAM מוגבל מדי), ואז SSH-ית ל-EC2 ל-`docker compose pull && up -d`
  דרך `docker-compose.prod.yml` (מחליף `build:` ב-`image:` מ-GHCR).
- **SSH ידני לשרת:** `ssh -i ~/.ssh/karen-project-ec2.pem ubuntu@<Elastic IP>`
- **לוגים בשרת:** `cd /home/ubuntu/app && docker compose logs -f --tail=100`
