'use client';

import { useState } from 'react';
import { beaApi } from './beaLeaApiClient';

export default function CommercialLearnerFlowExample() {
  const [log, setLog] = useState<string[]>([]);
  const [state, setState] = useState<any>({});
  const add = (line: string) => setLog((x) => [...x, line]);

  async function runPaidLevelTestFlow() {
    const parent: any = await beaApi.register({ role: 'parent', name: 'Parent Demo', email: `parent-${Date.now()}@demo.test` });
    add(`Parent created: ${parent.user.id}`);

    const child: any = await beaApi.addChild(parent.user.id, { name: 'Child Demo', age: 10, safeguardingConsent: true });
    add(`Child linked: ${child.child.id}`);

    const products: any = await beaApi.products();
    const placementProduct = products.products.find((p: any) => p.id === 'PROD-PLACEMENT');
    const checkout: any = await beaApi.createCheckout(parent.user.id, { productId: placementProduct.id, learnerId: child.child.id });
    await beaApi.confirmMockPayment(parent.user.id, checkout.order.id);
    add('Placement test paid and unlocked');

    const qs: any = await beaApi.placementQuestions(child.child.id);
    const answers = Object.fromEntries(qs.questions.map((q: any) => [q.id, ['A1', 'A2'].includes(q.level) ? 0 : 1]));
    const result: any = await beaApi.submitPlacement(child.child.id, answers);
    add(`Recommended level: ${result.attempt.recommendedLevel}`);

    const courseProduct = products.products.find((p: any) => p.type === 'course' && p.courseId === result.recommendedCourseId);
    const courseCheckout: any = await beaApi.createCheckout(parent.user.id, { productId: courseProduct.id, learnerId: child.child.id });
    await beaApi.confirmMockPayment(parent.user.id, courseCheckout.order.id);
    add(`Course purchased and learner enrolled: ${result.recommendedCourseId}`);

    const dashboard: any = await beaApi.learnerDashboard(child.child.id);
    setState({ parent: parent.user, child: child.child, dashboard, recommendedCourseId: result.recommendedCourseId });
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>BEA/BEA Commercial Flow Demo</h1>
      <button onClick={runPaidLevelTestFlow}>Run paid placement to enrolment flow</button>
      <pre>{log.join('\n')}</pre>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </main>
  );
}
