const express = require('express');

const router = express.Router();

const mongoDB = require('../controllers/detail');
const { default: axios } = require('axios');

// 디테일 데이터(GET)
router.get('/:region/:id', async (req, res) => {
  const data = await mongoDB.getAlldetail(req.params);
  res.send(JSON.stringify(data));
});

// 해당 디테일 정보의 리뷰, 별점 데이터(GET)
router.get('/:id', async (req, res) => {
  const data = await mongoDB.getEtcdetail(req.params);
  res.send(JSON.stringify(data));
});

router.post('/:id', async (req, res) => {
  if (req.params.id !== 'undefined') {
    try {
      const id = req.params.id;
      const apiUrl = `https://apis.data.go.kr/B551011/KorService1/detailCommon1?serviceKey=rfaoGpiapHFqOcUT6bqfERRxy1WVxzOdOpEC3ChyAFPEfONdSMdRVNETTJKRhqTbPuZ2krpG2mQJMXDbyG74RA%3D%3D&MobileOS=ETC&MobileApp=TripLog&_type=json&contentId=${id}&defaultYN=Y&firstImageYN=N&areacodeYN=N&catcodeYN=N&addrinfoYN=N&mapinfoYN=N&overviewYN=Y`;

      const response = await axios.get(apiUrl, { withCredentials: true });

      if (response.data.response.header.resultCode === '0000') {
        const data = {
          homepage: '',
          overview: '',
        };
        res.json(data);
      } else {
        const data = {
          homepage: response.data.response.body.items.item[0].homepage,
          overview: response.data.response.body.items.item[0].overview,
        };
        res.json(data);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  }
});

module.exports = router;
