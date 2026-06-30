"use client";

import { useMemo, useState } from "react";
import { beaBrand } from "@/config/brand";
import {
  beaCoursePreviews,
  beaLibraryTiles,
  getRecommendedCourse,
  type BEACoursePreview,
} from "@/data/beaLandingCourses";
import { evaluateLandingAccess, type LandingUserState } from "@/lib/landingAccess";
import BEABrandHeader from "@/components/brand/BEABrandHeader";
import "./BEALandingPage.css";

type PreviewModalState = {
  course: BEACoursePreview;
  snippetIndex: number;
} | null;

const demoState: LandingUserState = {
  isAuthenticated: false,
  hasPaidLevelTest: false,
  hasCompletedLevelTest: false,
  mappedLevel: undefined,
  hasUnlockedAppetiser: false,
  hasPaidFullCourse: false,
};

export default function BEALandingPage() {
  const [selectedLevel, setSelectedLevel] = useState<"A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "">("");
  const [previewModal, setPreviewModal] = useState<PreviewModalState>(null);

  const recommendedCourse = useMemo(() => getRecommendedCourse(selectedLevel || "B1"), [selectedLevel]);
  const access = evaluateLandingAccess(demoState, recommendedCourse.id);

  return (
    <main className="beaSplashLanding">
      <nav className="beaTopNav" aria-label={`${beaBrand.displayName} navigation`}>
        <BEABrandHeader />
        <div className="beaNavLinks">
          <a href="#library">Library</a>
          <a href="#levels">CEFR Levels</a>
          <a href="#trial">Trial Lesson</a>
          <a href="/login">Log in</a>
          <a className="beaNavButton" href="/checkout/placement?source=nav">{beaBrand.cta.primary}</a>
        </div>
      </nav>

      <section className="beaPlayHero" aria-label={`${beaBrand.displayName} playful learning banner`}>
        <div className="beaHeroText">
          <div className="beaPill">⭐ British English learning pathway for A1-C2</div>
          <h1>Preview. Test. Try a mini lesson. Then start your British English course.</h1>
          <p>
            Explore bright course previews before paying. When learners complete the paid {beaBrand.shortName} Level Test,
            {beaBrand.shortName} maps the right pathway and unlocks a very short trial lesson before full-course payment.
          </p>

          <div className="beaHeroButtons">
            <a className="beaPrimaryButton" href="/checkout/placement?source=hero">{beaBrand.cta.primary}</a>
            <a className="beaOutlineButton" href="#course-previews">{beaBrand.cta.preview}</a>
          </div>

          <div className="beaJourneyRibbon" aria-label="Commercial learning journey">
            <span>👀 Preview</span>
            <span>💳 Paid test</span>
            <span>🧭 Pathway</span>
            <span>🎮 Short trial</span>
            <span>🚀 Full course</span>
          </div>
        </div>

        <aside className="beaMascotBoard" aria-label="Level test and course unlock board">
          <div className="beaSunBubble">A1-C2</div>
          <div className="beaBoardCard main">
            <span className="beaBoardIcon">🇬🇧</span>
            <h2>{beaBrand.shortName} Level Test maps the pathway</h2>
            <p>Paid placement unlocks the recommended British English course and a mini trial lesson.</p>
          </div>
          <div className="beaMiniBoard one"><strong>216</strong><span>lessons</span></div>
          <div className="beaMiniBoard two"><strong>36</strong><span>modules</span></div>
          <div className="beaMiniBoard three"><strong>6</strong><span>levels</span></div>
        </aside>
      </section>

      <section className="beaStatusPanel">
        <div>
          <p className="beaSectionKicker">Pathway demo</p>
          <h2>{access.statusMessage}</h2>
        </div>
        <div className="beaStatusControls">
          <label>
            Preview pathway
            <select value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value as any)}>
              <option value="">B1 recommended demo</option>
              <option value="A1">A1 Starter</option>
              <option value="A2">A2 Everyday</option>
              <option value="B1">B1 Independent</option>
              <option value="B2">B2 Confident</option>
              <option value="C1">C1 Advanced</option>
              <option value="C2">C2 Mastery</option>
            </select>
          </label>
          <a className="beaPrimaryButton small" href={access.nextActionHref}>{access.nextActionLabel}</a>
        </div>
      </section>

      <section id="library" className="beaSection beaLibrary">
        <div className="beaSectionHeader centered">
          <p className="beaSectionKicker">One playful {beaBrand.shortName} library</p>
          <h2>Games, lessons, worksheets and teacher tools in one place</h2>
          <p>Choose a skill area, preview learning content, then take the {beaBrand.shortName} Level Test when ready.</p>
        </div>

        <div className="beaLibraryGrid">
          {beaLibraryTiles.map((tile) => (
            <a className="beaLibraryTile" href={tile.href} key={tile.title}>
              <span>{tile.icon}</span>
              <strong>{tile.title}</strong>
              <small>{tile.subtitle}</small>
            </a>
          ))}
        </div>
      </section>

      <section id="levels" className="beaSection beaLevelStrip">
        <div className="beaSectionHeader">
          <div>
            <p className="beaSectionKicker">Explore by CEFR level</p>
            <h2>Pick a level, or let the {beaBrand.shortName} Level Test choose for you</h2>
          </div>
          <a className="beaTextLink" href="/cefr-levels">Compare levels</a>
        </div>
        <div className="beaLevelGrid">
          {beaCoursePreviews.map((course) => (
            <a className={`beaLevelTile ${course.colourClass}`} href={`/courses/${course.slug}`} key={course.id}>
              <span className="beaLevelIcon">{course.icon}</span>
              <strong>{course.level}</strong>
              <small>{course.ageBand}</small>
            </a>
          ))}
        </div>
      </section>

      <section id="course-previews" className="beaSection">
        <div className="beaSectionHeader">
          <div>
            <p className="beaSectionKicker">Clickable previews before payment</p>
            <h2>Let customers see what is on offer</h2>
          </div>
          <a className="beaTextLink" href="/courses">Browse all courses</a>
        </div>

        <div className="beaCourseGrid">
          {beaCoursePreviews.map((course) => (
            <article className={`beaCourseCard ${course.colourClass}`} key={course.id}>
              <div className="beaCourseTop">
                <span className="beaCourseIcon">{course.icon}</span>
                <div>
                  <span className="beaLevelChip">{course.level}</span>
                  <span className="beaPathwayChip">{course.pathway}</span>
                </div>
              </div>

              <div className="beaCourseBody">
                <h3>{course.title}</h3>
                <p>{course.subtitle}</p>

                <div className="beaSnippetStack">
                  {course.previewSnippets.map((snippet, index) => (
                    <button
                      type="button"
                      className="beaSnippetButton"
                      key={`${course.id}-${snippet.title}`}
                      onClick={() => setPreviewModal({ course, snippetIndex: index })}
                    >
                      <span className="beaSnippetIcon">{snippet.icon}</span>
                      <span>
                        <strong>{snippet.title}</strong>
                        <small>{snippet.description}</small>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="beaCourseStats">
                  <span>{course.fullCourse.modules} modules</span>
                  <span>{course.fullCourse.lessons} lessons</span>
                  <span>{course.fullCourse.worksheets} worksheets</span>
                </div>

                <a className="beaCardButton" href={`/courses/${course.slug}`}>View Course Preview</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="trial" className="beaSection">
        <div className="beaTrialWorld">
          <div className="beaTrialText">
            <p className="beaSectionKicker">After paid {beaBrand.shortName} Level Test</p>
            <h2>Unlock a tiny trial lesson before the full course</h2>
            <p>
              The short trial lesson is the appetiser. It is matched to the learner pathway after the paid {beaBrand.shortName} Level Test,
              giving customers a quick taste before they buy the full course.
            </p>
            <ol className="beaFlowSteps">
              <li><span>1</span> Preview course snippets</li>
              <li><span>2</span> Pay and complete the Level Test</li>
              <li><span>3</span> Unlock the mapped mini lesson</li>
              <li><span>4</span> Pay and start the full course</li>
            </ol>
          </div>

          <div className={`beaTrialCard ${recommendedCourse.colourClass}`}>
            <span className="beaTrialBadge">{recommendedCourse.level} trial</span>
            <h3>{recommendedCourse.appetiserLesson.title}</h3>
            <p>{recommendedCourse.appetiserLesson.contentPreview}</p>
            <ul>
              <li>{recommendedCourse.appetiserLesson.durationMinutes} minutes</li>
              <li>{recommendedCourse.appetiserLesson.objective}</li>
              <li>Unlocks only after paid and completed Level Test</li>
            </ul>
            <a className="beaPrimaryButton wide" href={`/appetiser/unlock?courseId=${recommendedCourse.id}`}>{beaBrand.cta.trial}</a>
            <a className="beaOutlineButton wide" href={recommendedCourse.fullCourse.checkoutPath}>{beaBrand.cta.fullCourse}</a>
          </div>
        </div>
      </section>

      <footer className="beaFooter">
        <p>{beaBrand.certificate.disclaimer}</p>
      </footer>

      {previewModal && (
        <div className="beaModalOverlay" role="dialog" aria-modal="true" aria-label="Course preview">
          <div className="beaModalCard">
            <button type="button" className="beaCloseButton" onClick={() => setPreviewModal(null)}>×</button>
            <div className="beaModalIcon">{previewModal.course.previewSnippets[previewModal.snippetIndex].icon}</div>
            <span className="beaLevelChip">{previewModal.course.level}</span>
            <h2>{previewModal.course.previewSnippets[previewModal.snippetIndex].title}</h2>
            <p>{previewModal.course.previewSnippets[previewModal.snippetIndex].description}</p>
            <div className="beaSampleBox">
              {previewModal.course.previewSnippets[previewModal.snippetIndex].sample}
            </div>
            <p className="beaFinePrint">
              This is a public preview. The full lesson unlocks after paid Level Test, pathway mapping,
              short trial access and full-course payment.
            </p>
            <div className="beaHeroButtons">
              <a className="beaPrimaryButton" href="/checkout/placement?source=preview-modal">{beaBrand.cta.primary}</a>
              <button type="button" className="beaOutlineButton" onClick={() => setPreviewModal(null)}>Continue Browsing</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
