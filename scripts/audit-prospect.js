const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const [cmd, id] = process.argv.slice(2);

  if (cmd === 'latest-id') {
    const row = await prisma.prospect.findFirst({ orderBy: { createdAt: 'desc' } });
    if (row) console.log(row.id);
    return;
  }

  if (cmd === 'get' && id) {
    const row = await prisma.prospect.findUnique({ where: { id } });
    console.log(JSON.stringify(row, null, 2));
    return;
  }

  if (cmd === 'counts') {
    const [prospects, clients] = await Promise.all([
      prisma.prospect.count(),
      prisma.user.count({ where: { role: 'CLIENT' } })
    ]);
    console.log(JSON.stringify({ prospects, clients }, null, 2));
    return;
  }

  throw new Error('Unknown command');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
