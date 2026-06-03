import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const seedPackages = [
  {
    title: 'باريس الساحرة', country: 'فرنسا', duration: '7 أيام / 6 ليالٍ',
    price: 185000, tag: 'الأكثر طلباً', visible: true,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    description: 'رحلة ساحرة إلى باريس تشمل زيارة أبرز المعالم السياحية مع إقامة فاخرة في فندق 4 نجوم.',
  },
  {
    title: 'دبي الفخامة', country: 'الإمارات', duration: '5 أيام / 4 ليالٍ',
    price: 145000, tag: 'عرض خاص', visible: true,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    description: 'تجربة فاخرة في دبي مع إقامة في فندق 5 نجوم وسفاري صحراء لا تُنسى.',
  },
  {
    title: 'إسطنبول التاريخ', country: 'تركيا', duration: '6 أيام / 5 ليالٍ',
    price: 120000, tag: 'جديد', visible: true,
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
    description: 'اكتشف سحر إسطنبول بين التاريخ العريق والحداثة مع جولة رائعة في البوسفور.',
  },
  {
    title: 'العمرة المباركة', country: 'المملكة العربية السعودية', duration: '10 أيام / 9 ليالٍ',
    price: 210000, tag: 'مميز', visible: true,
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80',
    description: 'باقة عمرة شاملة مع إقامة قريبة من الحرم المكي الشريف ومرشد ديني متخصص.',
  },
  {
    title: 'روما الأبدية', country: 'إيطاليا', duration: '8 أيام / 7 ليالٍ',
    price: 220000, tag: 'فاخر', visible: true,
    image: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=800&q=80',
    description: 'جولة استثنائية في روما الأبدية تشمل أبرز المتاحف والمعالم التاريخية.',
  },
  {
    title: 'برشلونة والشمس', country: 'إسبانيا', duration: '7 أيام / 6 ليالٍ',
    price: 195000, tag: 'صيفي', visible: true,
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
    description: 'استمتع بشمس برشلونة وشواطئها الرائعة مع جولة في المدينة العريقة.',
  },
];

export async function GET() {
  try {
    await db.package.deleteMany();
    await db.package.createMany({ data: seedPackages });
    return NextResponse.json({ success: true, message: 'تم إضافة الباقات الستة بنجاح' });
  } catch (_error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
