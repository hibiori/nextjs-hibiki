import React, { useEffect } from 'react';
import getConfig from 'next/config';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

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

    useEffect(() => {
        setShops(firstViewShops);
    }, [firstViewShops]);
    
    const onSearchClick = async () => {
        const data = await fetchShops(keyword, code);
    
        setShops(data);
        setKeyword('');
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
            <TextField
            label="キーワードを入力してください"
            variant="standard"
            margin="normal"
            fullWidth
            value={keyword}
            onChange={(event) => {
                setKeyword(event.target.value);
            }}
            />
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
            検索
            </Button>
        </Box>
        <Box
             component="form"
             noValidate
             sx={{
               marginTop: 8,
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
             }}
        >
            <List>
               {shops.map((shop) => {
                 return (
                   <ListItem key={shop.id}>
                     <ListItemButton
                       onClick={() => {
                         // TODO: goto shop detail
                       }}
                     >
                       <ListItemAvatar>
                         <Avatar alt={shop.name} src={shop.logo_image} />
                       </ListItemAvatar>
                       <ListItemText
                         primary={`${shop.genre.name} ${shop.name}`}
                         secondary={
                           <>
                             <Typography variant="body1" component="span">
                               {`${shop.catch} ${shop.shop_detail_memo}`}
                             </Typography>
                             <Typography variant="caption">{shop.address}</Typography>
                           </>
                         }
                       />
                     </ListItemButton>
                   </ListItem>
                 );
               })}
            </List>
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