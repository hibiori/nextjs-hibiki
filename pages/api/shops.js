import getConfig from 'next/config';

const shops = async (req, res) => {
  const { HOTPEPPER_API_KEY } = getConfig().serverRuntimeConfig;
  console.log('req.query', req.query);
  const query = new URLSearchParams();
  query.set('key', HOTPEPPER_API_KEY);
  query.set('format', 'json');
  query.set('large_area', req.query.area || 'Z011');
  if (req.query.keyword) query.set('keyword', req.query.keyword);
  if (req.query.code) query.set('genre', req.query.code);
  if (req.query.id) {
    req.query.id.forEach((id) => {
      query.append('id', id);
    });
  }
  const response = await fetch(`https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?${query.toString()}`);
  const data = await response.json();

  return res.json(data.results.shop);
};

export default shops;
