const {PrismaClient}=require('@prisma/client');
const db=new PrismaClient({
  datasources:{db:{url:process.env.DIRECT_URL}}
});
db.siteConfig.upsert({
  where:{key:'eur_to_dzd_rate'},
  update:{},
  create:{key:'eur_to_dzd_rate', value:'260', updatedAt: new Date()}
})
.then(r=>console.log('done:', JSON.stringify(r)))
.finally(()=>db.$disconnect());
