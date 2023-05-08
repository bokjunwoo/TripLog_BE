// 체크리스트 기본 설정 값
const checklist = {
  content: [
    {
      title: '기본 준비물',
      items: [
        { item: '의류', checked: false },
        { item: '세안용품', checked: false },
        { item: '상비약', checked: false },
        { item: '마스크', checked: false },
      ],
    },
    {
      title: '필수 준비물',
      items: [{ item: '숙소', checked: false }],
    },
    {
      title: '트립로그에서 챙기기',
      items: [
        { item: '여행 계획짜기', checked: false },
        { item: '가계부 작성', checked: false },
      ],
    },
    {
      title: '통신/교통 준비',
      items: [{ item: '여행지 교통편', checked: false }],
    },
    {
      title: '즐길거리 준비',
      items: [
        { item: '관광 정보 확인하기', checked: false },
        { item: '맛집 정보 확인하기', checked: false },
      ],
    },
  ],
};

module.exports = checklist;
