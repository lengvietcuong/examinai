import type { Language } from "@/lib/i18n/translations";

export interface BandDescriptor {
  band: number;
  taskResponse: string;
  coherenceCohesion: string;
  lexicalResource: string;
  grammaticalRange: string;
}

const TASK_1_BAND_DESCRIPTORS_EN: BandDescriptor[] = [
  {
    band: 9,
    taskResponse: "Fully satisfies all the requirements of the task\nClearly presents a fully developed response",
    coherenceCohesion: "Uses cohesion in such a way that it attracts no attention\nSkilfully manages paragraphing",
    lexicalResource: "Uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor errors occur only as 'slips'",
    grammaticalRange: "Uses a wide range of structures with full flexibility and accuracy; rare minor errors occur only as 'slips'",
  },
  {
    band: 8,
    taskResponse: "Covers all requirements of the task sufficiently\nPresents, highlights and illustrates key features/bullet points clearly and appropriately",
    coherenceCohesion: "Sequences information and ideas logically\nManages all aspects of cohesion well\nUses paragraphing sufficiently and appropriately",
    lexicalResource: "Uses a wide range of vocabulary fluently and flexibly to convey precise meanings\nSkilfully uses uncommon lexical items but there may be occasional inaccuracies in word choice and collocation\nProduces rare errors in spelling and/or word formation",
    grammaticalRange: "Uses a wide range of structures\nThe majority of sentences are error-free\nMakes only very occasional errors or inappropriacies",
  },
  {
    band: 7,
    taskResponse: "Covers the requirements of the task\nPresents a clear overview of main trends, differences or stages\nClearly presents and highlights key features/bullet points but could be more fully extended",
    coherenceCohesion: "Logically organises information and ideas; there is clear progression throughout\nUses a range of cohesive devices appropriately although there may be some under-/over-use",
    lexicalResource: "Uses a sufficient range of vocabulary to allow some flexibility and precision\nUses less common lexical items with some awareness of style and collocation\nMay produce occasional errors in word choice, spelling and/or word formation",
    grammaticalRange: "Uses a variety of complex structures\nProduces frequent error-free sentences\nHas good control of grammar and punctuation but may make a few errors",
  },
  {
    band: 6,
    taskResponse: "Addresses the requirements of the task\nPresents an overview with information appropriately selected\nPresents and adequately highlights key features/bullet points but details may be irrelevant, inappropriate or inaccurate",
    coherenceCohesion: "Arranges information and ideas coherently and there is a clear overall progression\nUses cohesive devices effectively, but cohesion within and/or between sentences may be faulty or mechanical\nMay not always use referencing clearly or appropriately",
    lexicalResource: "Uses an adequate range of vocabulary for the task\nAttempts to use less common vocabulary but with some inaccuracy\nMakes some errors in spelling and/or word formation, but they do not impede communication",
    grammaticalRange: "Uses a mix of simple and complex sentence forms\nMakes some errors in grammar and punctuation but they rarely reduce communication",
  },
  {
    band: 5,
    taskResponse: "Generally addresses the task; the format may be inappropriate in places\nRecounts detail mechanically with no clear overview; there may be no data to support the description\nPresents, but inadequately covers, key features/bullet points; there may be a tendency to focus on details",
    coherenceCohesion: "Presents information with some organisation but there may be a lack of overall progression\nMakes inadequate, inaccurate or over-use of cohesive devices\nMay be repetitive because of lack of referencing and substitution",
    lexicalResource: "Uses a limited range of vocabulary, but this is minimally adequate for the task\nMay make noticeable errors in spelling and/or word formation that may cause some difficulty for the reader",
    grammaticalRange: "Uses only a limited range of structures\nAttempts complex sentences but these tend to be less accurate than simple sentences\nMay make frequent grammatical errors and punctuation may be faulty; errors can cause some difficulty for the reader",
  },
  {
    band: 4,
    taskResponse: "Attempts to address the task but does not cover all key features/bullet points; the format may be inappropriate\nMay confuse key features/bullet points with detail; parts may be unclear, irrelevant, repetitive or inaccurate",
    coherenceCohesion: "Presents information and ideas but these are not arranged coherently and there is no clear progression in the response\nUses some basic cohesive devices but these may be inaccurate or repetitive",
    lexicalResource: "Uses only basic vocabulary which may be used repetitively or which may be inappropriate for the task\nHas limited control of word formation and/or spelling\nErrors may cause strain for the reader",
    grammaticalRange: "Uses only a very limited range of structures with only rare use of subordinate clauses\nSome structures are accurate but errors predominate, and punctuation is often faulty",
  },
  {
    band: 3,
    taskResponse: "Fails to address the task, which may have been completely misunderstood\nPresents limited ideas which may be largely irrelevant/repetitive",
    coherenceCohesion: "Does not organise ideas logically\nMay use a very limited range of cohesive devices, and those used may not indicate a logical relationship between ideas",
    lexicalResource: "Uses only a very limited range of words and expressions with very limited control of word formation and/or spelling\nErrors may severely distort the message",
    grammaticalRange: "Attempts sentence forms but errors in grammar and punctuation predominate and distort the meaning",
  },
  {
    band: 2,
    taskResponse: "Answer is barely related to the task",
    coherenceCohesion: "Has very little control of organisational features",
    lexicalResource: "Uses an extremely limited range of vocabulary; essentially no control of word formation and/or spelling",
    grammaticalRange: "Cannot use sentence forms except in memorised phrases",
  },
  {
    band: 1,
    taskResponse: "Answer is completely unrelated to the task",
    coherenceCohesion: "Fails to communicate any message",
    lexicalResource: "Can only use a few isolated words",
    grammaticalRange: "Cannot use sentence forms at all",
  },
];

const TASK_1_BAND_DESCRIPTORS_VI: BandDescriptor[] = [
  {
    band: 9,
    taskResponse: "Đáp ứng đầy đủ tất cả yêu cầu của đề bài\nTrình bày rõ ràng một bài viết được phát triển hoàn chỉnh",
    coherenceCohesion: "Sử dụng liên kết một cách tự nhiên đến mức không gây chú ý\nQuản lý việc phân đoạn một cách khéo léo",
    lexicalResource: "Sử dụng vốn từ vựng phong phú với khả năng kiểm soát từ vựng rất tự nhiên và tinh tế; lỗi nhỏ hiếm gặp chỉ là 'sơ suất'",
    grammaticalRange: "Sử dụng đa dạng cấu trúc ngữ pháp với độ linh hoạt và chính xác cao; lỗi nhỏ hiếm gặp chỉ là 'sơ suất'",
  },
  {
    band: 8,
    taskResponse: "Đáp ứng đầy đủ tất cả yêu cầu của đề bài\nTrình bày, nhấn mạnh và minh họa các đặc điểm chính/ý chính một cách rõ ràng và phù hợp",
    coherenceCohesion: "Sắp xếp thông tin và ý tưởng một cách logic\nQuản lý tốt mọi khía cạnh của liên kết\nSử dụng phân đoạn đầy đủ và phù hợp",
    lexicalResource: "Sử dụng vốn từ vựng phong phú một cách trôi chảy và linh hoạt để truyền đạt ý nghĩa chính xác\nSử dụng khéo léo các từ vựng ít phổ biến nhưng đôi khi có thể có sai sót trong lựa chọn từ và kết hợp từ\nHiếm khi mắc lỗi chính tả và/hoặc cấu tạo từ",
    grammaticalRange: "Sử dụng đa dạng cấu trúc ngữ pháp\nPhần lớn câu không có lỗi\nChỉ thỉnh thoảng mắc lỗi hoặc dùng từ không phù hợp",
  },
  {
    band: 7,
    taskResponse: "Đáp ứng các yêu cầu của đề bài\nTrình bày tổng quan rõ ràng về xu hướng chính, sự khác biệt hoặc các giai đoạn\nTrình bày và nhấn mạnh rõ ràng các đặc điểm chính/ý chính nhưng có thể phát triển đầy đủ hơn",
    coherenceCohesion: "Sắp xếp thông tin và ý tưởng một cách logic; có sự phát triển rõ ràng xuyên suốt\nSử dụng các phương tiện liên kết phù hợp dù có thể dùng thiếu hoặc thừa ở một số chỗ",
    lexicalResource: "Sử dụng vốn từ vựng đủ phong phú để cho phép một mức độ linh hoạt và chính xác nhất định\nSử dụng các từ vựng ít phổ biến với nhận thức nhất định về phong cách và kết hợp từ\nĐôi khi có thể mắc lỗi trong lựa chọn từ, chính tả và/hoặc cấu tạo từ",
    grammaticalRange: "Sử dụng đa dạng cấu trúc phức tạp\nThường xuyên viết câu không có lỗi\nKiểm soát ngữ pháp và dấu câu tốt nhưng có thể mắc một vài lỗi",
  },
  {
    band: 6,
    taskResponse: "Đáp ứng các yêu cầu của đề bài\nTrình bày tổng quan với thông tin được chọn lọc phù hợp\nTrình bày và nhấn mạnh đầy đủ các đặc điểm chính/ý chính nhưng chi tiết có thể không liên quan, không phù hợp hoặc không chính xác",
    coherenceCohesion: "Sắp xếp thông tin và ý tưởng mạch lạc và có sự phát triển tổng thể rõ ràng\nSử dụng các phương tiện liên kết hiệu quả, nhưng liên kết trong và/hoặc giữa các câu có thể bị lỗi hoặc máy móc\nKhông phải lúc nào cũng sử dụng phép quy chiếu rõ ràng hoặc phù hợp",
    lexicalResource: "Sử dụng vốn từ vựng đủ cho yêu cầu đề bài\nCố gắng sử dụng từ vựng ít phổ biến nhưng đôi khi không chính xác\nMắc một số lỗi chính tả và/hoặc cấu tạo từ, nhưng không cản trở giao tiếp",
    grammaticalRange: "Sử dụng kết hợp cả câu đơn giản và phức tạp\nMắc một số lỗi ngữ pháp và dấu câu nhưng hiếm khi ảnh hưởng đến giao tiếp",
  },
  {
    band: 5,
    taskResponse: "Nhìn chung đáp ứng đề bài; định dạng có thể không phù hợp ở một số chỗ\nKể lại chi tiết một cách máy móc mà không có tổng quan rõ ràng; có thể thiếu dữ liệu hỗ trợ mô tả\nTrình bày nhưng không đầy đủ các đặc điểm chính/ý chính; có thể có xu hướng tập trung vào chi tiết",
    coherenceCohesion: "Trình bày thông tin có tổ chức nhưng có thể thiếu sự phát triển tổng thể\nSử dụng các phương tiện liên kết không đầy đủ, không chính xác hoặc quá nhiều\nCó thể lặp lại do thiếu phép quy chiếu và thay thế",
    lexicalResource: "Sử dụng vốn từ vựng hạn chế, nhưng đủ tối thiểu cho yêu cầu đề bài\nCó thể mắc lỗi chính tả và/hoặc cấu tạo từ đáng chú ý, có thể gây khó khăn cho người đọc",
    grammaticalRange: "Chỉ sử dụng phạm vi cấu trúc hạn chế\nCố gắng viết câu phức nhưng thường kém chính xác hơn câu đơn\nCó thể thường xuyên mắc lỗi ngữ pháp và dấu câu có thể sai; lỗi có thể gây khó khăn cho người đọc",
  },
  {
    band: 4,
    taskResponse: "Cố gắng đáp ứng đề bài nhưng không bao quát tất cả đặc điểm chính/ý chính; định dạng có thể không phù hợp\nCó thể nhầm lẫn đặc điểm chính/ý chính với chi tiết; một số phần có thể không rõ ràng, không liên quan, lặp lại hoặc không chính xác",
    coherenceCohesion: "Trình bày thông tin và ý tưởng nhưng không sắp xếp mạch lạc và không có sự phát triển rõ ràng\nSử dụng một số phương tiện liên kết cơ bản nhưng có thể không chính xác hoặc lặp lại",
    lexicalResource: "Chỉ sử dụng từ vựng cơ bản, có thể lặp đi lặp lại hoặc không phù hợp với yêu cầu đề bài\nKiểm soát hạn chế cấu tạo từ và/hoặc chính tả\nLỗi có thể gây khó khăn cho người đọc",
    grammaticalRange: "Chỉ sử dụng phạm vi cấu trúc rất hạn chế, hiếm khi dùng mệnh đề phụ\nMột số cấu trúc chính xác nhưng lỗi chiếm phần lớn, dấu câu thường sai",
  },
  {
    band: 3,
    taskResponse: "Không đáp ứng đề bài, có thể đã hiểu sai hoàn toàn\nTrình bày ý tưởng hạn chế, phần lớn có thể không liên quan/lặp lại",
    coherenceCohesion: "Không sắp xếp ý tưởng một cách logic\nCó thể sử dụng rất ít phương tiện liên kết, và những phương tiện được dùng có thể không thể hiện mối quan hệ logic giữa các ý",
    lexicalResource: "Chỉ sử dụng phạm vi từ ngữ và biểu đạt rất hạn chế, kiểm soát cấu tạo từ và/hoặc chính tả rất kém\nLỗi có thể làm sai lệch nghiêm trọng thông điệp",
    grammaticalRange: "Cố gắng viết câu nhưng lỗi ngữ pháp và dấu câu chiếm phần lớn và làm sai lệch ý nghĩa",
  },
  {
    band: 2,
    taskResponse: "Câu trả lời hầu như không liên quan đến đề bài",
    coherenceCohesion: "Kiểm soát rất kém các đặc điểm tổ chức",
    lexicalResource: "Sử dụng phạm vi từ vựng cực kỳ hạn chế; về cơ bản không kiểm soát được cấu tạo từ và/hoặc chính tả",
    grammaticalRange: "Không thể sử dụng cấu trúc câu ngoại trừ các cụm từ đã học thuộc",
  },
  {
    band: 1,
    taskResponse: "Câu trả lời hoàn toàn không liên quan đến đề bài",
    coherenceCohesion: "Không truyền đạt được bất kỳ thông điệp nào",
    lexicalResource: "Chỉ có thể sử dụng một vài từ rời rạc",
    grammaticalRange: "Hoàn toàn không thể sử dụng cấu trúc câu",
  },
];

const TASK_2_BAND_DESCRIPTORS_EN: BandDescriptor[] = [
  {
    band: 9,
    taskResponse: "Fully addresses all parts of the task\nPresents a fully developed position in answer to the question with relevant, fully extended and well supported ideas",
    coherenceCohesion: "Uses cohesion in such a way that it attracts no attention\nSkilfully manages paragraphing",
    lexicalResource: "Uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor errors occur only as 'slips'",
    grammaticalRange: "Uses a wide range of structures with full flexibility and accuracy; rare minor errors occur only as 'slips'",
  },
  {
    band: 8,
    taskResponse: "Sufficiently addresses all parts of the task\nPresents a well-developed response to the question with relevant, extended and supported ideas",
    coherenceCohesion: "Sequences information and ideas logically\nManages all aspects of cohesion well\nUses paragraphing sufficiently and appropriately",
    lexicalResource: "Uses a wide range of vocabulary fluently and flexibly to convey precise meanings\nSkilfully uses uncommon lexical items but there may be occasional inaccuracies in word choice and collocation\nProduces rare errors in spelling and/or word formation",
    grammaticalRange: "Uses a wide range of structures\nThe majority of sentences are error-free\nMakes only very occasional errors or inappropriacies",
  },
  {
    band: 7,
    taskResponse: "Addresses all parts of the task\nPresents a clear position throughout the response\nPresents, extends and supports main ideas, but there may be a tendency to over-generalise and/or supporting ideas may lack focus",
    coherenceCohesion: "Logically organises information and ideas; there is clear progression throughout\nUses a range of cohesive devices appropriately although there may be some under-/over-use\nPresents a clear central topic within each paragraph",
    lexicalResource: "Uses a sufficient range of vocabulary to allow some flexibility and precision\nUses less common lexical items with some awareness of style and collocation\nMay produce occasional errors in word choice, spelling and/or word formation",
    grammaticalRange: "Uses a variety of complex structures\nProduces frequent error-free sentences\nHas good control of grammar and punctuation but may make a few errors",
  },
  {
    band: 6,
    taskResponse: "Addresses all parts of the task although some parts may be more fully covered than others\nPresents a relevant position although the conclusions may become unclear or repetitive\nPresents relevant main ideas but some may be inadequately developed/unclear",
    coherenceCohesion: "Arranges information and ideas coherently and there is a clear overall progression\nUses cohesive devices effectively, but cohesion within and/or between sentences may be faulty or mechanical\nMay not always use referencing clearly or appropriately\nUses paragraphing, but not always logically",
    lexicalResource: "Uses an adequate range of vocabulary for the task\nAttempts to use less common vocabulary but with some inaccuracy\nMakes some errors in spelling and/or word formation, but they do not impede communication",
    grammaticalRange: "Uses a mix of simple and complex sentence forms\nMakes some errors in grammar and punctuation but they rarely reduce communication",
  },
  {
    band: 5,
    taskResponse: "Addresses the task only partially; the format may be inappropriate in places\nExpresses a position but the development is not always clear and there may be no conclusions drawn\nPresents some main ideas but these are limited and not sufficiently developed; there may be irrelevant detail",
    coherenceCohesion: "Presents information with some organisation but there may be a lack of overall progression\nMakes inadequate, inaccurate or over-use of cohesive devices\nMay be repetitive because of lack of referencing and substitution\nMay not write in paragraphs, or paragraphing may be inadequate",
    lexicalResource: "Uses a limited range of vocabulary, but this is minimally adequate for the task\nMay make noticeable errors in spelling and/or word formation that may cause some difficulty for the reader",
    grammaticalRange: "Uses only a limited range of structures\nAttempts complex sentences but these tend to be less accurate than simple sentences\nMay make frequent grammatical errors and punctuation may be faulty; errors can cause some difficulty for the reader",
  },
  {
    band: 4,
    taskResponse: "Responds to the task only in a minimal way or the answer is tangential; the format may be inappropriate\nPresents a position but this is unclear\nPresents some main ideas but these are difficult to identify and may be repetitive, irrelevant or not well supported",
    coherenceCohesion: "Presents information and ideas but these are not arranged coherently and there is no clear progression in the response\nUses some basic cohesive devices but these may be inaccurate or repetitive\nMay not write in paragraphs or their use may be confusing",
    lexicalResource: "Uses only basic vocabulary which may be used repetitively or which may be inappropriate for the task\nHas limited control of word formation and/or spelling; errors may cause strain for the reader",
    grammaticalRange: "Uses only a very limited range of structures with only rare use of subordinate clauses\nSome structures are accurate but errors predominate, and punctuation is often faulty",
  },
  {
    band: 3,
    taskResponse: "Does not adequately address any part of the task\nDoes not express a clear position\nPresents few ideas, which are largely undeveloped or irrelevant",
    coherenceCohesion: "Does not organise ideas logically\nMay use a very limited range of cohesive devices, and those used may not indicate a logical relationship between ideas",
    lexicalResource: "Uses only a very limited range of words and expressions with very limited control of word formation and/or spelling\nErrors may severely distort the message",
    grammaticalRange: "Attempts sentence forms but errors in grammar and punctuation predominate and distort the meaning",
  },
  {
    band: 2,
    taskResponse: "Barely responds to the task\nDoes not express a position\nMay attempt to present one or two ideas but there is no development",
    coherenceCohesion: "Has very little control of organisational features",
    lexicalResource: "Uses an extremely limited range of vocabulary, essentially no control of word formation and/or spelling",
    grammaticalRange: "Cannot use sentence forms except in memorised phrases",
  },
  {
    band: 1,
    taskResponse: "Answer is completely unrelated to the task",
    coherenceCohesion: "Fails to communicate any message",
    lexicalResource: "Can only use a few isolated words",
    grammaticalRange: "Cannot use sentence forms at all",
  },
];

const TASK_2_BAND_DESCRIPTORS_VI: BandDescriptor[] = [
  {
    band: 9,
    taskResponse: "Đáp ứng đầy đủ tất cả các phần của đề bài\nTrình bày quan điểm được phát triển hoàn chỉnh với các ý tưởng liên quan, được mở rộng đầy đủ và được hỗ trợ tốt",
    coherenceCohesion: "Sử dụng liên kết một cách tự nhiên đến mức không gây chú ý\nQuản lý việc phân đoạn một cách khéo léo",
    lexicalResource: "Sử dụng vốn từ vựng phong phú với khả năng kiểm soát từ vựng rất tự nhiên và tinh tế; lỗi nhỏ hiếm gặp chỉ là 'sơ suất'",
    grammaticalRange: "Sử dụng đa dạng cấu trúc ngữ pháp với độ linh hoạt và chính xác cao; lỗi nhỏ hiếm gặp chỉ là 'sơ suất'",
  },
  {
    band: 8,
    taskResponse: "Đáp ứng đầy đủ tất cả các phần của đề bài\nTrình bày bài viết được phát triển tốt với các ý tưởng liên quan, được mở rộng và hỗ trợ",
    coherenceCohesion: "Sắp xếp thông tin và ý tưởng một cách logic\nQuản lý tốt mọi khía cạnh của liên kết\nSử dụng phân đoạn đầy đủ và phù hợp",
    lexicalResource: "Sử dụng vốn từ vựng phong phú một cách trôi chảy và linh hoạt để truyền đạt ý nghĩa chính xác\nSử dụng khéo léo các từ vựng ít phổ biến nhưng đôi khi có thể có sai sót trong lựa chọn từ và kết hợp từ\nHiếm khi mắc lỗi chính tả và/hoặc cấu tạo từ",
    grammaticalRange: "Sử dụng đa dạng cấu trúc ngữ pháp\nPhần lớn câu không có lỗi\nChỉ thỉnh thoảng mắc lỗi hoặc dùng từ không phù hợp",
  },
  {
    band: 7,
    taskResponse: "Đáp ứng tất cả các phần của đề bài\nTrình bày quan điểm rõ ràng xuyên suốt bài viết\nTrình bày, mở rộng và hỗ trợ các ý chính, nhưng có thể có xu hướng khái quát hóa quá mức và/hoặc các ý hỗ trợ có thể thiếu trọng tâm",
    coherenceCohesion: "Sắp xếp thông tin và ý tưởng một cách logic; có sự phát triển rõ ràng xuyên suốt\nSử dụng các phương tiện liên kết phù hợp dù có thể dùng thiếu hoặc thừa ở một số chỗ\nTrình bày chủ đề trung tâm rõ ràng trong mỗi đoạn văn",
    lexicalResource: "Sử dụng vốn từ vựng đủ phong phú để cho phép một mức độ linh hoạt và chính xác nhất định\nSử dụng các từ vựng ít phổ biến với nhận thức nhất định về phong cách và kết hợp từ\nĐôi khi có thể mắc lỗi trong lựa chọn từ, chính tả và/hoặc cấu tạo từ",
    grammaticalRange: "Sử dụng đa dạng cấu trúc phức tạp\nThường xuyên viết câu không có lỗi\nKiểm soát ngữ pháp và dấu câu tốt nhưng có thể mắc một vài lỗi",
  },
  {
    band: 6,
    taskResponse: "Đáp ứng tất cả các phần của đề bài dù một số phần có thể được triển khai đầy đủ hơn các phần khác\nTrình bày quan điểm phù hợp dù kết luận có thể không rõ ràng hoặc lặp lại\nTrình bày các ý chính phù hợp nhưng một số có thể được phát triển chưa đầy đủ/không rõ ràng",
    coherenceCohesion: "Sắp xếp thông tin và ý tưởng mạch lạc và có sự phát triển tổng thể rõ ràng\nSử dụng các phương tiện liên kết hiệu quả, nhưng liên kết trong và/hoặc giữa các câu có thể bị lỗi hoặc máy móc\nKhông phải lúc nào cũng sử dụng phép quy chiếu rõ ràng hoặc phù hợp\nSử dụng phân đoạn, nhưng không phải lúc nào cũng logic",
    lexicalResource: "Sử dụng vốn từ vựng đủ cho yêu cầu đề bài\nCố gắng sử dụng từ vựng ít phổ biến nhưng đôi khi không chính xác\nMắc một số lỗi chính tả và/hoặc cấu tạo từ, nhưng không cản trở giao tiếp",
    grammaticalRange: "Sử dụng kết hợp cả câu đơn giản và phức tạp\nMắc một số lỗi ngữ pháp và dấu câu nhưng hiếm khi ảnh hưởng đến giao tiếp",
  },
  {
    band: 5,
    taskResponse: "Chỉ đáp ứng một phần đề bài; định dạng có thể không phù hợp ở một số chỗ\nThể hiện quan điểm nhưng sự phát triển không phải lúc nào cũng rõ ràng và có thể không có kết luận\nTrình bày một số ý chính nhưng hạn chế và chưa được phát triển đầy đủ; có thể có chi tiết không liên quan",
    coherenceCohesion: "Trình bày thông tin có tổ chức nhưng có thể thiếu sự phát triển tổng thể\nSử dụng các phương tiện liên kết không đầy đủ, không chính xác hoặc quá nhiều\nCó thể lặp lại do thiếu phép quy chiếu và thay thế\nCó thể không viết theo đoạn, hoặc phân đoạn chưa đầy đủ",
    lexicalResource: "Sử dụng vốn từ vựng hạn chế, nhưng đủ tối thiểu cho yêu cầu đề bài\nCó thể mắc lỗi chính tả và/hoặc cấu tạo từ đáng chú ý, có thể gây khó khăn cho người đọc",
    grammaticalRange: "Chỉ sử dụng phạm vi cấu trúc hạn chế\nCố gắng viết câu phức nhưng thường kém chính xác hơn câu đơn\nCó thể thường xuyên mắc lỗi ngữ pháp và dấu câu có thể sai; lỗi có thể gây khó khăn cho người đọc",
  },
  {
    band: 4,
    taskResponse: "Chỉ đáp ứng đề bài ở mức tối thiểu hoặc câu trả lời lạc đề; định dạng có thể không phù hợp\nTrình bày quan điểm nhưng không rõ ràng\nTrình bày một số ý chính nhưng khó nhận diện và có thể lặp lại, không liên quan hoặc không được hỗ trợ tốt",
    coherenceCohesion: "Trình bày thông tin và ý tưởng nhưng không sắp xếp mạch lạc và không có sự phát triển rõ ràng\nSử dụng một số phương tiện liên kết cơ bản nhưng có thể không chính xác hoặc lặp lại\nCó thể không viết theo đoạn hoặc sử dụng đoạn văn gây khó hiểu",
    lexicalResource: "Chỉ sử dụng từ vựng cơ bản, có thể lặp đi lặp lại hoặc không phù hợp với yêu cầu đề bài\nKiểm soát hạn chế cấu tạo từ và/hoặc chính tả; lỗi có thể gây khó khăn cho người đọc",
    grammaticalRange: "Chỉ sử dụng phạm vi cấu trúc rất hạn chế, hiếm khi dùng mệnh đề phụ\nMột số cấu trúc chính xác nhưng lỗi chiếm phần lớn, dấu câu thường sai",
  },
  {
    band: 3,
    taskResponse: "Không đáp ứng đầy đủ bất kỳ phần nào của đề bài\nKhông thể hiện quan điểm rõ ràng\nTrình bày ít ý tưởng, phần lớn chưa được phát triển hoặc không liên quan",
    coherenceCohesion: "Không sắp xếp ý tưởng một cách logic\nCó thể sử dụng rất ít phương tiện liên kết, và những phương tiện được dùng có thể không thể hiện mối quan hệ logic giữa các ý",
    lexicalResource: "Chỉ sử dụng phạm vi từ ngữ và biểu đạt rất hạn chế, kiểm soát cấu tạo từ và/hoặc chính tả rất kém\nLỗi có thể làm sai lệch nghiêm trọng thông điệp",
    grammaticalRange: "Cố gắng viết câu nhưng lỗi ngữ pháp và dấu câu chiếm phần lớn và làm sai lệch ý nghĩa",
  },
  {
    band: 2,
    taskResponse: "Hầu như không đáp ứng đề bài\nKhông thể hiện quan điểm\nCó thể cố gắng trình bày một hoặc hai ý nhưng không có sự phát triển",
    coherenceCohesion: "Kiểm soát rất kém các đặc điểm tổ chức",
    lexicalResource: "Sử dụng phạm vi từ vựng cực kỳ hạn chế, về cơ bản không kiểm soát được cấu tạo từ và/hoặc chính tả",
    grammaticalRange: "Không thể sử dụng cấu trúc câu ngoại trừ các cụm từ đã học thuộc",
  },
  {
    band: 1,
    taskResponse: "Câu trả lời hoàn toàn không liên quan đến đề bài",
    coherenceCohesion: "Không truyền đạt được bất kỳ thông điệp nào",
    lexicalResource: "Chỉ có thể sử dụng một vài từ rời rạc",
    grammaticalRange: "Hoàn toàn không thể sử dụng cấu trúc câu",
  },
];

export function getTask1BandDescriptors(language: Language): BandDescriptor[] {
  return language === "vi" ? TASK_1_BAND_DESCRIPTORS_VI : TASK_1_BAND_DESCRIPTORS_EN;
}

export function getTask2BandDescriptors(language: Language): BandDescriptor[] {
  return language === "vi" ? TASK_2_BAND_DESCRIPTORS_VI : TASK_2_BAND_DESCRIPTORS_EN;
}

