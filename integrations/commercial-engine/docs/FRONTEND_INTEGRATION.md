# Frontend Integration

Copy `frontend/beaLeaApiClient.ts` into the frontend app, then wire pages to these flows:

## Course catalogue

Use:

```ts
beaApi.courses()
beaApi.products()
```

## Paid Level Test

Use:

```ts
beaApi.createCheckout(parentId, { productId: 'PROD-PLACEMENT', learnerId })
beaApi.confirmMockPayment(parentId, orderId) // demo only
beaApi.placementQuestions(learnerId)
beaApi.submitPlacement(learnerId, answers)
```

## Course purchase and enrolment

Use:

```ts
beaApi.createCheckout(parentId, { productId: 'PROD-BEA-A2', learnerId })
beaApi.confirmMockPayment(parentId, orderId) // demo only
beaApi.learnerDashboard(learnerId)
```

## Lesson completion

Use:

```ts
beaApi.lmsLesson(learnerId, lessonId)
beaApi.resourceAccess(learnerId, resourceId)
beaApi.submitActivity(learnerId, { activityId, answer })
beaApi.submitProduction(learnerId, lessonId, { title, text, fileUrl })
```

In production, replace mock payment confirmation with real payment webhook logic.
