import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@127.0.0.1:5432/datelog_dev',
    },
  },
});

async function main() {
  console.log('🌱 Starting seed...');

  // Create date entry with related places
  const dateEntry = await prisma.dateEntry.create({
    data: {
      date: new Date('2025-10-18'),
      region: '삼송',
      cafes: {
        create: [
          {
            name: '나무사이로',
            memo: '분위기 좋은 창가 자리 있음',
            visited: true,
            latitude: 37.6789,
            longitude: 126.9123,
            link: 'https://naver.me/cafe-example',
          },
        ],
      },
      restaurants: {
        create: [
          {
            name: '이이요',
            type: '한식',
            memo: '고등어정식 맛있음',
            visited: true,
            latitude: 37.6790,
            longitude: 126.9125,
          },
        ],
      },
      spots: {
        create: [
          {
            name: '북한산 둘레길',
            memo: '산책로 좋음',
            visited: false,
            latitude: 37.6800,
            longitude: 126.9130,
          },
        ],
      },
    },
    include: {
      cafes: true,
      restaurants: true,
      spots: true,
    },
  });

  console.log('✅ Seed data created successfully!');
  console.log(`   Date: ${dateEntry.date.toISOString().split('T')[0]}`);
  console.log(`   Region: ${dateEntry.region}`);
  console.log(`   Cafes: ${dateEntry.cafes.length}`);
  console.log(`   Restaurants: ${dateEntry.restaurants.length}`);
  console.log(`   Spots: ${dateEntry.spots.length}`);

  // Create additional date entry for testing
  const dateEntry2 = await prisma.dateEntry.create({
    data: {
      date: new Date('2025-10-25'),
      region: '은평',
      cafes: {
        create: [
          {
            name: '카페 이태리',
            memo: '티라미수가 맛있어요',
            visited: false,
            latitude: 37.6123,
            longitude: 126.9234,
          },
        ],
      },
      restaurants: {
        create: [
          {
            name: '스시 하나',
            type: '일식',
            memo: '신선한 회',
            visited: false,
            latitude: 37.6124,
            longitude: 126.9235,
          },
          {
            name: '마라탕 전문점',
            type: '중식',
            visited: false,
          },
        ],
      },
      spots: {
        create: [
          {
            name: '북한산 등산로',
            memo: '초보자 코스',
            visited: false,
          },
        ],
      },
    },
  });

  console.log('\n✅ Additional seed data created!');
  console.log(`   Date: ${dateEntry2.date.toISOString().split('T')[0]}`);
  console.log(`   Region: ${dateEntry2.region}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
