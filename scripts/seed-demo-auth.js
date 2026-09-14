/**
 * LOCAL / DEMO ONLY - DO NOT RUN IN PRODUCTION
 *
 * Seed Auth Script for Capacity Connect Local Demonstration.
 * Uses Supabase Admin Auth API (service_role key) to idempotently create
 * standard demo accounts by email without assuming forced UUIDs.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is missing.');
  console.error('Usage: SUPABASE_SERVICE_ROLE_KEY="<your-key>" node scripts/seed-demo-auth.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEMO_USERS = [
  {
    "email": "admin.capacityconnect@example.com",
    "name": "Demo System Administrator",
    "role": "admin"
  },
  {
    "email": "trainer.radar.capacityconnect@example.com",
    "name": "Demo Radar Lead Trainer",
    "role": "trainer"
  },
  {
    "email": "trainer.nwp.capacityconnect@example.com",
    "name": "Demo NWP Specialist Trainer",
    "role": "trainer"
  },
  {
    "email": "trainer.satellite.capacityconnect@example.com",
    "name": "Demo Satellite Expert Trainer",
    "role": "trainer"
  },
  {
    "email": "trainer.verification.capacityconnect@example.com",
    "name": "Demo Verification Specialist Trainer",
    "role": "trainer"
  },
  {
    "email": "trainer.python.capacityconnect@example.com",
    "name": "Demo Data Analytics Trainer",
    "role": "trainer"
  },
  {
    "email": "trainer.aviation.capacityconnect@example.com",
    "name": "Demo Aviation Hydromet Trainer",
    "role": "trainer"
  },
  {
    "email": "trainee.rdr1.capacityconnect@example.com",
    "name": "Demo Radar Trainee 01",
    "role": "trainee"
  },
  {
    "email": "trainee.rdr2.capacityconnect@example.com",
    "name": "Demo Radar Trainee 02",
    "role": "trainee"
  },
  {
    "email": "trainee.rdr3.capacityconnect@example.com",
    "name": "Demo Radar Trainee 03",
    "role": "trainee"
  },
  {
    "email": "trainee.rdr4.capacityconnect@example.com",
    "name": "Demo Radar Trainee 04",
    "role": "trainee"
  },
  {
    "email": "trainee.rdr5.capacityconnect@example.com",
    "name": "Demo Radar Trainee 05",
    "role": "trainee"
  },
  {
    "email": "trainee.rdr6.capacityconnect@example.com",
    "name": "Demo Radar Trainee 06",
    "role": "trainee"
  },
  {
    "email": "trainee.rdr7.capacityconnect@example.com",
    "name": "Demo Radar Assistant 07",
    "role": "trainee"
  },
  {
    "email": "trainee.rdr8.capacityconnect@example.com",
    "name": "Demo Radar Assistant 08",
    "role": "trainee"
  },
  {
    "email": "trainee.fst1.capacityconnect@example.com",
    "name": "Demo Forecaster Trainee 01",
    "role": "trainee"
  },
  {
    "email": "trainee.fst2.capacityconnect@example.com",
    "name": "Demo Forecaster Trainee 02",
    "role": "trainee"
  },
  {
    "email": "trainee.fst3.capacityconnect@example.com",
    "name": "Demo Forecaster Trainee 03",
    "role": "trainee"
  },
  {
    "email": "trainee.fst4.capacityconnect@example.com",
    "name": "Demo Forecaster Trainee 04",
    "role": "trainee"
  },
  {
    "email": "trainee.fst5.capacityconnect@example.com",
    "name": "Demo Forecaster Trainee 05",
    "role": "trainee"
  },
  {
    "email": "trainee.fst6.capacityconnect@example.com",
    "name": "Demo Forecaster Trainee 06",
    "role": "trainee"
  },
  {
    "email": "trainee.nwp1.capacityconnect@example.com",
    "name": "Demo NWP Scientist Trainee 01",
    "role": "trainee"
  },
  {
    "email": "trainee.nwp2.capacityconnect@example.com",
    "name": "Demo NWP Scientist Trainee 02",
    "role": "trainee"
  },
  {
    "email": "trainee.nwp3.capacityconnect@example.com",
    "name": "Demo NWP Scientist Trainee 03",
    "role": "trainee"
  },
  {
    "email": "trainee.nwp4.capacityconnect@example.com",
    "name": "Demo NWP Scientist Trainee 04",
    "role": "trainee"
  },
  {
    "email": "trainee.nwp5.capacityconnect@example.com",
    "name": "Demo NWP Scientist Trainee 05",
    "role": "trainee"
  },
  {
    "email": "trainee.sat1.capacityconnect@example.com",
    "name": "Demo Satellite Trainee 01",
    "role": "trainee"
  },
  {
    "email": "trainee.sat2.capacityconnect@example.com",
    "name": "Demo Satellite Trainee 02",
    "role": "trainee"
  },
  {
    "email": "trainee.sat3.capacityconnect@example.com",
    "name": "Demo Satellite Trainee 03",
    "role": "trainee"
  },
  {
    "email": "trainee.sat4.capacityconnect@example.com",
    "name": "Demo Satellite Trainee 04",
    "role": "trainee"
  },
  {
    "email": "trainee.avn1.capacityconnect@example.com",
    "name": "Demo Aviation Trainee 01",
    "role": "trainee"
  },
  {
    "email": "trainee.avn2.capacityconnect@example.com",
    "name": "Demo Aviation Trainee 02",
    "role": "trainee"
  },
  {
    "email": "trainee.avn3.capacityconnect@example.com",
    "name": "Demo Aviation Trainee 03",
    "role": "trainee"
  },
  {
    "email": "trainee.hyd1.capacityconnect@example.com",
    "name": "Demo Hydromet Trainee 01",
    "role": "trainee"
  },
  {
    "email": "trainee.hyd2.capacityconnect@example.com",
    "name": "Demo Hydromet Trainee 02",
    "role": "trainee"
  },
  {
    "email": "trainee.agr1.capacityconnect@example.com",
    "name": "Demo Agromet Trainee 01",
    "role": "trainee"
  },
  {
    "email": "trainee.agr2.capacityconnect@example.com",
    "name": "Demo Agromet Trainee 02",
    "role": "trainee"
  }
];

async function bootstrapAuth() {
  console.log(`Starting Auth Bootstrap for ${DEMO_USERS.length} Demo Users on ${SUPABASE_URL}...`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const user of DEMO_USERS) {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: {
        full_name: user.name,
        role: user.role
      }
    });

    if (createErr) {
      if (createErr.message.includes('already registered') || createErr.message.includes('already exists') || createErr.status === 422) {
        skippedCount++;
      } else {
        console.error(`[ERROR] Failed creating ${user.email}: ${createErr.message}`);
      }
    } else {
      createdCount++;
    }
  }

  console.log(`\nAuth Bootstrap complete! Created: ${createdCount}, Already Present: ${skippedCount}.`);
}

bootstrapAuth().catch(err => {
  console.error('Fatal Auth Bootstrap error:', err);
  process.exit(1);
});
