module.exports = async (payload, helpers) => {
	const { schema, table, id, data } = payload;
	if (schema !== 'gw2trivia' || !['stats', 'questions'].includes(table)) return;
	if (table === 'stats' && data.guild_snowflake !== '656508733412605962') return;
	let user_id = '';
	if (data.user_id) {
		user_id = data.user_id;
	} else if (data.user_snowflake) {
		const { rows } = await helpers.query(`SELECT id FROM gw2trivia.users WHERE discord_id = '${data.user_snowflake}';`);
		if (rows.length > 0) {
			user_id = Number(rows[0].id);
		}
	}
	if (!user_id) {
		console.log(`Achievements: No user found for ${table}, skipping`, data);
		return;
	}
	// TODO : get current user id
	let query = `SELECT * FROM gw2trivia.achievements WHERE triggered_on = '${table}' AND id NOT IN (SELECT achievement_id FROM gw2trivia.achievements_users_rel WHERE user_id = ${user_id});`;
	const { rows: achievements } = await helpers.query(query);
	let sub_user_id = '';
	if (data.user_id) {
		sub_user_id = data.user_id;
	} else if (data.user_snowflake) {
		sub_user_id = `'${data.user_snowflake}'`;
	}
	for (let i = 0, imax = achievements.length ; i < imax ; i++) {
		const achievement = achievements[i];
		const { rows } = await helpers.query(achievement.query.replace('$uid', sub_user_id));
		const count = Number(rows[0].count);
		if (achievement.goal <= count) {
			console.log(`${achievement.name} validated`);
			await helpers.query(`INSERT INTO gw2trivia.achievements_users_rel (achievement_id, user_id) VALUES (${achievement.id}, ${user_id})`);
		}
	}
};
