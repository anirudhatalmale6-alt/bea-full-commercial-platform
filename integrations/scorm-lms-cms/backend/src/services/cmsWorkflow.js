'use strict';

const VALID_TRANSITIONS = {
  draft: ['in_review', 'archived'],
  in_review: ['draft', 'published', 'archived'],
  published: ['draft', 'archived'],
  archived: ['draft'],
};

function assertTransition(from, to) {
  if (!VALID_TRANSITIONS[from] || !VALID_TRANSITIONS[from].includes(to)) {
    const err = new Error(`Invalid CMS status transition from ${from} to ${to}`);
    err.statusCode = 400;
    throw err;
  }
}

function nextVersion(currentVersion) {
  return Number(currentVersion || 0) + 1;
}

module.exports = { assertTransition, nextVersion };
