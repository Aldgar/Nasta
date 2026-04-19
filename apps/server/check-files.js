const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  const verifications = await prisma.idVerification.findMany({
    select: {
      id: true,
      documentFrontUrl: true,
      documentBackUrl: true,
      selfieUrl: true,
      status: true,
      createdAt: true,
    },
  });
  let missing = 0,
    found = 0,
    total = 0;
  for (const v of verifications) {
    for (const url of [v.documentFrontUrl, v.documentBackUrl, v.selfieUrl]) {
      if (!url) continue;
      total++;
      const filePath = path.join(process.cwd(), url);
      if (fs.existsSync(filePath)) {
        found++;
      } else {
        missing++;
        console.log(
          'MISSING:',
          url,
          '| Status:',
          v.status,
          '| Created:',
          v.createdAt,
        );
      }
    }
  }
  console.log('\n=== KYC SUMMARY ===');
  console.log(
    'Total file refs:',
    total,
    '| Found:',
    found,
    '| Missing:',
    missing,
  );

  // Background checks
  const bgs = await prisma.backgroundCheck.findMany({
    select: { uploadedDocument: true, status: true },
  });
  let bgMissing = 0,
    bgFound = 0;
  for (const bg of bgs) {
    if (!bg.uploadedDocument) continue;
    const filePath = path.join(process.cwd(), bg.uploadedDocument);
    if (fs.existsSync(filePath)) {
      bgFound++;
    } else {
      bgMissing++;
      console.log('BG MISSING:', bg.uploadedDocument);
    }
  }
  console.log('\n=== BACKGROUND CHECK SUMMARY ===');
  console.log(
    'Total:',
    bgFound + bgMissing,
    '| Found:',
    bgFound,
    '| Missing:',
    bgMissing,
  );

  // Vehicles
  const vehicles = await prisma.vehicle.findMany({
    select: {
      photoFrontUrl: true,
      photoBackUrl: true,
      photoLeftUrl: true,
      photoRightUrl: true,
      vehicleLicenseUrl: true,
    },
  });
  let vMissing = 0,
    vFound = 0;
  for (const v of vehicles) {
    for (const url of [
      v.photoFrontUrl,
      v.photoBackUrl,
      v.photoLeftUrl,
      v.photoRightUrl,
      v.vehicleLicenseUrl,
    ]) {
      if (!url) continue;
      const filePath = path.join(process.cwd(), url);
      if (fs.existsSync(filePath)) {
        vFound++;
      } else {
        vMissing++;
        console.log('VEH MISSING:', url);
      }
    }
  }
  console.log('\n=== VEHICLE SUMMARY ===');
  console.log(
    'Total:',
    vFound + vMissing,
    '| Found:',
    vFound,
    '| Missing:',
    vMissing,
  );

  await prisma.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
