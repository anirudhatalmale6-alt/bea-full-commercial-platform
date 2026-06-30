'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { Pool } = require('pg');
const logger = require('../lib/logger');

function getDatabaseSslConfig() {
  return process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : false;
}

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: getDatabaseSslConfig() });

  try {
    logger.info('Seeding database…');

    // ── Tenant & School ─────────────────────────────────────
    const tenantId = 'tenant-lea-01';
    const schoolId = 'school-lea-01';
    await pool.query(`
      INSERT INTO tenants (id, name, default_locale)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING
    `, [tenantId, 'British English Academy', 'en-GB']);

    await pool.query(`
      INSERT INTO schools (id, tenant_id, name)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING
    `, [schoolId, tenantId, 'BEA Main Campus']);

    // ── Users ───────────────────────────────────────────────
    const SALT = await bcrypt.genSalt(12);
    const demoHash = await bcrypt.hash('Demo1234!', SALT);

    const users = [
      { id: 'user-admin-01', role: 'admin',   display_name: 'Admin User',      email: 'admin@lea.example'   },
      { id: 'user-teacher-01', role: 'teacher', display_name: 'Ms Johnson',    email: 'teacher@lea.example' },
      { id: 'user-parent-01', role: 'parent',  display_name: 'Alex Parent',    email: 'parent@lea.example'  },
      { id: 'user-learner-01', role: 'learner', display_name: 'Sam Learner',   email: 'sam@lea.example'     },
    ];
    for (const u of users) {
      await pool.query(`
        INSERT INTO users (id, tenant_id, role, display_name, email, password_hash)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (id) DO NOTHING
      `, [u.id, tenantId, u.role, u.display_name, u.email, demoHash]);
    }

    // ── Class ───────────────────────────────────────────────
    await pool.query(`
      INSERT INTO classes (id, school_id, teacher_id, name, grade_band)
      VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING
    `, ['class-01', schoolId, 'user-teacher-01', 'Reception A', 'Pre-K']);

    // ── Group ───────────────────────────────────────────────
    await pool.query(`
      INSERT INTO groups (id, class_id, teacher_id, name, purpose)
      VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING
    `, ['group-01', 'class-01', 'user-teacher-01', 'Phonics Intervention', 'intervention']);

    // ── Learner ─────────────────────────────────────────────
    await pool.query(`
      INSERT INTO learners (id, user_id, class_id, parent_user_id, grade_band)
      VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING
    `, ['learner-01', 'user-learner-01', 'class-01', 'user-parent-01', 'Pre-K']);

    // ── Canonical data source folder ─────────────────────────
    const dataDir = path.join(__dirname, '../../..', 'data');

    // ── Activity bank from CSV ───────────────────────────────
    const csvPath = process.env.ACTIVITY_BANK_CSV ||
      path.join(dataDir, 'BEA_Early_Years_Interactive_Activity_Bank_PreK_G3_v1_2.csv');

    if (!fs.existsSync(csvPath)) {
      logger.warn(`Activity bank CSV not found at ${csvPath}. Skipping activity seed.`);
    } else {
      const raw = fs.readFileSync(csvPath, 'utf8');
      const rows = parse(raw, { columns: true, skip_empty_lines: true });

      // Collect unique strands & skills
      const strandsMap = new Map();
      const skillsMap  = new Map();

      for (const row of rows) {
        const subject = row.subject === 'Math' ? 'Maths' : row.subject;
        const strandKey = `${subject}|${row.strand}`;
        if (!strandsMap.has(strandKey)) {
          strandsMap.set(strandKey, { id: uuid(), subject, name: row.strand });
        }
        if (!skillsMap.has(row.skill_code)) {
          skillsMap.set(row.skill_code, {
            id: uuid(),
            strand_id: strandsMap.get(strandKey).id,
            skill_code: row.skill_code,
            grade_band: row.grade_band,
            name: row.skill,
          });
        }
      }

      for (const [, s] of strandsMap) {
        await pool.query(`
          INSERT INTO strands (id, subject, name)
          VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING
        `, [s.id, s.subject, s.name]);
      }
      for (const [, s] of skillsMap) {
        await pool.query(`
          INSERT INTO skills (id, strand_id, skill_code, grade_band, name)
          VALUES ($1,$2,$3,$4,$5) ON CONFLICT (skill_code) DO NOTHING
        `, [s.id, s.strand_id, s.skill_code, s.grade_band, s.name]);
      }

      // Activities & versions
      for (const row of rows) {
        const skillCode = row.skill_code;
        const skillRow = await pool.query(
          'SELECT id FROM skills WHERE skill_code = $1', [skillCode]
        );
        if (!skillRow.rows.length) continue;
        const skillId = skillRow.rows[0].id;

        await pool.query(`
          INSERT INTO activities (id, skill_id, title, mechanic, subject, grade_band)
          VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING
        `, [row.activity_id, skillId, row.title, row.mechanic,
            row.subject === 'Math' ? 'Maths' : row.subject, row.grade_band]);

        const versionId = `${row.activity_id}-v${row.version}`;
        await pool.query(`
          INSERT INTO activity_versions (id, activity_id, version, schema_json)
          VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING
        `, [versionId, row.activity_id, row.version, JSON.stringify({
              mechanic: row.mechanic,
              item_count: parseInt(row.item_count) || 8,
              expected_duration_min: parseInt(row.expected_duration_min) || 4,
              mastery_rule: row.mastery_rule,
              accessibility: row.accessibility_notes,
              learning_goal: row.learning_goal,
            })]);

        // Create placeholder items for this version
        const itemCount = parseInt(row.item_count) || 8;
        for (let i = 1; i <= Math.min(itemCount, 4); i++) {
          const itemId = `${row.activity_id}-item-${i}`;
          await pool.query(`
            INSERT INTO items (id, activity_version_id, prompt_json, correct_answer_json, difficulty)
            VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING
          `, [itemId, versionId,
              JSON.stringify({ prompt: `Item ${i} for ${row.title}`, audio_ref: null }),
              JSON.stringify({ answer: 'placeholder' }),
              Math.min(Math.ceil(i / 2), 5)]);
        }
      }
      logger.info(`Seeded ${rows.length} activities from CSV.`);
    }

    // ── CEFR Course system from curriculum map ──────────────
    const cefrMapPath = process.env.CEFR_MAP_CSV || path.join(dataDir, 'BEA_Curriculum_Map_A1_C2.csv');

    if (fs.existsSync(cefrMapPath)) {
      const cefrRaw = fs.readFileSync(cefrMapPath, 'utf8');
      const cefrRows = parse(cefrRaw, { columns: true, skip_empty_lines: true });

      const coursesSeen = new Set();
      let moduleOrder = {};

      for (const row of cefrRows) {
        const courseId = `course-${row.cefr}`;
        if (!coursesSeen.has(courseId)) {
          await pool.query(`
            INSERT INTO cefr_courses (id, cefr_level, course_name)
            VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING
          `, [courseId, row.cefr, row.course]);
          coursesSeen.add(courseId);
          moduleOrder[courseId] = 0;
        }
        moduleOrder[courseId] += 1;

        const tags = (row.adaptive_tags || '').split(',').map(t => t.trim()).filter(Boolean);
        await pool.query(`
          INSERT INTO cefr_modules
            (id, course_id, module_code, module_title, theme_summary, grammar,
             vocabulary, function_focus, lesson_path, assessment, adaptive_tags, module_order)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
          ON CONFLICT (module_code) DO NOTHING
        `, [`mod-${row.module_code}`, courseId, row.module_code, row.module_title,
            row.theme_summary, row.grammar, row.vocabulary, row.function,
            row.lesson_path, row.assessment, tags, moduleOrder[courseId]]);
      }
      logger.info(`Seeded ${coursesSeen.size} CEFR courses and ${cefrRows.length} modules.`);
    } else {
      logger.warn(`CEFR map not found at ${cefrMapPath}. Skipping CEFR seed.`);
    }

    // ── Resource index (CEFR + Early Years) ─────────────────
    const resIndexPath = process.env.RESOURCE_INDEX_CSV || path.join(dataDir, 'BEA_Resource_Index.csv');
    if (fs.existsSync(resIndexPath)) {
      const resRaw = fs.readFileSync(resIndexPath, 'utf8');
      const resRows = parse(resRaw, { columns: true, skip_empty_lines: true });

      let cefrResCount = 0, eyResCount = 0;
      for (let i = 0; i < resRows.length; i++) {
        const row = resRows[i];
        if (row.section === 'CEFR Core Course' && row.module) {
          // Only insert if the module exists
          const modCheck = await pool.query(
            'SELECT 1 FROM cefr_modules WHERE module_code = $1', [row.module]
          );
          if (modCheck.rows.length) {
            await pool.query(`
              INSERT INTO cefr_module_resources
                (id, module_code, resource_type, title, format, editable, adaptive_use)
              VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING
            `, [`res-cefr-${i}`, row.module, row.resource_type, row.title,
                row.format || 'DOCX/PDF/HTML',
                (row.editable_text || 'Yes').toLowerCase().startsWith('y'),
                row.adaptive_use]);
            cefrResCount++;
          }
        } else if (row.section === 'Early Years Structured Literacy') {
          await pool.query(`
            INSERT INTO ey_resources
              (id, grade_band, resource_type, title, format, editable, adaptive_use)
            VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING
          `, [`res-ey-${i}`, row.level || row.module || 'Pre-K', row.resource_type,
              row.title, row.format || 'DOCX/PDF/HTML',
              (row.editable_text || 'Yes').toLowerCase().startsWith('y'),
              row.adaptive_use]);
          eyResCount++;
        }
      }
      logger.info(`Seeded ${cefrResCount} CEFR resources and ${eyResCount} early-years resources.`);
    }

    // ── Early-years 36-week scope & sequence ────────────────
    const scopePath = process.env.SCOPE_SEQUENCE_CSV || path.join(dataDir, 'BEA_Early_Years_Scope_Sequence_PreK_Grade3.csv');
    if (fs.existsSync(scopePath)) {
      const scopeRaw = fs.readFileSync(scopePath, 'utf8');
      const scopeRows = parse(scopeRaw, { columns: true, skip_empty_lines: true });
      for (const row of scopeRows) {
        await pool.query(`
          INSERT INTO scope_sequence
            (grade_band, week, unit, skill_focus, core_routine, downloadable, assessment)
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          ON CONFLICT (grade_band, week, unit) DO NOTHING
        `, [row.grade, parseInt(row.week), row.unit, row.skill_focus,
            row.core_routine, row.downloadable, row.assessment]);
      }
      logger.info(`Seeded ${scopeRows.length} scope & sequence weeks.`);
    }

    // ── Enrol demo learner in A1 ────────────────────────────
    await pool.query(`
      INSERT INTO cefr_enrolments (id, user_id, course_id)
      VALUES ($1,$2,$3) ON CONFLICT (user_id, course_id) DO NOTHING
    `, ['enrol-demo-01', 'user-learner-01', 'course-A1']);

    logger.info('Seed complete. Demo credentials: teacher@lea.example / Demo1234!');
  } catch (err) {
    logger.error('Seed failed', { error: err.message, stack: err.stack });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
