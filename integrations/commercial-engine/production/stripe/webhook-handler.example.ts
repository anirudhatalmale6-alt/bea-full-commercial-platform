/*
Production payment webhook pattern.
Replace the demo /api/payments/confirm endpoint with a real payment provider webhook.

Required transaction after checkout.session.completed:
1. Mark order paid.
2. Create payment record.
3. Create entitlement.
4. If product is course or bundle, create enrolment automatically.
5. If product is placement test, unlock placement test for the learner.
6. If product is toolkit, unlock protected downloads.
*/

export async function handlePaidOrder({ order, product, learnerId, tx }: any) {
  await tx.order.update({ where: { id: order.id }, data: { status: 'paid', paidAt: new Date() } });

  if (product.type === 'placement_test') {
    await tx.entitlement.create({ data: { userId: learnerId, productType: 'placement_access', targetId: 'PLACEMENT', sourceOrderId: order.id } });
  }

  if (product.type === 'course') {
    await tx.entitlement.create({ data: { userId: learnerId, productType: 'course_access', targetId: product.courseId, sourceOrderId: order.id } });
    await tx.enrolment.create({ data: { userId: learnerId, courseId: product.courseId, sourceOrderId: order.id, currentLessonId: `${product.courseId}-L01` } });
  }

  if (product.type === 'bundle') {
    for (const courseId of product.courseIds) {
      await tx.entitlement.create({ data: { userId: learnerId, productType: 'course_access', targetId: courseId, sourceOrderId: order.id } });
      await tx.enrolment.create({ data: { userId: learnerId, courseId, sourceOrderId: order.id, currentLessonId: `${courseId}-L01` } });
    }
  }

  if (product.type === 'toolkit') {
    await tx.entitlement.create({ data: { userId: learnerId, productType: 'toolkit_access', targetId: 'ALL', sourceOrderId: order.id } });
  }
}
