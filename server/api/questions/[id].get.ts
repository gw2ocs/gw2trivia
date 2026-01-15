import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm';

export default eventHandler(async event => {
    const { id } = getRouterParams(event);
    console.log("Fetching question with id:", id);
    return await db.query.questions.findFirst({
        where: eq(schema.questions.id, id),
        with: {
            user: true,
            tips: true,
            answers: true,
            imagesQuestionsRels: {
                with: {
                    image: true,
                }
            },
            categoriesQuestionsRels: {
                with: {
                    category: true,
                }
            },
        },
    });
})