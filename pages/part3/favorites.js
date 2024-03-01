import React, { useEffect } from 'react';
import getConfig from 'next/config';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import { CardMedia } from '@mui/material';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Link from 'next/link';
import CardContent from '@mui/material/CardContent';

const fetchShops = async (ids) => {
  const { API_HOST } = getConfig().publicRuntimeConfig;

  const query = new URLSearchParams();
  ids.forEach((id) => {
    query.append('id', id);
  });
  const host = process.browser ? '' : API_HOST;
  const res = await fetch(`${host}/api/shops?${query.toString()}`);
  console.log('query', query);
  return await res.json();
};

const fetchfavorites = async () => {
  const { API_HOST } = getConfig().publicRuntimeConfig;
  const host = process.browser ? '' : API_HOST;
  const res = await fetch(`${host}/api/favorites`);
  return await res.json();
};
const Shops = ({ firstViewShops }) => {
  const [shops, setShops] = React.useState([]);
  useEffect(() => {
    setShops(firstViewShops);
  }, [firstViewShops]);

  const handleCheckChange = (id) => {
    setShops((prevShops) => prevShops.map((shop) => (shop.id === id ? { ...shop, checked: !shop.checked } : shop)));
  };

  const handleSelectAll = () => {
    setShops((prevShops) => prevShops.map((shop) => ({ ...shop, checked: !allChecked })));
  };

  const allChecked = shops.every((shop) => shop.checked);

  const getRandomShop = (shops) => {
    const randomIndex = Math.floor(Math.random() * shops.length);
    return shops[randomIndex];
  };
  const [randomShop, setRandomShop] = React.useState(null);

  const handleSelectRandom = () => {
    const selectedShop = getRandomShop(shops.filter((shop) => shop.checked));
    setRandomShop(selectedShop);
  };

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container component="main" maxWidth="md">
      <Grid container spacing={4}>
        {shops.map((shop) => {
          return (
            <Grid item xs={4} key={shop.id}>
              <Card sx={{ maxWidth: 345, height: 400 }}>
                {/* ヘッダー */}
                <CardHeader avatar={<Avatar alt={shop.name} src={shop.logo_image}></Avatar>} title={shop.name} />
                {/*画像  */}
                <CardMedia component="img" height="200" src={shop.photo.pc.m} />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {/* <Typography variant="body1" component="span">
                      {`${shop.catch} ${shop.shop_detail_memo}`}
                    </Typography> */}
                    <Typography variant="caption">{shop.address}</Typography>
                  </Typography>
                </CardContent>

                <CardActions disableSpacing>
                  {/* チェックボックス */}
                  <Checkbox
                    checked={shop.checked || false}
                    onChange={() => handleCheckChange(shop.id)}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                </CardActions>
              </Card>
            </Grid>
          );
        })}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>ランダム結果</DialogTitle>
          <DialogContent sx={{ minWidth: 300 }}>
            <Typography variant="h6" align="center" gutterBottom>
              ランダムに選ばれたショップ
            </Typography>
            <Typography variant="h6" align="center" gutterBottom>
              {randomShop?.name}
            </Typography>
            {randomShop && <img src={randomShop.photo.pc.m} alt={randomShop.name} style={{ minWidth: '80%' }} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>閉じる</Button>
          </DialogActions>
        </Dialog>
      </Grid>
      <Box
        component="form"
        noValidate
        maxWidth="md"
        sx={{
          marginTop: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Stack spacing={2} direction="row">
          <Button variant="contained" onClick={handleSelectAll}>
            全選択
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleSelectRandom();
              handleClickOpen();
            }}
          >
            開始
          </Button>
          <Button variant="contained">
            <Link href="/part3/main">戻る</Link>
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export const getServerSideProps = async (req) => {
  const favorites = await fetchfavorites();
  const ids = favorites.map((e) => e.shop_id);
  const shops = await fetchShops(ids);
  return {
    props: {
      firstViewShops: shops,
    },
  };
};

export default Shops;
