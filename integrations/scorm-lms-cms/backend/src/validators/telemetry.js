'use strict';
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const ERROR_TYPE_ENUM = [
  'phonological_awareness','letter_sound_correspondence','phonemic_blending',
  'cvc_decoding','digraph_decoding','vowel_pattern_confusion','print_concept',
  'sight_word_recognition','fluency_hesitation','listening_comprehension',
  'vocabulary_meaning','sentence_order','number_sequence','one_to_one_counting',
  'quantity_comparison','shape_recognition','operation_strategy',
  'fine_motor_tracing','attention_task_completion', null,
];

const TELEMETRY_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  oneOf: [
    { $ref: '#/$defs/diagnostic_event' },
    { $ref: '#/$defs/attempt_event' },
    { $ref: '#/$defs/session_complete_event' },
  ],
  $defs: {
    error_type: { type: ['string', 'null'], enum: ERROR_TYPE_ENUM },
    diagnostic_event: {
      type: 'object',
      additionalProperties: false,
      required: ['event_type','learner_id','activity_id','accuracy','diagnostic_score','prompt_level'],
      properties: {
        event_type: { const: 'diagnostic_event' },
        learner_id: { type: 'string', minLength: 1 },
        activity_id: { type: 'string', minLength: 1 },
        accuracy: { type: 'number', minimum: 0, maximum: 1 },
        diagnostic_score: { type: 'integer', minimum: 0, maximum: 100 },
        prompt_level: { type: 'integer', minimum: 0, maximum: 4 },
        error_type: { $ref: '#/$defs/error_type' },
        teacher_override: { type: 'boolean' },
      },
    },
    attempt_event: {
      type: 'object',
      additionalProperties: false,
      required: [
        'event_type','learner_id','session_id','activity_id','activity_version',
        'item_id','accuracy','prompt_level','response_time_seconds',
        'baseline_average_response_time_seconds','attempt_count',
        'consecutive_same_error_count','hint_count','audio_replay_count',
      ],
      properties: {
        event_type: { const: 'attempt_event' },
        learner_id: { type: 'string', minLength: 1 },
        session_id: { type: 'string', minLength: 1 },
        activity_id: { type: 'string', minLength: 1 },
        activity_version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
        item_id: { type: 'string', minLength: 1 },
        accuracy: { type: 'number', minimum: 0, maximum: 1 },
        prompt_level: { type: 'integer', minimum: 0, maximum: 4 },
        response_time_seconds: { type: 'number', minimum: 0 },
        baseline_average_response_time_seconds: { type: 'number', minimum: 0 },
        attempt_count: { type: 'integer', minimum: 1 },
        consecutive_same_error_count: { type: 'integer', minimum: 0 },
        hint_count: { type: 'integer', minimum: 0 },
        audio_replay_count: { type: 'integer', minimum: 0 },
        error_type: { $ref: '#/$defs/error_type' },
        teacher_override: { type: 'boolean' },
      },
    },
    session_complete_event: {
      type: 'object',
      additionalProperties: false,
      required: ['event_type','learner_id','session_id','activity_id','accuracy','prompt_level','session_spacing_days'],
      properties: {
        event_type: { const: 'session_complete_event' },
        learner_id: { type: 'string', minLength: 1 },
        session_id: { type: 'string', minLength: 1 },
        activity_id: { type: 'string', minLength: 1 },
        accuracy: { type: 'number', minimum: 0, maximum: 1 },
        prompt_level: { type: 'integer', minimum: 0, maximum: 4 },
        session_spacing_days: { type: 'number', minimum: 0 },
        consecutive_same_error_count: { type: 'integer', minimum: 0 },
        error_type: { $ref: '#/$defs/error_type' },
        learner_exit_count: { type: 'integer', minimum: 0 },
        teacher_override: { type: 'boolean' },
      },
    },
  },
};

const validateTelemetry = ajv.compile(TELEMETRY_SCHEMA);

function validate(event) {
  const valid = validateTelemetry(event);
  if (!valid) {
    const errors = validateTelemetry.errors.map(e => `${e.instancePath} ${e.message}`);
    return { valid: false, errors };
  }
  return { valid: true, errors: [] };
}

module.exports = { validate, ERROR_TYPE_ENUM };
