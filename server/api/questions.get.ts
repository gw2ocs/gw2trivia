import { db, schema } from 'hub:db'
import { count, asc, desc } from 'drizzle-orm';

export default eventHandler(async event => {
    let { pagination = false, sorting = [] } = getQuery(event);
    const options: { offset?: number; limit?: number, orderBy?: any[] } = {};
    if (pagination) {
        const { pageIndex = 0, pageSize = 10 } = JSON.parse(pagination as string);
        options.offset = pageIndex * pageSize;
        options.limit = pageSize;
    }
    if (sorting) {
        if (!Array.isArray(sorting)) {
            sorting = [sorting];
        }
        const orderBy = [];
        for (const sort of sorting as any[]) {
            const sortObj = JSON.parse(sort as string);
            const column = (schema.questions as any)[sortObj.id];
            if (column) {
                orderBy.push(sortObj.desc ? desc(column) : asc(column));
            }
        }
        if (orderBy.length > 0) {
            options.orderBy = orderBy;
        }
    }
    const questionsCount = await db.select({ count: count() }).from(schema.questions);
    const questions = await db.query.questions.findMany({
        with: {
            user: true,
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
        ...options,
    });
    return {
        questions,
        count: questionsCount[0].count,
    };
})