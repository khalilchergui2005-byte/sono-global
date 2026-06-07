const {PrismaClient}=require('@prisma/client');
const db=new PrismaClient({
  datasources:{db:{url:process.env.DIRECT_URL}}
});
db.siteConfig.findMany({select:{key:true}})
  .then(r=>console.log(JSON.stringify(r,null,2)))
  .finally(()=>db.$disconnect());
