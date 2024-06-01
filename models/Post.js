// 전체 게시글 조회
exports.findAll = async () => {
    try {
        const db = await require('../main').connection(); 

        let sql = 'SELECT * FROM post';
        let [rows] = await db.query(sql); 
        return rows;

    } catch (error) {
        console.error("Post.findAll() 쿼리 실행 중 오류:", error);
    }
};

// findById
exports.findByPostId = async (postId) => {
    try {
        const db = await require('../main').connection(); 

        let sql = `SELECT *, 
            (SELECT theme_name FROM theme WHERE theme_id = p.theme_id) AS theme_name,
            (SELECT COUNT(*) FROM bookmark WHERE post_id = p.post_id) AS bookmark_count,
            (SELECT COUNT(*) FROM post_like WHERE post_id = p.post_id) AS like_count
            FROM post p WHERE post_id = ?`;
        const [rows] = await db.query(sql, [postId]);
        return rows.length > 0 ? rows[0] : null;

    } catch (error) {
        console.error("Post.findByPostId() 쿼리 실행 중 오류:", error);
    }
};

exports.findByMemberId = async (memberId) => {
    try {
        const db = await require('../main').connection(); 

        let sql = 'SELECT * FROM post WHERE member_id = ?';
        const [rows] = await db.query(sql, [memberId]);
        return rows.length > 0 ? rows[0] : null;

    } catch (error) {
        console.error("Post.findByMemberId() 쿼리 실행 중 오류:", error);
    }
};

exports.create = async (post) => {
    try {
        const db = await require('../main').connection(); 

        let sql = `
            INSERT INTO post (member_id, theme_id, post_title, post_content, hashtags) 
            VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.query(sql, [
            post.member_id,
            post.theme_id,
            post.post_title,
            post.post_content,
            post.hashtags,
        ]);
        return result.insertId;

    } catch (error) {
        console.error("Post.registerPost() 쿼리 실행 중 오류:", error);
    }
};

exports.update = async (post) => {
    try {
        const db = await require('../main').connection(); 

        let sql = `
            UPDATE post 
            SET theme_id = ?,
                post_title = ?,
                post_content = ?,
                hashtags = ?,
                updated_at =  NOW()
            WHERE post_id = ?;
            `;
        await db.query(sql, [
            post.theme_id,
            post.post_title,
            post.post_content,
            post.hashtags,
            post.post_id
        ]);
        return;

    } catch (error) {
        console.error("Post.registerPost() 쿼리 실행 중 오류:", error);
    }
}

exports.delete = async (postId) => {
    try {
        const db = await require('../main').connection(); 

        let sql = `DELETE FROM post WHERE post_id = ?`;
        await db.query(sql, [postId]);
        return;

    } catch (error) {
        console.error("Post.registerPost() 쿼리 실행 중 오류:", error);
    }
}


// 조회수 증가 
exports.increasedViews = async (postId) => {
    try {
        const db = await require('../main').connection(); 

        let sql = 'UPDATE post SET views = views + 1 WHERE post_id = ?';
        await db.query(sql, [postId]);

    } catch (error) {
        console.error("Post.increasedViews() 쿼리 실행 중 오류:", error);
    }
};

// 검색
exports.findByQueryAndSortBy = async (query, sortBy) => {
    try {
        const db = await require('../main').connection();        

        let sql = `
            SELECT 
                p.post_id,
                p.post_title,
                p.post_content,
                p.hashtags,
                p.theme_id,
                p.created_at,
                p.views,
                m.nickname,
                m.picture_base64,
                (SELECT COUNT(*) FROM comment WHERE post_id = p.post_id) AS comment_count,
                (SELECT COUNT(*) FROM bookmark WHERE post_id = p.post_id) AS bookmark_count,
                (SELECT COUNT(*) FROM post_like WHERE post_id = p.post_id) AS like_count,
                (SELECT image_base64 FROM post_image WHERE post_id = p.post_id LIMIT 1) AS thumbnail
            FROM 
                post p 
            JOIN 
                member m ON p.member_id = m.member_id
            WHERE 
                CONCAT(p.post_title, p.post_content, p.hashtags) LIKE ?
            ORDER BY
            `;

        switch (sortBy) {
            case 'date':
                sql = sql + `p.created_at DESC`;
                break;
            case 'views':
                sql = sql + `p.views DESC`;
                break;
            case 'comments':
                sql = sql + `(SELECT COUNT(*) FROM comment WHERE post_id = p.post_id) DESC`;
                break;
            case 'likes':
                sql = sql + `(SELECT COUNT(*) FROM post_like WHERE post_id = p.post_id) DESC`;
                break;
            case 'bookmarks':
                sql = sql + `(SELECT COUNT(*) FROM bookmark WHERE post_id = p.post_id) DESC`;
                break;
            default:
                sql = sql + `p.created_at DESC`;
                break;
        }
        const [rows] = await db.query(sql, [`%${query}%`]);
        return rows.length > 0 ? rows : null;

    } catch (error) {
        console.error("Post.findByQueryAndSortBy() 쿼리 실행 중 오류:", error);
    }
}