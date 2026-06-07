const {PrismaClient}=require('@prisma/client');
const db=new PrismaClient();
db.siteConfig.findUnique({where:{key:'payment_methods'}})
  .then(r=>console.log(JSON.stringify(r)))
  .finally(()=>db.$disconnect());
