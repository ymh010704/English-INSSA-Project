// DB 만들면 바꿀 예정
let tempPosts = [
    { 
        id: 1, 
        user: "관리자", 
        title: "자유게시판 첫 글!", 
        content: "안녕하세요 회원님들!", 
        date: "2026-05-16",
        likes: 5,
        dislikes: 0,
        comments: [
            { id: 2, user: "민혁", content: "반가워요!", date: "2026-05-16" },
            { id: 3, user: "경현", content: "ㅎㅇㅎㅇ", date: "2026-05-16" }
        ],
        likedUsers: [],    //  좋아요 누른 유저 목록
        dislikedUsers: []  //  싫어요 누른 유저 목록
    }
];

const getAllPosts = async () => {
    return tempPosts;
};

const createNewPost = async (postData) => {
    const newPost = {
        id: tempPosts.length + 1,
        user: postData.user || "익명 유저",
        title: postData.title,
        content: postData.content,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        dislikes: 0,
        comments: [],
        likedUsers: [],
        dislikedUsers: []
    };
    tempPosts.unshift(newPost); 
    return newPost;
};

// 좋아요와 싫어요 모두 유저 정보를 완벽히 인지해서 중복 차단하는 로직
const updateLike = async (id, type, username) => {
    const post = tempPosts.find(p => p.id === id);
    if (!post) throw new Error("게시글을 찾을 수 없습니다.");

    // 안전장치: 혹시라도 배열이 없으면 빈 배열로 만들어주기
    if (!post.likedUsers) post.likedUsers = [];
    if (!post.dislikedUsers) post.dislikedUsers = [];

    // 유저 식별자 지정 (체크용)
    const activeUser = username || "AnonymousUser";

    if (type === 'like') {
        // 1. 이미 싫어요를 누른 유저라면 좋아요 차단
        if (post.dislikedUsers.includes(activeUser)) {
            throw new Error("이미 싫어요를 누른 게시글입니다.");
        }

        const userIndex = post.likedUsers.indexOf(activeUser);
        if (userIndex === -1) {
            // 명단에 없으면 좋아요 +1 및 명단 추가
            post.likes = (post.likes || 0) + 1;
            post.likedUsers.push(activeUser);
        } else {
            // 명단에 이미 있으면 좋아요 취소 (-1) 및 명단 해제
            post.likes = Math.max(0, (post.likes || 0) - 1);
            post.likedUsers.splice(userIndex, 1);
        }
    } else if (type === 'dislike') {
        // 2. 이미 좋아요를 누른 유저라면 싫어요 차단
        if (post.likedUsers.includes(activeUser)) {
            throw new Error("이미 좋아요를 누른 게시글입니다.");
        }

        const userIndex = post.dislikedUsers.indexOf(activeUser);
        if (userIndex === -1) {
            // 명단에 없으면 싫어요 +1 및 명단 추가
            post.dislikes = (post.dislikes || 0) + 1;
            post.dislikedUsers.push(activeUser);
        } else {
            // 명단에 이미 있으면 싫어요 취소 (-1) 및 명단 해제
            post.dislikes = Math.max(0, (post.dislikes || 0) - 1);
            post.dislikedUsers.splice(userIndex, 1);
        }
    }
    return post;
};

const addComment = async (postId, content, username) => {
    const post = tempPosts.find(p => p.id === postId);
    if (!post) throw new Error("게시글을 찾을 수 없습니다.");
    if (!post.comments) post.comments = [];

    const newComment = {
        id: post.comments.length + 1,
        user: username || "익명",
        content: content,
        date: new Date().toISOString().split('T')[0]
    };

    post.comments.push(newComment);
    return post;
};

export {
    getAllPosts,
    createNewPost,
    updateLike,
    addComment
};