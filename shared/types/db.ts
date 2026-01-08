import { schema } from 'hub:db';

// Types for GET
export type User = typeof schema.users.$inferSelect;
export type Tip = typeof schema.tips.$inferSelect;
export type Image = typeof schema.images.$inferSelect;
export type Question = typeof schema.questions.$inferSelect & {
    user?: User,
    tips?: Tip[],
    imagesQuestionsRels?: {
        image: Image
    }[],
};

// Types for POST/PUT
export type NewUser = typeof schema.users.$inferInsert;
export type NewQuestion = typeof schema.questions.$inferInsert;
export type NewTip = typeof schema.tips.$inferInsert;