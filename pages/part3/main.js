import React, { useEffect } from 'react';
import getConfig from 'next/config';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import { CardMedia } from '@mui/material';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

const fetchShops = async (keyword, code) => {
  const { API_HOST } = getConfig().publicRuntimeConfig;

  const query = new URLSearchParams();
  if (keyword) query.set('keyword', keyword);
  if (code) query.set('code', code);

  const host = process.browser ? '' : API_HOST;
  const res = await fetch(`${host}/api/shops?${query.toString()}`);
  return await res.json();
};

const fetchGenres = async () => {
  const { API_HOST } = getConfig().publicRuntimeConfig;

  const host = process.browser ? '' : API_HOST;
  const res = await fetch(`${host}/api/genres`);
  return await res.json();
};

const Shops = ({ firstViewShops, genres }) => {
  const [keyword, setKeyword] = React.useState('');
  const [code, setCode] = React.useState(null);
  const [shops, setShops] = React.useState([]);
  console.log(shops);
  useEffect(() => {
    setShops(firstViewShops);
  }, [firstViewShops]);

  const onSearchClick = async () => {
    const data = await fetchShops(keyword, code);

    setShops(data);
    setKeyword('');
  };

  const [checked, setChecked] = React.useState(true);

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

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
  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        component="form"
        noValidate
        maxWidth="md"
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <FormControl fullWidth>
          <FormLabel id="genres">ジャンル</FormLabel>
          <RadioGroup row aria-labelledby="genres" name="genres">
            {genres.map((genre) => {
              return <FormControlLabel key={genre.id} value={genre.code} control={<Radio />} label={genre.name} />;
            })}
          </RadioGroup>
        </FormControl>
        <Button
          variant="contained"
          margin="normal"
          fullWidth
          onClick={() => {
            onSearchClick();
          }}
        >
          絞り込む
        </Button>
      </Box>

      <Grid container spacing={4}>
        {shops.map((shop) => {
          return (
            <Grid item xs={4}>
              <Card sx={{ maxWidth: 345 }} key={shop.id}>
                {/* ヘッダー */}
                <CardHeader avatar={<Avatar alt={shop.name} src={shop.logo_image}></Avatar>} title={shop.name} />
                {/*画像  */}
                <CardMedia component="img" height="200" src={shop.photo.pc.m} />
                {/* 文章 */}
                <CardContent>
                  <Typography variant="body2" color="text.secondary"></Typography>
                </CardContent>
                {/* お気に入りボタン */}
                <CardActions disableSpacing>
                  <IconButton aria-label="add to favorites">
                    <FavoriteIcon />
                  </IconButton>
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
            {randomShop && <img src={randomShop.photo.pc.m} alt={randomShop.name} style={{ maxWidth: '100%' }} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>閉じる</Button>
          </DialogActions>
        </Dialog>
        ;
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
          <Button variant="contained">お気に入り</Button>
        </Stack>
      </Box>
    </Container>
  );
};

export const getServerSideProps = async (req) => {
  const shops = await fetchShops(req.query.keyword, req.query.code);
  const genres = await fetchGenres();

  return {
    props: {
      firstViewShops: shops,
      genres,
    },
  };
};

export default Shops;
