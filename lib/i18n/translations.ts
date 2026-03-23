export type Language = "en" | "vi";

export interface Translations {
  common: {
    appName: string;
    cancel: string;
    submit: string;
    understood: string;
    close: string;
    error: string;
    signIn: string;
    signOut: string;
    language: string;
    theme: string;
    light: string;
    dark: string;
    share: string;
    newChat: string;
    sendMessage: string;
    aiDisclaimer: string;
    back: string;
    home: string;
    next: string;
    confirm: string;
    or: string;
  };
  chat: {
    howCanIHelp: string;
    writing: string;
    speaking: string;
    writingDescription: string;
    speakingDescription: string;
    noMessages: string;
    typeMessage: string;
    linkCopied: string;
    collapseSidebar: string;
    toggleSidebar: string;
    expandSidebar: string;
    deleteConversation: string;
    deleteConfirmation: string;
    untitledConversation: string;
    renameConversation: string;
  };
  writing: {
    startWriting: string;
    submitExistingEssay: string;
    task1: string;
    task2: string;
    question: string;
    essay: string;
    wordCount: string;
    submit: string;
    uploadImage: string;
    dragDropImage: string;
    timerExpired: string;
    timerExpiredMessage: string;
    startTest: string;
    questionText: string;
    writeYourEssay: string;
    pasteYourEssay: string;
    minutes: string;
    selectTask: string;
    task1Description: string;
    task2Description: string;
    backConfirmation: string;
    enterQuestion: string;
    uploadedChart: string;
    taskChart: string;
  };
  speaking: {
    part1: string;
    part2: string;
    part3: string;
    startSpeaking: string;
    showText: string;
    recording: string;
    speakingFeedback: string;
    tapToSpeak: string;
    autoplay: string;
    hideText: string;
    preparingQuestion: string;
    part1Description: string;
    part2Description: string;
    part3Description: string;
  };
  feedback: {
    taskResponse: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammaticalRange: string;
    strengths: string;
    weaknesses: string;
    noWeaknesses: string;
    correction: string;
    correctedEssay: string;
    expandIdeas: string;
    alternativeApproach: string;
    alternativeDirection: string;
    alternativeEssay: string;
    improvedVersion: string;
    vocabularyExplanations: string;
    bandScore: string;
    keyChanges: string;
    overview: string;
    taskAchievement: string;
    viewSubmission: string;
    viewFeedback: string;
    original: string;
    corrected: string;
    waitingForFeedback: string;
    overall: string;
    assessmentFailed: string;
    assessmentPartialError: string;
    retry: string;
    viewBandDescriptors: string;
    bandDescriptors: string;
  };
  onboarding: {
    chooseLanguage: string;
    languageRecommendation: string;
    continueWithGoogle: string;
    continueWithoutAccount: string;
    signInBenefits: string;
    welcome: string;
    recommended: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      appName: "Examinai",
      cancel: "Cancel",
      submit: "Submit",
      understood: "Understood",
      close: "Close",
      error: "Something went wrong. Please try again.",
      signIn: "Sign In",
      signOut: "Sign Out",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      share: "Share",
      newChat: "New Chat",
      sendMessage: "Send Message",
      aiDisclaimer: "AI-generated feedback may be inaccurate. Only use it as a guide.",
      back: "Back",
      home: "Home",
      next: "Next",
      confirm: "Confirm",
      or: "or",
    },
    chat: {
      howCanIHelp: "How can I help with your IELTS today?",
      writing: "Writing",
      speaking: "Speaking",
      writingDescription: "Take a timed test or submit an existing essay for detailed feedback.",
      speakingDescription: "Practice with an AI examiner that asks questions and gives real-time feedback.",
      noMessages: "No messages yet",
      typeMessage: "Send a message...",
      linkCopied: "Link copied to clipboard!",
      collapseSidebar: "Collapse sidebar",
      toggleSidebar: "Toggle sidebar",
      expandSidebar: "Expand sidebar",
      deleteConversation: "Delete Conversation",
      deleteConfirmation: "Are you sure you want to delete this conversation? This action cannot be undone.",
      untitledConversation: "Untitled Conversation",
      renameConversation: "Rename Conversation",
    },
    writing: {
      startWriting: "Start Writing",
      submitExistingEssay: "Submit Existing Essay",
      task1: "Task 1",
      task2: "Task 2",
      question: "Question",
      essay: "Essay",
      wordCount: "Word Count",
      submit: "Submit",
      uploadImage: "Upload Image",
      dragDropImage: "Drag and drop an image, or click to upload",
      timerExpired: "Time's Up!",
      timerExpiredMessage: "Your time has expired. Your essay has been submitted automatically.",
      startTest: "Start",
      questionText: "Question",
      writeYourEssay: "Write your essay here...",
      pasteYourEssay: "Paste your essay here...",
      minutes: "minutes",
      selectTask: "Select Task Type",
      task1Description: "Describe visual information (graph, chart, table, map, or diagram)",
      task2Description: "Respond to a point of view, argument, or problem",
      backConfirmation: "Your progress will be lost. Are you sure you want to go back?",
      enterQuestion: "Enter the essay question...",
      uploadedChart: "Uploaded chart",
      taskChart: "Task chart",
    },
    speaking: {
      part1: "Part 1",
      part2: "Part 2",
      part3: "Part 3",
      startSpeaking: "Start",
      showText: "Show Text",
      recording: "Recording...",
      speakingFeedback: "Feedback",
      tapToSpeak: "Tap to speak",
      autoplay: "Autoplay audio",
      hideText: "Hide Text",
      preparingQuestion: "Preparing question...",
      part1Description: "Answer questions about yourself",
      part2Description: "Given a topic card, prepare for 1 minute, then speak for 1-2 minutes",
      part3Description: "Discuss abstract issues/ideas related to Part 2's topic",
    },
    feedback: {
      taskResponse: "Task Response",
      coherenceCohesion: "Coherence & Cohesion",
      lexicalResource: "Lexical Resource",
      grammaticalRange: "Grammatical Range & Accuracy",
      strengths: "Strengths",
      weaknesses: "Areas for Improvement",
      noWeaknesses: "None. Well done!",
      correction: "Correction",
      correctedEssay: "Corrected Essay",
      expandIdeas: "Expand Your Ideas",
      alternativeApproach: "Alternative Approach",
      alternativeDirection: "Direction",
      alternativeEssay: "Alternative Essay",
      improvedVersion: "Improved Version",
      vocabularyExplanations: "Vocabulary",
      bandScore: "Band Score",
      keyChanges: "Key Changes",
      overview: "Overview",
      taskAchievement: "Task Achievement",
      viewSubmission: "View Submission",
      viewFeedback: "View Feedback",
      original: "Original",
      corrected: "Corrected",
      waitingForFeedback: "Waiting for feedback...",
      overall: "Overall",
      assessmentFailed: "Assessment Failed",
      assessmentPartialError: "Some feedback could not be generated.",
      retry: "Retry",
      viewBandDescriptors: "View Band Descriptors",
      bandDescriptors: "Band Descriptors",
    },
    onboarding: {
      chooseLanguage: "Choose Your Language",
      languageRecommendation: "We recommend using English for the best results.",
      continueWithGoogle: "Continue with Google",
      continueWithoutAccount: "Continue without an account",
      signInBenefits: "Sign in to save your progress, track your scores, and access your practice history across devices.",
      welcome: "Welcome to Examinai",
      recommended: "Recommended",
    },
  },
  vi: {
    common: {
      appName: "Examinai",
      cancel: "Hủy",
      submit: "Gửi",
      understood: "Đã hiểu",
      close: "Đóng",
      error: "Đã xảy ra lỗi. Vui lòng thử lại.",
      signIn: "Đăng nhập",
      signOut: "Đăng xuất",
      language: "Ngôn ngữ",
      theme: "Giao diện",
      light: "Sáng",
      dark: "Tối",
      share: "Chia sẻ",
      newChat: "Trò chuyện mới",
      sendMessage: "Gửi tin nhắn",
      aiDisclaimer: "Phản hồi từ AI mang tính chất tham khảo và có thể không chính xác.",
      back: "Quay lại",
      home: "Trang chủ",
      next: "Tiếp theo",
      confirm: "Xác nhận",
      or: "hoặc",
    },
    chat: {
      howCanIHelp: "Mình có thể giúp gì cho bạn về IELTS?",
      writing: "Viết",
      speaking: "Nói",
      writingDescription: "Làm bài thi thử hoặc nộp bài viết có sẵn để nhận phản hồi chi tiết.",
      speakingDescription: "Luyện tập với giám khảo AI, trả lời và nhận phản hồi ngay lập tức.",
      noMessages: "Chưa có tin nhắn",
      typeMessage: "Gửi tin nhắn...",
      linkCopied: "Đã sao chép liên kết!",
      collapseSidebar: "Thu gọn thanh bên",
      toggleSidebar: "Mở/đóng thanh bên",
      expandSidebar: "Mở rộng thanh bên",
      deleteConversation: "Xóa cuộc trò chuyện",
      deleteConfirmation: "Bạn có chắc muốn xóa cuộc trò chuyện này? Sau khi xóa sẽ không thể khôi phục lại.",
      untitledConversation: "Chưa đặt tên",
      renameConversation: "Đổi tên cuộc trò chuyện",
    },
    writing: {
      startWriting: "Bắt đầu viết",
      submitExistingEssay: "Gửi bài viết có sẵn",
      task1: "Task 1",
      task2: "Task 2",
      question: "Câu hỏi",
      essay: "Bài viết",
      wordCount: "Số từ",
      submit: "Nộp bài",
      uploadImage: "Tải ảnh lên",
      dragDropImage: "Kéo thả ảnh, hoặc nhấn để tải lên",
      timerExpired: "Hết giờ!",
      timerExpiredMessage: "Thời gian đã hết. Bài viết của bạn đã được nộp tự động.",
      startTest: "Bắt đầu",
      questionText: "Câu hỏi",
      writeYourEssay: "Viết bài ở đây...",
      pasteYourEssay: "Dán bài viết ở đây...",
      minutes: "phút",
      selectTask: "Chọn task",
      task1Description: "Mô tả thông tin trực quan (biểu đồ, bảng, bản đồ hoặc sơ đồ)",
      task2Description: "Phản hồi quan điểm, lập luận hoặc vấn đề",
      backConfirmation: "Tiến trình sẽ bị mất. Bạn có chắc muốn quay lại?",
      enterQuestion: "Nhập câu hỏi bài viết...",
      uploadedChart: "Biểu đồ đã tải lên",
      taskChart: "Biểu đồ bài thi",
    },
    speaking: {
      part1: "Part 1",
      part2: "Part 2",
      part3: "Part 3",
      startSpeaking: "Bắt đầu",
      showText: "Xem chữ",
      recording: "Đang ghi âm...",
      speakingFeedback: "Nhận xét",
      tapToSpeak: "Nhấn để nói",
      autoplay: "Tự động phát âm thanh",
      hideText: "Ẩn chữ",
      preparingQuestion: "Đang chuẩn bị câu hỏi...",
      part1Description: "Trả lời câu hỏi về bản thân",
      part2Description: "Nhận chủ đề, chuẩn bị 1 phút, sau đó nói 1-2 phút",
      part3Description: "Thảo luận vấn đề trừu tượng liên quan đến chủ đề Part 2",
    },
    feedback: {
      taskResponse: "Đáp ứng yêu cầu",
      coherenceCohesion: "Độ mạch lạc",
      lexicalResource: "Từ vựng",
      grammaticalRange: "Ngữ pháp",
      strengths: "Điểm mạnh",
      weaknesses: "Cần cải thiện",
      noWeaknesses: "Không có. Bạn làm tốt lắm!",
      correction: "Chỉnh sửa",
      correctedEssay: "Bài viết đã sửa",
      expandIdeas: "Phát triển ý tưởng",
      alternativeApproach: "Cách tiếp cận khác",
      alternativeDirection: "Hướng đi",
      alternativeEssay: "Bài viết thay thế",
      improvedVersion: "Bản cải thiện",
      vocabularyExplanations: "Từ vựng",
      bandScore: "Điểm",
      keyChanges: "Thay đổi chính",
      overview: "Tổng quan",
      taskAchievement: "Mức độ hoàn thành",
      viewSubmission: "Xem bài viết",
      viewFeedback: "Xem nhận xét",
      original: "Bài gốc",
      corrected: "Đã sửa",
      waitingForFeedback: "Đang chờ nhận xét...",
      overall: "Tổng",
      assessmentFailed: "Chấm bài thất bại",
      assessmentPartialError: "Một số nhận xét không thể tạo được.",
      retry: "Thử lại",
      viewBandDescriptors: "Xem tiêu chí chấm điểm",
      bandDescriptors: "Tiêu chí chấm điểm",
    },
    onboarding: {
      chooseLanguage: "Chọn ngôn ngữ",
      languageRecommendation: "Nên dùng tiếng Anh để có kết quả tốt nhất.",
      continueWithGoogle: "Tiếp tục với Google",
      continueWithoutAccount: "Tiếp tục không cần tài khoản",
      signInBenefits: "Đăng nhập để lưu tiến trình, theo dõi điểm số và xem lại lịch sử luyện tập trên mọi thiết bị.",
      welcome: "Chào mừng đến với Examinai",
      recommended: "Đề xuất",
    },
  },
};
