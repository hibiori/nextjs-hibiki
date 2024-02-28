import getConfig from 'next/config';

const shops = async (req, res) => {
  const { HOTPEPPER_API_KEY } = getConfig().serverRuntimeConfig;

  const query = new URLSearchParams();
  query.set('key', HOTPEPPER_API_KEY);
  query.set('format', 'json');
  query.set('large_area', req.query.large_area || 'Z011');
  if (req.query.keyword) query.set('keyword', req.query.keyword);
  if (req.query.code) query.set('genre', req.query.code);

  const response = await fetch(`https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?${query.toString()}`);
  const data = await response.json();

  return res.json(data.results.shop);
};

export default shops;