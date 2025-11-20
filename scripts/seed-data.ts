/**
 * Initial Data Seeding Script for MongoDB
 */

import mongoose from 'mongoose';
import { DateEntry } from '../src/models/dateEntry.model';
import { Cafe } from '../src/models/cafe.model';
import { Restaurant } from '../src/models/restaurant.model';
import { Spot } from '../src/models/spot.model';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function seedData() {
  try {
    // MongoDB 연결
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    // 기존 데이터 삭제 (선택사항)
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      DateEntry.deleteMany({}),
      Cafe.deleteMany({}),
      Restaurant.deleteMany({}),
      Spot.deleteMany({}),
    ]);
    console.log('✅ Existing data cleared');

    // Date Entry 생성
    console.log('📅 Creating Date Entries...');
    const dateEntry1 = await DateEntry.create({
      date: new Date('2025-11-20'),
      region: '삼송',
    });

    const dateEntry2 = await DateEntry.create({
      date: new Date('2025-11-21'),
      region: '강남',
    });

    console.log(`✅ Created ${2} Date Entries`);

    // Cafes 생성
    console.log('☕ Creating Cafes...');
    await Cafe.create([
      {
        name: '스타벅스 삼송점',
        memo: '조용하고 넓은 카페',
        visited: false,
        latitude: 37.6789,
        longitude: 126.9123,
        dateEntryId: dateEntry1._id,
      },
      {
        name: '투썸플레이스 강남점',
        memo: '케이크가 맛있는 곳',
        visited: true,
        latitude: 37.4979,
        longitude: 127.0276,
        dateEntryId: dateEntry2._id,
      },
    ]);
    console.log(`✅ Created ${2} Cafes`);

    // Restaurants 생성
    console.log('🍽️  Creating Restaurants...');
    await Restaurant.create([
      {
        name: '청기와타운 삼송점',
        type: '한식',
        memo: '맛있는 한식당',
        visited: true,
        latitude: 37.6790,
        longitude: 126.9125,
        dateEntryId: dateEntry1._id,
      },
      {
        name: '스시로 강남점',
        type: '일식',
        memo: '회전초밥 맛집',
        visited: false,
        latitude: 37.4980,
        longitude: 127.0277,
        dateEntryId: dateEntry2._id,
      },
      {
        name: '육쌈냉면 삼송점',
        type: '고기집',
        memo: '고기와 냉면이 맛있는 곳',
        visited: true,
        latitude: 37.6791,
        longitude: 126.9126,
        dateEntryId: dateEntry1._id,
      },
    ]);
    console.log(`✅ Created ${3} Restaurants`);

    // Spots 생성
    console.log('🗺️  Creating Spots...');
    await Spot.create([
      {
        name: '북한산 등산로',
        memo: '가벼운 등산하기 좋은 코스',
        visited: false,
        latitude: 37.6584,
        longitude: 126.9772,
        dateEntryId: dateEntry1._id,
      },
      {
        name: '코엑스 아쿠아리움',
        memo: '실내 데이트 코스',
        visited: true,
        latitude: 37.5125,
        longitude: 127.0590,
        dateEntryId: dateEntry2._id,
      },
    ]);
    console.log(`✅ Created ${2} Spots`);

    // 생성된 데이터 확인
    console.log('\n📊 Summary:');
    const counts = await Promise.all([
      DateEntry.countDocuments(),
      Cafe.countDocuments(),
      Restaurant.countDocuments(),
      Spot.countDocuments(),
    ]);

    console.log(`   - Date Entries: ${counts[0]}`);
    console.log(`   - Cafes: ${counts[1]}`);
    console.log(`   - Restaurants: ${counts[2]}`);
    console.log(`   - Spots: ${counts[3]}`);

    console.log('\n🎉 Seed data created successfully!');

    // 연결 종료
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// 스크립트 실행
seedData();
